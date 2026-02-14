import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
            A
          </div>
          <span className="font-bold">LoanAI Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-64 h-full glass border-r border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <p className="text-sm font-medium">{admin?.name}</p>
              <p className="text-xs text-muted-foreground">{admin?.role}</p>
            </div>
            <nav className="space-y-2">
              <a href="/admin/dashboard" className="nav-link block">Dashboard</a>
              <a href="/admin/customers" className="nav-link block">Customers</a>
              <a href="/admin/chat-logs" className="nav-link block">Chat Logs</a>
              <a href="/admin/analytics" className="nav-link block">Analytics</a>
            </nav>
            <button
              onClick={logout}
              className="nav-link w-full text-left text-destructive mt-6"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
};
