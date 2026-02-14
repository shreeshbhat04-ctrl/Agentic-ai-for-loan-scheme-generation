import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [bankerId, setBankerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bankerId.length !== 9) {
      toast.error('Invalid Banker ID', {
        description: 'Please enter a valid 9-digit Banker ID',
      });
      return;
    }

    if (!/^\d+$/.test(bankerId)) {
      toast.error('Invalid Format', {
        description: 'Banker ID must contain only numbers',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(bankerId);
    
    if (success) {
      toast.success('Login Successful', {
        description: 'Welcome to LoanAI Admin Portal',
      });
      navigate('/admin/dashboard');
    } else {
      toast.error('Login Failed', {
        description: 'Invalid credentials',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md animate-fade-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-neon mb-4 animate-pulse-glow">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold neon-text">LoanAI Admin</h1>
          <p className="text-muted-foreground mt-2">Banker Portal Access</p>
        </div>

        {/* Login Card */}
        <div className="data-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Banker ID
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={bankerId}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setBankerId(value);
                  }}
                  placeholder="Enter 9-digit Banker ID"
                  className="input-field pl-11 font-mono text-lg tracking-wider"
                  maxLength={9}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {bankerId.length}/9 digits
                </p>
                {bankerId.length === 9 && (
                  <p className="text-xs text-success">✓ Valid format</p>
                )}
              </div>
            </div>

            {/* Visual ID Display */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-10 rounded-lg flex items-center justify-center font-mono text-lg transition-all duration-200 ${
                    bankerId[i]
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-secondary border-2 border-border text-muted-foreground'
                  }`}
                >
                  {bankerId[i] || '•'}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={bankerId.length !== 9 || isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-neon hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-6 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo: Use any 9-digit number (e.g., 123456789)
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL Encrypted • RBI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
