'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Globe,
  Menu,
  X,
  User,
  Clock,
  Briefcase,
  ShieldCheck,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/utils/translations';

interface NavbarProps {
  onOpenEnquiry?: () => void;
  onCartClick?: () => void;
}

export function Navbar({ onOpenEnquiry, onCartClick }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].navbar;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close customer menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const navLinks = [
    { href: '/', label: t.home, active: pathname === '/' },
    { href: '/about', label: t.about, active: pathname === '/about' },
    { href: '/services', label: t.services, active: pathname.startsWith('/services') },
    { href: '/projects', label: t.projects, active: pathname.startsWith('/projects') },
    {
      href: '/businesses',
      label: t.ourBusinesses,
      active: pathname.startsWith('/businesses') || pathname.startsWith('/our-businesses'),
    },
    { href: '/contact', label: t.contact, active: pathname === '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs py-3'
          : 'bg-white/90 backdrop-blur-xs py-3.5 sm:py-4'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 md:px-10 lg:px-12 flex items-center justify-between">
        {/* Left Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[13px] font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors tracking-tight whitespace-nowrap relative py-1 ${
                link.active
                  ? 'text-[#2A835F] font-bold after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#2A835F] after:rounded-full'
                  : 'text-[#0F172A] hover:text-[#2A835F]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center Brand Logo: KK Group Named Logo */}
        <Link
          href="/"
          className="flex items-center select-none hover:opacity-90 transition-opacity"
        >
          <img
            src="/logos/named-logo-bg.png"
            alt="KK Group"
            className="h-7 sm:h-8 md:h-9 w-auto object-contain transition-transform hover:scale-[1.02]"
          />
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Button */}
          <button
            type="button"
            title={t.search}
            aria-label="Search"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:text-[#2A835F] hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Profile Avatar with Stylish Customer Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              title="Account"
              className={`w-8 h-8 rounded-full overflow-hidden border shadow-xs transition-all flex items-center justify-center bg-slate-100 cursor-pointer ${
                userMenuOpen
                  ? 'border-[#2A835F] ring-2 ring-[#2A835F]/20'
                  : 'border-slate-200/90 hover:border-[#2A835F]'
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User profile"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Stylish Customer Menu Popover */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white/98 backdrop-blur-2xl border-2 border-slate-200/90 rounded-2xl p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2A835F] block">
                    {language === 'ml' ? 'കസ്റ്റമർ പോർട്ടൽ' : 'Customer Account'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    KK Group Client
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#EBF6F1] hover:text-[#2A835F] transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>{language === 'ml' ? 'ഡാഷ്‌ബോർഡ്' : 'Customer Dashboard'}</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#EBF6F1] hover:text-[#2A835F] transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#2A835F]" />
                    <span>{language === 'ml' ? 'ബുക്കിംഗ് ട്രാക്കിംഗ്' : 'Track My Bookings'}</span>
                  </Link>

                  <div className="h-px bg-slate-100 my-1" />

                  <Link
                    href="/worker/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'ml' ? 'വർക്കർ പോർട്ടൽ' : 'Worker Portal'}</span>
                  </Link>

                  <Link
                    href="/office-staff/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'ml' ? 'സ്റ്റാഫ് പോർട്ടൽ' : 'Staff Portal'}</span>
                  </Link>

                  <div className="h-px bg-slate-100 my-1" />

                  <Link
                    href="/auth/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    <span>{language === 'ml' ? 'ലോഗിൻ / രജിസ്റ്റർ' : 'Sign In / Register'}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Enquiry / Get Quote Button (Styled to #2A835F Emerald Palette) */}
          <button
            type="button"
            onClick={onOpenEnquiry}
            aria-label="Service Enquiry"
            className="flex items-center gap-1.5 bg-[#2A835F] hover:bg-[#236D4F] text-white px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <span>{t.enquireBtn}</span>
          </button>

          {/* Bilingual Language Switcher Button (Customer Portal) */}
          <button
            type="button"
            onClick={toggleLanguage}
            title={language === 'en' ? 'മലയാളത്തിലേക്ക് മാറ്റുക' : 'Switch to English'}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#2A835F]" />
            <span
              className={`transition-colors text-[11px] ${
                language === 'en' ? 'text-[#2A835F] font-black' : 'opacity-65'
              }`}
            >
              EN
            </span>
            <span className="opacity-25">|</span>
            <span
              className={`transition-colors text-[11px] ${
                language === 'ml' ? 'text-[#2A835F] font-black' : 'opacity-65'
              }`}
            >
              മലയാളം
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-800 hover:text-[#2A835F] transition-all cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white border-t border-slate-100 px-6 py-5 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600">Language / ഭാഷ:</span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-[#EBF6F1] border border-[#C3E6D5] text-[#2A835F] rounded-full px-3 py-1 text-xs font-bold shadow-xs cursor-pointer"
            >
              <Globe className="w-3 h-3 text-[#2A835F]" />
              <span className={language === 'en' ? 'font-black' : ''}>EN</span>
              <span className="opacity-30">|</span>
              <span className={language === 'ml' ? 'font-black' : ''}>മലയാളം</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-3 rounded-xl transition-all ${
                  link.active
                    ? 'bg-[#EBF6F1] text-[#2A835F] font-bold'
                    : 'text-slate-800 hover:bg-slate-50 hover:text-[#2A835F] font-semibold'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenEnquiry?.();
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2A835F] hover:bg-[#236D4F] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{t.enquireBtn}</span>
          </button>
        </div>
      )}
    </header>
  );
}
