'use client';
import React, { useState } from 'react';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on md and up */}
        <div 
          className={`
            fixed h-screen z-20 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:w-64 w-64
          `}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <Header 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="p-6 dark:bg-black md:p-10 animate-fade-in md:ml-64">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;