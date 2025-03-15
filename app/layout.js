"use client";
import "./globals.css";
import { Poppins } from "next/font/google"; 
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ProgressBar from "@/components/ui/ProgressBar"; // Import Progress Bar


const poppins = Poppins({ subsets: ["latin"], weight: "400", display: "swap" });

export default function RootLayout({ children }) {
  return (
    <>
    <ClerkProvider afterSignOutUrl="https://noteaura.vercel.app/">
      <html lang="en">
        <body className={poppins.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Provider>
              <ProgressBar /> {/* Add Progress Bar */}
              {children}
            </Provider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
    </>
  );
}
