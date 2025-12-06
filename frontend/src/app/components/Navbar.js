'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, Github } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-lg bg-slate-950/90 shadow-2xl border-b border-slate-800/80'
          : 'backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50 shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <ShieldCheck className="w-7 h-7 text-teal-500 transition-transform group-hover:scale-110 group-hover:rotate-6" />
            <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            TempMail Secure
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className="relative text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors group"
          >
            <Github className="w-4 h-4" />
            GitHub
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all group-hover:w-full" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative p-2 rounded-lg text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl">
          <div className="flex flex-col px-4 py-6 space-y-4">
            <Link
              href="/features"
              className="flex items-center px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-teal-400 transition-all font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-teal-400 transition-all font-medium"
              onClick={() => setMenuOpen(false)}
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}