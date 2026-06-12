import React from 'react';
import {
  BellIcon,
  SearchIcon,
  HexagonIcon,
  ChevronDownIcon } from
'lucide-react';
export function Navbar() {
  return (
    <nav className="bg-[#1a1060] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <HexagonIcon className="h-8 w-8 text-[#6c3fc5] fill-[#6c3fc5]" />
            <span className="text-xl font-bold tracking-wide">HIREHUB</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-white font-medium border-b-2 border-[#6c3fc5] pb-1">
              
              Dashboard
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors pb-1">
              
              Jobs
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors pb-1">
              
              Applicants
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors pb-1">
              
              Interviews
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors pb-1">
              
              Users
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors pb-1">
              
              Reports
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-5">
            <button className="text-white/70 hover:text-white transition-colors">
              <SearchIcon className="h-5 w-5" />
            </button>
            <button className="text-white/70 hover:text-white transition-colors relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1a1060]" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-full object-cover border border-white/20"
                  src="https://i.pravatar.cc/150?img=11"
                  alt="User avatar" />
                
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#1a1060]" />
              </div>
              <ChevronDownIcon className="h-4 w-4 text-white/70" />
            </div>
          </div>
        </div>
      </div>
    </nav>);

}