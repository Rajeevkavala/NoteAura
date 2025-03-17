import { Progress } from "@/components/ui/progress";
import { Layout, Shield, Star, Zap, FileText } from "lucide-react";
import React from "react";
import UploadPdfDialog from "./UploadPdfDialog";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = () => {
  const { user } = useUser();
  const path = usePathname();

  // Ensure user is loaded before running queries
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Skip queries until userEmail is available
  const fileList = useQuery(api.fileStorage.getUserFiles, userEmail ? { userEmail } : "skip");
  const GetUserInfo = useQuery(api.user.GetUserInfo, userEmail ? { email: userEmail } : "skip");

  // Prevent rendering until user data is available
  if (!user) {
    return (
      <div className="shadow-lg pt-5 h-screen bg-white dark:bg-gray-900 w-64 animate-pulse">
        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-6"></div>
        <div className="px-3 flex flex-col gap-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-xl w-full"></div>
          <div className="absolute bottom-6 w-[85%] px-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mx-auto mb-3"></div>
            <Progress value={50} className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-lg pt-5 h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-all duration-300 ease-in-out w-64">
      <div>
        <h1 className="text-3xl text-center font-extrabold text-gray-900 dark:text-white">📒 NoteAura</h1>
      </div>
      <div className="mt-8 px-3 flex flex-col gap-4">
        <UploadPdfDialog isMaxFile={fileList?.length >= 5 && !GetUserInfo?.upgrade} />

        <Link href="/dashboard">
          <div
            className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 group
            ${path === "/dashboard" ? "bg-slate-200 dark:bg-gray-700" : "bg-transparent"}`}
          >
            <Layout className="group-hover:animate-spin w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">WorkSpace</h2>
          </div>
        </Link>

        <Link href="/dashboard/upgrade">
          <div
            className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 group
            ${path === "/dashboard/upgrade" ? "bg-slate-200 dark:bg-gray-700" : "bg-transparent"}`}
          >
            <Shield className="group-hover:animate-spin w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Upgrade</h2>
          </div>
        </Link>

        <div className="absolute bottom-6 w-[85%] px-3">
          {GetUserInfo?.upgrade ? (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 rounded-xl p-4 text-white shadow-lg transform hover:scale-102 transition-all duration-200">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 animate-pulse" />
                <h3 className="font-semibold">Premium Member</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{fileList?.length || 0} Files Stored</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>Unlimited Storage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Priority Support</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Progress
                value={(fileList?.length / 5) * 100}
                className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
              <p className="text-sm mt-2 text-center text-gray-800 dark:text-gray-200">
                {fileList?.length || 0} Out of 5 PDFs
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 text-center">
                Upgrade for more storage
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;