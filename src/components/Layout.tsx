import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Factory, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['staff', 'manager', 'admin'] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['staff', 'manager', 'admin'] },
  { path: '/stock-movement', label: 'Stock Movement', icon: ArrowLeftRight, roles: ['staff', 'manager', 'admin'] },
  { path: '/production', label: 'Production', icon: Factory, roles: ['staff', 'manager', 'admin'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['manager', 'admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (loading) return null;

  const filteredNav = navItems.filter(item => item.roles.includes(profile?.role || ''));

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#141414] h-screen sticky top-0">
        <div className="p-6 border-bottom border-[#141414]">
          <h1 className="font-mono text-xl font-bold tracking-tighter uppercase italic">IPMRI</h1>
          <p className="text-[10px] uppercase opacity-50 font-mono tracking-widest">Inventory Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#141414] text-[#E4E3E0]' 
                    : 'hover:bg-[#141414] hover:text-[#E4E3E0]'
                }`}
              >
                <Icon size={18} />
                <span className="font-mono text-sm uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#141414]">
          <div className="bg-[#f0f0f0] p-4 font-mono text-[11px] mb-4">
            <div className="flex justify-between uppercase opacity-50 mb-1">
              <span>Status</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="truncate uppercase font-bold">{profile?.name}</div>
            <div className="uppercase opacity-50">{profile?.role}</div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full font-mono text-sm uppercase tracking-wide hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#141414] sticky top-0 z-50">
        <h1 className="font-mono text-lg font-bold tracking-tighter italic">IPMRI</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 bg-white z-40 p-10 pt-20"
          >
            <nav className="space-y-4">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-2xl font-mono uppercase tracking-widest border-b border-[#141414] pb-2"
                  >
                    <Icon size={24} />
                    {item.label}
                  </Link>
                );
              })}
              <button 
                onClick={() => auth.signOut()}
                className="flex items-center gap-4 text-2xl font-mono uppercase tracking-widest text-red-500 pt-4"
              >
                <LogOut size={24} />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
