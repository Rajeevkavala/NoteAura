"use client"
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="div">
      <h1>Hello This Note Aura</h1>
      <Button>Click Me</Button>

      <UserButton/>
    </div>
  );
}
