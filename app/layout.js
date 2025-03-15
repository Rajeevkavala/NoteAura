"use client";
import "./globals.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ProgressBar from "@/components/ui/ProgressBar"; // Import Progress Bar


export default function RootLayout({ children }) {
  return (
    <>
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body>
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
