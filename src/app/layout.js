'use client';
import '../styles/globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { metadata } from './metadata';
import { AiOutlineLinkedin, AiOutlineMenu } from 'react-icons/ai';
import { FiGithub } from 'react-icons/fi';
import { MdOutlineMail } from 'react-icons/md';
import { BsMoon, BsSun } from 'react-icons/bs';
import { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarVisible, setSidebarVisible] = useState(pathname === '/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.className = storedTheme;

    const checkIfMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLinkClick = (e, href) => {
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);

    if (pathname === href) {
      e.preventDefault();
      setSidebarVisible(true);
      router.push('/');
    } else {
      setSidebarVisible(false);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(pathname === '/');
    }
  }, [pathname, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) setIsScrolled(mainElement.scrollTop > 50);
    };
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <html lang="en" className={theme}>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="relative h-screen" style={{ backgroundColor: 'var(--background)' }}>

          {/* Mobile Header */}
          {isMobile && !isSidebarVisible && (
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: 'var(--background)' }}>
              <button onClick={toggleMobileMenu} className="p-2">
                <AiOutlineMenu size={24} />
              </button>
              <button onClick={toggleTheme} className="p-2">
                {theme === 'light' ? <BsMoon size={20} /> : <BsSun size={20} />}
              </button>

              {isMobileMenuOpen && (
                <div ref={menuRef}
                  className="absolute top-full left-0 right-0 shadow-lg p-4 animate-slide-up"
                  style={{ backgroundColor: 'var(--background)' }}>
                  <nav className="flex flex-col gap-3">
                    <MobileNavLink href="/" pathname={pathname}
                      onClick={(e) => handleLinkClick(e, '/')}>Home</MobileNavLink>
                    <MobileNavLink href="/about" pathname={pathname}
                      onClick={(e) => handleLinkClick(e, '/about')}>About</MobileNavLink>
                    <MobileNavLink href="/work" pathname={pathname}
                      onClick={(e) => handleLinkClick(e, '/work')}>Projects</MobileNavLink>
                    <MobileNavLink href="/misc" pathname={pathname}
                      onClick={(e) => handleLinkClick(e, '/misc')}>More About Eno</MobileNavLink>
                  </nav>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-current/10">
                    <a href="mailto:enoch140303@gmail.com" className="p-2"><MdOutlineMail size={22} /></a>
                    <a href="https://www.linkedin.com/in/eno-liu-18779432a/" target="_blank" rel="noopener noreferrer" className="p-2">
                      <AiOutlineLinkedin size={22} /></a>
                    <a href="https://github.com/Eno-ow-zz" target="_blank" rel="noopener noreferrer" className="p-2">
                      <FiGithub size={20} /></a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle - fixed top left */}
          <button
            onClick={toggleTheme}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            {theme === 'light' ? <BsMoon size={16} /> : <BsSun size={16} />}
          </button>

          {/* Scroll-to-top button */}
          {!isSidebarVisible && (
            <button
              onClick={() => {
                const mainElement = document.querySelector('main');
                if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-opacity duration-300 ${
                isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              ↑
            </button>
          )}

          {/* Centered / Sidebar container */}
          <div
            className="absolute top-0 bottom-0 flex transition-all duration-700 ease-in-out"
            style={{
              left: isSidebarVisible ? '50%' : '0',
              transform: isSidebarVisible ? 'translateX(-50%)' : 'translateX(0)',
              width: isSidebarVisible
                ? (isMobile ? '100%' : 'auto')
                : (isMobile ? '100%' : '350px'),
            }}
          >
            <Sidebar
              isVisible={isSidebarVisible}
              pathname={pathname}
              onLinkClick={handleLinkClick}
              isMobile={isMobile}
              theme={theme}
            />
          </div>

          {/* Main Content */}
          <main
            className="absolute top-0 bottom-0 right-0 overflow-y-auto no-scrollbar transition-all duration-700 ease-in-out"
            style={{
              left: isSidebarVisible
                ? '100%'
                : (isMobile ? '0' : '350px'),
              paddingTop: isMobile && !isSidebarVisible ? '3.5rem' : '0',
              backgroundColor: 'var(--background)',
            }}
          >
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}

function Sidebar({ isVisible, pathname, onLinkClick, isMobile, theme }) {
  return (
    <aside
      className="flex flex-col h-screen overflow-y-auto no-scrollbar"
      style={{
        width: isMobile ? '100vw' : '350px',
        minWidth: isMobile ? '100vw' : '350px',
        backgroundColor: 'var(--background)',
        padding: isMobile ? '2rem 1.5rem' : '2rem',
      }}
    >
      {/* Upper section - name, links, nav */}
      <div className="flex flex-col items-center gap-6 pt-16">
        <div className="text-center">
          <h1
            className="font-title text-5xl md:text-6xl cursor-pointer transition-transform hover:scale-105"
            onClick={(e) => {
              if (pathname !== '/') onLinkClick(e, pathname);
            }}
          >
            Eno Liu
          </h1>
        </div>

        <SocialLinks isMobile={isMobile} />

        <nav className="flex flex-col items-center gap-3">
          <NavLink href="/about" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/about')}>
            About
          </NavLink>
          <NavLink href="/work" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/work')}>
            Projects
          </NavLink>
          <NavLink href="/misc" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/misc')}>
            More About Eno
          </NavLink>
        </nav>
      </div>

      {/* Avatar - pinned to very bottom */}
      <div className="flex justify-center mt-auto">
        <img
          src="/images/photos/ai-avatar.png"
          alt="Eno Liu"
          className="w-80 h-auto"
          draggable={false}
        />
      </div>

    </aside>
  );
}

function SocialLinks({ isMobile }) {
  return (
    <div className="flex items-center gap-6 mt-4">
      <a href="mailto:enoch140303@gmail.com"
        className="opacity-70 hover:opacity-100 transition-opacity">
        <MdOutlineMail size={22} />
      </a>
      <a href="https://www.linkedin.com/in/eno-liu-18779432a/" target="_blank" rel="noopener noreferrer"
        className="opacity-70 hover:opacity-100 transition-opacity">
        <AiOutlineLinkedin size={22} />
      </a>
      <a href="https://github.com/Eno-ow-zz" target="_blank" rel="noopener noreferrer"
        className="opacity-70 hover:opacity-100 transition-opacity">
        <FiGithub size={20} />
      </a>
    </div>
  );
}

function NavLink({ href, pathname, onClick, children }) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block text-lg transition-opacity duration-300 hover:opacity-100 ${
        isActive ? 'font-bold opacity-100' : 'opacity-50'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, pathname, onClick, children }) {
  return (
    <Link href={href} onClick={onClick}
      className={`block py-2 text-lg ${pathname === href ? 'font-bold' : ''}`}>
      {children}
    </Link>
  );
}

