import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import MenuIcon from './icons/MenuIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  user: User;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, searchQuery, onSearchChange, theme, onToggleTheme, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-light-gray/80 dark:bg-navy/80 backdrop-blur-sm w-full h-16 flex items-center px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleSidebar} className="p-2 rounded-full hover:bg-medium-gray/60 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-bharat-blue">
          <MenuIcon className="h-6 w-6 text-dark-gray dark:text-light-gray" />
        </button>
        <div className="flex items-center">
            <svg className="h-8 w-8 text-bharat-orange" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <polyline points="3 7 12 13 21 7" />
            </svg>
            <span className="text-2xl font-semibold text-navy dark:text-light-gray ml-2 hidden sm:inline">Bharat Mail</span>
        </div>
      </div>
      <div className="flex-1 mx-4 lg:mx-16">
        <div className="relative">
          <input
            type="search"
            placeholder="Search mail"
            className="w-full h-12 bg-white dark:bg-gray-800 rounded-full pl-12 pr-4 text-dark-gray dark:text-light-gray border border-transparent focus:outline-none focus:ring-2 focus:ring-bharat-blue dark:placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-gray dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
         <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-medium-gray/60 dark:hover:bg-gray-700" aria-label="Toggle theme">
          {theme === 'light' ? <MoonIcon className="w-6 h-6 text-dark-gray" /> : <SunIcon className="w-6 h-6 text-yellow-300" />}
        </button>
        <button className="p-2 rounded-full hover:bg-medium-gray/60 dark:hover:bg-gray-700 relative">
            <svg className="w-6 h-6 text-dark-gray dark:text-light-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-light-gray dark:ring-navy"></span>
        </button>
        <button onClick={() => setIsDropdownOpen(prev => !prev)} className="ml-2">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-10 w-10 rounded-full border-2 border-bharat-blue"
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-14 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-medium-gray dark:border-gray-700 z-20">
            <div className="p-4 border-b border-medium-gray dark:border-gray-700">
              <p className="font-semibold text-navy dark:text-light-gray truncate">{user.name}</p>
              <p className="text-sm text-dark-gray dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 rounded-md text-dark-gray dark:text-gray-300 hover:bg-light-gray dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
