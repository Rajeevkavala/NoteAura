"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, X, CheckCircle, Zap, FileText, Shield } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Plans = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingPaypal, setIsLoadingPaypal] = useState(false);
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const upgradeUserPlan = useMutation(api.user.userUpgradePlan);
  const { user } = useUser();

  const userPlan = useQuery(api.user.GetUserInfo, {
    email: user?.primaryEmailAddress?.emailAddress,
  });

  useEffect(() => {
    const preloadRazorpay = async () => {
      const loaded = await loadRazorpayScript();
      if (loaded) {
        setIsRazorpayReady(true);
      } else {
        toast.error("Failed to load Razorpay. Please try again.");
      }
    };
    preloadRazorpay();
  }, []);

  const handleUpgradeClick = (e) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsLoadingPaypal(false);
    setIsLoadingRazorpay(false);
  };

  const handleRazorpayPayment = async () => {
    if (!isRazorpayReady) {
      toast.error("Razorpay is not ready yet. Please wait or try again.");
      return;
    }

    setIsLoadingRazorpay(true);
    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 29900, currency: "INR" }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.id) throw new Error("Invalid order data received");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "NoteAura Pro Plan",
        description: "Upgrade to Pro for unlimited access",
        order_id: data.id,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch("/api/verify-razorpay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              const errorText = await verifyResponse.text();
              throw new Error(`Verification failed: ${verifyResponse.status} - ${errorText}`);
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              await upgradeUserPlan({
                email: user?.primaryEmailAddress?.emailAddress,
              });
              toast.success("Payment successful! You are now a Pro user.");
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error(`Payment verification failed: ${error.message}`);
          } finally {
            setIsDialogOpen(false);
            setIsLoadingRazorpay(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: user?.phoneNumbers?.[0]?.phoneNumber || "",
        },
        theme: { color: "#6366F1" },
        modal: { ondismiss: () => setIsLoadingRazorpay(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsLoadingRazorpay(false);
      });
      setTimeout(() => rzp.open(), 100);
    } catch (error) {
      console.error("Razorpay Error:", error);
      toast.error(`Payment failed: ${error.message}`);
      setIsLoadingRazorpay(false);
    }
  };

  const onPaymentSuccess = async () => {
    setIsLoadingPaypal(true);
    try {
      await upgradeUserPlan({
        email: user?.primaryEmailAddress?.emailAddress,
      });
      toast.success("Payment successful! You are now a Pro user.");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("PayPal upgrade error:", error);
      toast.error("Failed to upgrade plan");
    } finally {
      setIsLoadingPaypal(false);
    }
  };

  if (userPlan === undefined) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">Loading your plan...</p>
      </div>
    );
  }

  const isProUser = userPlan?.upgrade;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {isProUser ? (
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-xl p-6 sm:p-8 shadow-lg transform hover:scale-105 transition-all duration-300">
            <CheckCircle className="h-12 w-12 text-white mx-auto mb-4 animate-pulse" />
            <h2 className="font-bold text-2xl sm:text-3xl text-white">
              Welcome, Pro Member!
            </h2>
            <p className="text-white mt-3 text-sm sm:text-base max-w-md mx-auto">
              You’re unlocking the full power of NoteAura with unlimited uploads, advanced AI tools, and priority support.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-white">
                <FileText className="w-5 h-5" />
                <span>Unlimited PDF Uploads</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-white">
                <Zap className="w-5 h-5 animate-bounce" />
                <span>Advanced AI Features</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-white">
                <Shield className="w-5 h-5" />
                <span>Priority Support</span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-full bg-white text-indigo-600 px-6 py-2 font-semibold hover:bg-indigo-100 transition-colors duration-200"
            >
              Back to Workspace
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h2 className="font-bold text-2xl sm:text-3xl text-center dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-center text-gray-600 mt-2 dark:text-gray-300 max-w-2xl mx-auto">
            Upgrade to Pro for unlimited PDF uploads, advanced AI features, and enhanced productivity tools.
          </p>
          <div className="mx-auto max-w-4xl mt-6 sm:mt-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Free Plan */}
              <div className="rounded-2xl border border-gray-300 dark:border-gray-600 p-5 sm:p-6 shadow-md bg-white dark:bg-gray-800 transition-transform duration-200 hover:scale-105">
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Free
                  </h2>
                  <p className="mt-2">
                    <strong className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      ₹0
                    </strong>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="mt-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li>✔️ Upload up to 5 PDFs</li>
                  <li>✔️ Basic AI-powered note generation</li>
                  <li>✔️ Community support</li>
                  <li>✔️ Access to help center</li>
                </ul>
                <Link
                  href="/dashboard"
                  className="mt-5 block rounded-full border border-indigo-600 px-5 py-2 text-center text-indigo-600 hover:ring-1 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Start for Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="rounded-2xl border border-indigo-600 p-5 sm:p-6 shadow-md ring-1 ring-indigo-600 bg-white dark:bg-gray-800 transition-transform duration-200 hover:scale-105">
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Pro
                  </h2>
                  <p className="mt-2">
                    <strong className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      ₹299
                    </strong>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      /month
                    </span>
                  </p>
                </div>
                <ul className="mt-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li>✔️ Unlimited PDF uploads</li>
                  <li>✔️ Advanced AI summarization & MCQs</li>
                  <li>✔️ Priority email support</li>
                  <li>✔️ Early access to new features</li>
                </ul>
                <button
                  onClick={handleUpgradeClick}
                  className="mt-5 w-full rounded-full bg-indigo-600 text-white py-2 hover:bg-indigo-700 disabled:bg-indigo-400 transition-all duration-200"
                  disabled={isLoadingPaypal || isLoadingRazorpay}
                >
                  {isLoadingPaypal || isLoadingRazorpay ? "Processing..." : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Payment Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <PayPalButtons
              onApprove={onPaymentSuccess}
              createOrder={(data, actions) =>
                actions.order.create({
                  purchase_units: [{ amount: { value: "3.99", currency_code: "USD" } }],
                })
              }
              disabled={isLoadingPaypal || isLoadingRazorpay}
            />
            <Button
              onClick={handleRazorpayPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:bg-green-400 transition-all duration-200"
              disabled={isLoadingPaypal || isLoadingRazorpay || !isRazorpayReady}
            >
              <CreditCard className="h-5 w-5" />
              {isLoadingRazorpay
                ? "Processing..."
                : !isRazorpayReady
                ? "Loading Razorpay..."
                : "Pay with Razorpay"}
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="w-full"
              disabled={isLoadingPaypal || isLoadingRazorpay}
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;