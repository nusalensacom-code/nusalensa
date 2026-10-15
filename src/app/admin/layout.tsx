'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Smartphone,
  FolderTree,
  GitBranch,
  Tags,
  UserCheck,
  Image as ImageIcon,
  Mail,
  BarChart3,
  FileEdit,
  Users,
  Compass,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

interface CurrentUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const isLoginPage = pathname ? pathname.startsWith('/admin/login') : false;

  useEffect(() => {
    if (!isLoginPage) {
      if (typeof window !== 'undefined') {
        const saved =
          localStorage.getItem('nusalensa_session_user') ||
          localStorage.getItem('updateyuk_session_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed) {
              setCurrentUser(parsed);
              return;
            }
          } catch (e) {}
        }
      }

      fetch('/api/auth/me')
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Not logged in');
        })
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {
          router.push('/admin/login');
        });
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nusalensa_session_user');
      localStorage.removeItem('updateyuk_session_user');
    }
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'AI Article Generator', href: '/admin/ai-writer', icon: Wand2 },
    { title: 'News Curator AI', href: '/admin/news-curator', icon: Sparkles },
    { title: 'Articles', href: '/admin/articles', icon: FileText },
    { title: 'Devices & Specs', href: '/admin/devices', icon: Smartphone },
    { title: 'Categories', href: '/admin/categories', icon: FolderTree },
    { title: 'Subcategories', href: '/admin/subcategories', icon: GitBranch },
    { title: 'Tags & Topics', href: '/admin/tags', icon: Tags },
    { title: 'Authors', href: '/admin/authors', icon: UserCheck },
    { title: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { title: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Editorial Review', href: '/admin/editorial', icon: FileEdit },
    { title: 'Users & Roles', href: '/admin/users', icon: Users },
    { title: 'Navigation Menu', href: '/admin/navigation', icon: Compass },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center space-x-2">
            <span className="font-black text-xl tracking-tight text-white">
              {siteConfig.name}
            </span>
            <span className="text-[10px] bg-brand-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider">
              GLOBAL CMS
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5 text-xs">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 font-medium"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          </Link>

          {currentUser && (
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0) : 'A'}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-200 truncate max-w-[130px] leading-tight">
                  {currentUser.name}
                </p>
                <span className="text-[10px] text-brand-400 font-mono uppercase tracking-wide">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center px-2.5 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors font-medium"
            title="Log out of CMS"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (250px) */}
        <aside className="hidden lg:block w-[250px] bg-white border-r border-slate-200 p-4 flex-shrink-0 min-h-[calc(100vh-53px)]">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Editorial & Content
              </p>
              <nav className="space-y-0.5">
                {navItems.slice(0, 8).map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                System & Settings
              </p>
              <nav className="space-y-0.5">
                {navItems.slice(8).map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-full bg-white h-full flex flex-col p-4 shadow-2xl z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="font-black text-lg tracking-tight text-slate-900">
                  {siteConfig.name} CMS
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-center space-x-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl mb-2"
                >
                  <span>Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
