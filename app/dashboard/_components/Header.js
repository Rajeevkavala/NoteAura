import { ModeToggle } from '@/components/ui/toggle';
import { UserButton } from '@clerk/nextjs';
import React from 'react';
import { Menu, X } from 'lucide-react';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  return (
    <div className="shadow-md flex justify-between items-center gap-4 p-4 bg-white dark:bg-gray-900 dark:text-white dark:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-all duration-300 sticky top-0 z-10">
      {/* Hamburger Menu Button - Visible only on mobile */}
      <button 
        className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transform hover:scale-110 transition-all duration-200"
        onClick={onMenuClick}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Spacer to push right-side content when hamburger is hidden */}
      <div className="hidden md:block flex-1"></div>

      {/* Right-side content - Visible on all screen sizes */}
      <div className="flex items-center gap-4">
        <div className="transform hover:scale-110 transition-all duration-200">
          <ModeToggle />
        </div>
        <div className="transform hover:scale-110 transition-all duration-200">
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>
    </div>
  );
};

export default Header;