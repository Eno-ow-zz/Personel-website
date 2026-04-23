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
import ScratchAvatar from '@/components/ScratchAvatar';

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
        <div className="flex h-screen">

          {/* Mobile Header */}
          {isMobile && pathname !== '/' && (
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
                      onClick={(e) => handleLinkClick(e, '/work')}>Coding Projects</MobileNavLink>
                    <MobileNavLink href="/misc" pathname={pathname}
                      onClick={(e) => handleLinkClick(e, '/misc')}>Life Outside of Coding</MobileNavLink>
                  </nav>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-current/10">
                    <a href="mailto:your@email.com" className="p-2"><MdOutlineMail size={22} /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2">
                      <AiOutlineLinkedin size={22} /></a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2">
                      <FiGithub size={20} /></a>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Sidebar */}
          {(!isMobile || pathname === '/') && (
            <Sidebar
              isVisible={isSidebarVisible}
              pathname={pathname}
              onLinkClick={handleLinkClick}
              isMobile={isMobile}
              onToggleTheme={toggleTheme}
              theme={theme}
            />
          )}

          {/* Main Content */}
          <main
            className={`flex-1 overflow-y-auto no-scrollbar transition-all duration-500 ${
              isMobile && pathname !== '/' ? 'pt-14' : ''
            }`}
            style={{ backgroundColor: 'var(--background)' }}
          >
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}

function Sidebar({
  isVisible, pathname, onLinkClick, isMobile,
  onToggleTheme, theme,
}) {
  const [ellipseVisible, setEllipseVisible] = useState(true);
  const [sparklesVisible, setSparklesVisible] = useState([true, true, true]);

  useEffect(() => {
    let mainInterval;
    let blinkTimeout;

    const animateEllipse = () => {
      setEllipseVisible(false);
      blinkTimeout = setTimeout(() => {
        setSparklesVisible([false, false, false]);
        setTimeout(() => {
          setSparklesVisible([true, true, true]);
          setTimeout(() => setEllipseVisible(true), 500);
        }, 500);
      }, 1200);
    };

    const initialDelay = 1000 + Math.random() * 2000;
    const initialTimeout = setTimeout(() => {
      animateEllipse();
      mainInterval = setInterval(animateEllipse, 10000);
    }, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(mainInterval);
      clearTimeout(blinkTimeout);
    };
  }, []);

  return (
    <aside
      className={`sidebar-transition flex flex-col h-screen overflow-y-auto no-scrollbar ${
        isMobile ? 'w-full' : ''
      }`}
      style={{
        width: isMobile ? '100%' : isVisible ? '420px' : '280px',
        minWidth: isMobile ? '100%' : isVisible ? '420px' : '280px',
        backgroundColor: 'var(--background)',
        padding: isMobile ? '2rem 1.5rem' : '2rem',
      }}
    >
      {/* Theme Toggle */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onToggleTheme} className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
          {theme === 'light' ? <BsMoon size={16} /> : <BsSun size={16} />}
          {!isMobile && (
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          )}
        </button>
      </div>

      {/* Avatar + Dialogue */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <DialogueBox />

        {/* Name */}
        <div className="text-center">
          <h1
            className="font-title text-4xl md:text-5xl cursor-pointer transition-transform hover:scale-105"
            onClick={(e) => {
              if (pathname !== '/') onLinkClick(e, pathname);
            }}
          >
            Your Name
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-2 mt-4">
          <NavLink href="/about" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/about')} theme={theme}>
            About
          </NavLink>
          <NavLink href="/work" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/work')} theme={theme}>
            Coding Projects
          </NavLink>
          <NavLink href="/misc" pathname={pathname}
            onClick={(e) => onLinkClick(e, '/misc')} theme={theme}>
            Life Outside of Coding
          </NavLink>
        </nav>

        {/* Social Links */}
        <SocialLinks isMobile={isMobile} />
      </div>

    </aside>
  );
}

function SocialLinks({ isMobile }) {
  return (
    <div className="flex items-center gap-6 mt-4">
      <a href="mailto:your@email.com"
        className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <MdOutlineMail size={22} />
        {!isMobile && <span className="text-sm">Email</span>}
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <AiOutlineLinkedin size={22} />
        {!isMobile && <span className="text-sm">LinkedIn</span>}
      </a>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <FiGithub size={20} />
        {!isMobile && <span className="text-sm">GitHub</span>}
      </a>
    </div>
  );
}

function NavLink({ href, pathname, onClick, children, theme }) {
  const rotations = { '/about': 9, '/work': -8, '/misc': 5 };
  const rotation = rotations[href] || 0;

  const [isHovered, setIsHovered] = useState(false);
  const [wasActive, setWasActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isActive = pathname === href;

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    let timeout;
    if (isActive) {
      setWasActive(true);
    } else if (wasActive) {
      timeout = setTimeout(() => setWasActive(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [isActive, wasActive]);

  const showEllipse = (isActive || isHovered || wasActive) && !isMobile;

  return (
    <div className="relative flex items-center justify-center">
      {!isMobile && (
        <svg
          className="absolute pointer-events-none"
          width="200" height="60"
          viewBox="0 0 200 60"
          style={{
            transform: `rotate(${rotation}deg)`,
            opacity: showEllipse ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          <ellipse
            cx="100" cy="30" rx="95" ry="25"
            fill="none"
            stroke="var(--stroke-colour)"
            strokeWidth="var(--stroke-width)"
          />
        </svg>
      )}
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`relative block text-lg transition-[font-weight,letter-spacing] duration-500 ${
          isActive ? 'font-bold tracking-tighter' : ''
        }`}
      >
        {children}
      </Link>
    </div>
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

function DialogueBox() {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <ScratchAvatar
        topImage="/images/photos/ai-avatar.png"
        bottomImage="/images/photos/real-photo.png"
        size={280}
      />
    </div>
  );
}
