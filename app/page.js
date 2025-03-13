"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);
  
  // State to manage loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      CheckUser();
    }
  }, [user]);

  const CheckUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createUser({
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user?.imageUrl ?? "",
        userName: user?.fullName ?? "",
      });

      console.log(result); // Handle result further if needed
    } catch (err) {
      setError("Error creating user.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="div">
      <h1>Hello, This is Note Aura</h1>
      <Button disabled={loading}>
        <Link href="/dashboard" passHref>
          <a>Go to Dashboard</a>
        </Link>
      </Button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <UserButton />
    </div>
  );
}
