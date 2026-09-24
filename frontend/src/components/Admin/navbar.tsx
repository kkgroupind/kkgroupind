'use client';
import NextLink from 'next/link';
import { Search, Bell, Settings, MessageSquare, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-[#0D0E12] flex items-center justify-between px-4 lg:px-8 border-b border-gray-800 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-100 transition-colors bg-[#1A1C23] rounded-lg shadow-sm border border-gray-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative w-full max-w-md hidden sm:flex items-center bg-[#1A1C23] rounded-full p-1 border border-gray-800">
          <div className="pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search something..."
            className="block w-full pl-3 pr-4 py-2 border-none bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0"
          />
          <button className="bg-[#2A2D35] hover:bg-[#3A3D45] text-gray-300 text-xs font-medium px-4 py-1.5 rounded-full transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-6 ml-4">
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <button className="sm:hidden p-2 text-gray-400 hover:text-gray-100 transition-colors bg-[#1A1C23] rounded-full">
            <Search className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-1 bg-[#1A1C23] rounded-full p-1 border border-gray-800">
             <button className="p-2 text-[#7B4DFF] bg-[#2A2D35] rounded-full transition-colors">
               <Sun className="w-4 h-4" />
             </button>
             <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-full">
               <Moon className="w-4 h-4" />
             </button>
          </div>

          <div className="flex items-center gap-2 bg-[#1A1C23] rounded-full p-1 border border-gray-800 px-2">
            <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#7B4DFF] rounded-full"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <NextLink
              href="/admin/settings"
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title="Admin Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </NextLink>
          </div>
        </div>
      </div>
    </header>
  );
}
