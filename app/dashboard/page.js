"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import UploadPdfDialog from "./_components/UploadPdfDialog"; // Assuming this is your upload dialog component

const Dashboard = () => {
  const { user } = useUser();
  const fileList = useQuery(api.fileStorage.getUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });
  
  // State for managing loading effect on link click
  const [loading, setLoading] = useState(false);

  const handleLinkClick = () => {
    setLoading(true);
  };

  return (
    <div className="h-[100vh]">
      <div className="container mx-auto px-4 py-8 relative">
        <h2 className="font-bold text-3xl mb-8 text-gray-900 dark:text-white tracking-tight">
          Workspace
        </h2>

        {/* Floating Upload Button for Mobile */}
        <div className="md:hidden fixed bottom-6 right-6 z-20">
          <UploadPdfDialog isMaxFile={fileList?.length >= 5}>
            <button
              className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r 
                from-blue-500 to-purple-500 shadow-lg text-white 
                hover:shadow-xl transform hover:scale-110 transition-all duration-300 
                disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              disabled={fileList?.length >= 5}
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </UploadPdfDialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {fileList?.length > 0 ? (
            fileList?.map((file) => (
              <Link
                key={file.fileId}
                href={`/workspace/${file.fileId}`}
                passHref
                onClick={handleLinkClick} // Trigger loading state on click
              >
                <div
                  className="group relative p-6 shadow-lg rounded-lg 
                    flex flex-col items-center justify-between h-[180px]
                    border bg-white dark:bg-gray-800 
                    border-gray-200 dark:border-gray-700
                    hover:shadow-xl transform transition-all duration-300
                    hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-gray-100/0 to-gray-100/20 
                    group-hover:from-gray-100/20 group-hover:to-gray-100/40 
                    dark:from-gray-800/0 dark:to-gray-800/20 
                    dark:group-hover:from-gray-800/20 dark:group-hover:to-gray-800/40 
                    transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Image
                        src={"/pdf.png"}
                        alt="file"
                        width={40}
                        height={40}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h2
                      className="mt-4 font-semibold text-lg text-gray-900 dark:text-white 
                      text-center line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 
                      transition-colors duration-300"
                    >
                      {file.fileName}
                    </h2>
                  </div>
                </div>
              </Link>
            ))
          ) : fileList === undefined ? (
            Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="p-6 rounded-lg flex flex-col items-center justify-between
                  h-[180px] bg-gray-100 dark:bg-gray-700 animate-pulse
                  border border-gray-200 dark:border-gray-600"
              >
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full w-[48px] h-[48px]" />
                <div className="mt-4 w-32 h-6 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            ))
          ) : (
            <div
              className="col-span-full flex flex-col items-center justify-center py-16
              text-gray-500 dark:text-gray-400"
            >
              <svg
                className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg">No files found</p>
            </div>
          )}
        </div>
      </div>

      {/* Show loading state if true */}
      {loading && (
        <div className="fixed inset-0 bg-white opacity-50 z-50 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
