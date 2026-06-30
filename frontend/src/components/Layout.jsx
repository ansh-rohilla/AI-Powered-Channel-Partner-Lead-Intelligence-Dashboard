import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  LineChart, 
  FileText, 
  Bell, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { authService } from '../services/api';

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user data dynamically
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { 
        name: 'Ansh Rohilla', 
        role: 'Sales Operations Director', 
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80' 
      };
    } catch (e) {
      return { 
        name: 'Ansh Rohilla', 
        role: 'Sales Operations Director', 
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80' 
      };
    }
  });

  // Verify session validity on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        }
      }
    };

    if (localStorage.getItem('token')) {
      checkSession();
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout call failed/offline, clearing local session anyway.', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Initialize theme from localStorage or system setting (default dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Partners', path: '/partners', icon: Users },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'AI Insights', path: '/insights', icon: LineChart },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  // Helper to format breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const item = navItems.find(i => i.path === path);
    return item ? item.name : 'System';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-200">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#090d16]/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } relative z-30`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0e1422] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-md z-40"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200/60 dark:border-b-white/5 gap-3">
          <img src={logo} alt="Vyana Logo" className="w-8 h-8 object-contain rounded-lg shadow-lg" />
          {!collapsed && (
            <span className="font-outfit font-bold text-lg tracking-wider bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Vyana AI
            </span>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-medium shadow-inner border border-slate-200/50 dark:border-white/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Glowing active bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand-primary rounded-r-md shadow-[0_0_8px_#6366f1]" />
                    )}
                    <Icon size={18} className={`transition-all duration-200 group-hover:scale-105 ${isActive ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-850 dark:group-hover:text-slate-300'}`} />
                    {!collapsed && <span className="font-outfit text-sm tracking-wide">{item.name}</span>}
                    
                    {/* Tooltip on collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 shadow-md border border-slate-200 dark:border-white/5 whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"}
              alt="Profile Avatar"
              className="w-9 h-9 rounded-xl object-cover border border-brand-primary/20 shadow-md shadow-brand-primary/10 shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 shrink-0"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#090d16] border-r border-slate-200/60 dark:border-white/5 z-50 md:hidden transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-200/60 dark:border-white/5 gap-3">
          <img src={logo} alt="Vyana Logo" className="w-8 h-8 object-contain rounded-lg shadow-lg" />
          <span className="font-outfit font-bold text-lg text-slate-900 dark:text-white">Vyana AI</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-medium border border-slate-200/50 dark:border-white/5' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
                  }`
                }
              >
                <Icon size={18} />
                <span className="font-outfit text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"}
              alt="Profile Avatar"
              className="w-9 h-9 rounded-xl object-cover border border-brand-primary/20 shadow-md shadow-brand-primary/10 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-slate-200/60 dark:border-b-white/5 bg-slate-50/40 dark:bg-[#070b13]/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white md:hidden hover:bg-slate-100/40 dark:hover:bg-slate-900/40"
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Vyana Portal</span>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition-all hover:bg-slate-200 dark:hover:bg-slate-900/60"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition-all relative hover:bg-slate-200 dark:hover:bg-slate-900/60">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_6px_#6366f1]" />
            </button>

            {/* Quick Stats overview pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/10 text-[10px] font-semibold text-slate-650 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_4px_#10b981]" />
              ML ENGINE ACTIVE
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
