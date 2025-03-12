"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const ProgressBar = () => {
  const pathname = usePathname(); // Detects route changes

  useEffect(() => {
    NProgress.start(); // Start progress bar when pathname changes

    const timer = setTimeout(() => {
      NProgress.done(); // Stop progress bar after a short delay
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.done(); // Ensure progress bar stops on unmount
    };
  }, [pathname]);

  return null;
};

export default ProgressBar;
