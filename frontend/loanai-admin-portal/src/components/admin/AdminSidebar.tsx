import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/chat-logs', label: 'Chat Logs', icon: MessageSquare },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 glass border-r border-border p-6 hidden md:flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-neon animate-pulse-glow">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold">LoanAI</h2>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Admin Info */}
      <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
        <p className="text-sm font-medium">{admin?.name}</p>
        <p className="text-xs text-muted-foreground">{admin?.role}</p>
        <p className="text-xs text-primary font-mono mt-1">ID: {admin?.bankerId}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-link flex items-center gap-3',
                isActive && 'nav-link-active'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="nav-link flex items-center gap-3 text-destructive hover:bg-destructive/10 mt-4"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </aside>
  );
};
