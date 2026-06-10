/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, ShoppingBag, BookOpen, User, Sparkles, Search, Clock, X } from 'lucide-react';
import { Notification } from '../types';

interface NavigationProps {
  activeSpecies: 'dog' | 'cat' | 'both';
  setActiveSpecies: (species: 'dog' | 'cat' | 'both') => void;
  activeTab: 'talk' | 'shop' | 'learn' | 'profile';
  setActiveTab: (tab: 'talk' | 'shop' | 'learn' | 'profile') => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  unreadCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navigation({
  activeSpecies,
  setActiveSpecies,
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationsRead,
  unreadCount,
  searchQuery,
  setSearchQuery
}: NavigationProps) {

  const speciesOptions = [
    { value: 'dog' as const, label: 'Dogs', icon: '🐶' },
    { value: 'cat' as const, label: 'Cats', icon: '🐱' },
    { value: 'both' as const, label: 'Both', icon: '🐾' }
  ];

  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const autoSuggestTags = ['#nutrition', '#training', '#health', 'Luna', 'Bella', 'Charlie'];

  useEffect(() => {
    const saved = localStorage.getItem('pawpack_global_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const term = searchQuery.trim();
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('pawpack_global_searches', JSON.stringify(updated));
    setIsSearchFocused(false);
  };

  const handleSelectSearch = (term: string) => {
    setSearchQuery(term);
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('pawpack_global_searches', JSON.stringify(updated));
    setIsSearchFocused(false);
  };

  const removeSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('pawpack_global_searches', JSON.stringify(updated));
  };

  const filteredSuggestTags = autoSuggestTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  // Colors according to Active mode
  const getToggleBgColor = () => {
    if (activeSpecies === 'dog') return 'bg-[#F2CC8F] text-[#2C2C2A] shadow-[0_3px_10px_rgba(242,204,143,0.3)]';
    if (activeSpecies === 'cat') return 'bg-[#81B29A] text-[#2C2C2A] shadow-[0_3px_10px_rgba(129,178,154,0.3)]';
    return 'bg-[#3D405B] text-white shadow-[0_3px_10px_rgba(61,64,91,0.3)]';
  };

  return (
    <>
      {/* Persistent global header - Floating Glassmorphic Capsule */}
      <header className="fixed top-2 left-2 right-2 md:left-4 md:right-4 z-40 bg-white/95 backdrop-blur-md border border-[#D3D1C7]/70 h-14 rounded-2xl flex items-center justify-between px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
        {/* Branding (Touch Sensitive) */}
        <div 
          className="flex items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform" 
          onClick={() => setActiveTab('talk')}
        >
          <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white shadow-sm group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          </div>
          <span className="font-display font-extrabold text-[16px] tracking-tight text-[#3D405B] bg-linear-to-r from-[#3D405B] to-[#E07A5F] bg-clip-text text-transparent">
            PawPack
          </span>
        </div>

        {/* Global Species Toggle aligned in middle - Rounded Tactile switch */}
        <div className="flex-1 max-w-[140px] md:max-w-[190px] mx-1 md:mx-2 shrink-0">
          <div
            className="flex p-0.5 bg-[#FDFAF6]/80 rounded-full border border-[#D3D1C7]/60 h-8.5"
            aria-label="Filter by species"
          >
            {speciesOptions.map((opt) => {
              const isActive = activeSpecies === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveSpecies(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-full text-[10px] font-extrabold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? getToggleBgColor()
                      : 'text-[#888780] hover:text-[#2C2C2A] hover:bg-black/5'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="text-xs">{opt.icon}</span>
                  <span className="sr-only sm:not-sr-only sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Persistent Search Bar - high fidelity and tactile */}
        <div className="relative flex-1 max-w-[160px] sm:max-w-xs mx-1 md:mx-3" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search..."
              className="w-full h-8.5 pl-7.5 pr-3 text-[11px] font-semibold bg-[#FDFAF6]/80 rounded-full border border-[#D3D1C7]/60 text-[#3D405B] placeholder-[#888780]/80 focus:outline-none focus:ring-1 focus:ring-[#E07A5F] focus:border-[#E07A5F] transition-all"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
          </form>

          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-10 left-0 w-[240px] md:w-full bg-white border border-[#D3D1C7] rounded-xl shadow-lg z-50 overflow-hidden">
              {searchQuery.length > 0 && filteredSuggestTags.length > 0 && (
                <div className="p-2 border-b border-[#D3D1C7]/30">
                  <div className="text-[10px] font-bold text-[#888780] px-2 mb-1 uppercase tracking-wider">Suggestions</div>
                  {filteredSuggestTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleSelectSearch(tag)}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#FDFAF6] rounded-md text-xs font-semibold text-[#3D405B] flex items-center gap-2 cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-[#E07A5F]" /> {tag}
                    </button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-bold text-[#888780] px-2 mb-1 uppercase tracking-wider">Recent Searches</div>
                  {recentSearches.map((term, i) => (
                    <div key={i} className="group w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#FDFAF6] rounded-md cursor-pointer" onClick={() => handleSelectSearch(term)}>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#3D405B]">
                        <Clock className="w-3 h-3 text-[#888780]" /> {term}
                      </div>
                      <button onClick={(e) => removeSearch(e, term)} className="text-[#888780] hover:text-[#E07A5F] opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length === 0 && recentSearches.length === 0 && (
                <div className="p-4 text-center text-xs text-[#888780]">
                  No recent searches. Try searching for a specific breed or topic.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bell Action with slide down indicator - High-Interactive */}
        <div className="relative group shrink-0">
          <button
            onClick={onMarkNotificationsRead}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#FDFAF6] border border-transparent hover:border-[#D3D1C7]/50 transition-all cursor-pointer active:scale-90"
            title="Notification Center"
          >
            <Bell className={`w-4.5 h-4.5 text-[#3D405B] group-hover:rotate-12 transition-transform duration-200 ${unreadCount > 0 ? 'animate-bell-pulse' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E07A5F] text-[9px] font-extrabold text-white flex items-center justify-center animate-bounce shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Persistent global bottom bar - Rounded, Floating and tactile for Gen Z aesthetic */}
      <div className="fixed bottom-2 left-2 right-2 md:left-6 md:right-6 z-40 max-w-lg mx-auto">
        <nav className="bg-white/95 backdrop-blur-md border border-[#D3D1C7] h-15 rounded-2xl flex items-center justify-around px-2 py-1 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          
          {/* Talk Tab */}
          <button
            onClick={() => setActiveTab('talk')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all group cursor-pointer active:scale-90 ${
              activeTab === 'talk' 
                ? 'text-[#E07A5F] -translate-y-0.5 font-bold font-display' 
                : 'text-[#888780] hover:text-[#2C2C2A]'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 group-hover:rotate-6 group-hover:scale-115 transition-transform duration-200" />
              {activeTab === 'talk' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E07A5F] rounded-full animate-ping" />
              )}
            </div>
            <span className="font-sans text-[10px] mt-1 font-bold">Talk</span>
          </button>

          {/* Shop Tab */}
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all group cursor-pointer active:scale-90 ${
              activeTab === 'shop' 
                ? 'text-[#E07A5F] -translate-y-0.5 font-bold font-display' 
                : 'text-[#888780] hover:text-[#2C2C2A]'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 group-hover:-rotate-6 group-hover:scale-115 transition-transform duration-200" />
              {activeTab === 'shop' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E07A5F] rounded-full" />
              )}
            </div>
            <span className="font-sans text-[10px] mt-1 font-bold">Shop</span>
          </button>

          {/* Learn Tab */}
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all group cursor-pointer active:scale-90 ${
              activeTab === 'learn' 
                ? 'text-[#E07A5F] -translate-y-0.5 font-bold font-display' 
                : 'text-[#888780] hover:text-[#2C2C2A]'
            }`}
          >
            <div className="relative">
              <BookOpen className="w-5 h-5 group-hover:skew-x-3 group-hover:scale-115 transition-transform duration-200" />
              {activeTab === 'learn' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E07A5F] rounded-full" />
              )}
            </div>
            <span className="font-sans text-[10px] mt-1 font-bold">Learn</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all group cursor-pointer active:scale-90 ${
              activeTab === 'profile' 
                ? 'text-[#E07A5F] -translate-y-0.5 font-bold font-display' 
                : 'text-[#888780] hover:text-[#2C2C2A]'
            }`}
          >
            <div className="relative">
              <User className="w-5 h-5 group-hover:rotate-12 group-hover:scale-115 transition-transform duration-200" />
              {activeTab === 'profile' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E07A5F] rounded-full" />
              )}
            </div>
            <span className="font-sans text-[10px] mt-1 font-bold">Profile</span>
          </button>

        </nav>
      </div>
    </>
  );
}
