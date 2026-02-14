import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { customers } from '@/data/customers';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Users,
  IndianRupee,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Calculate stats from customer data
  const totalApplications = customers.length;
  const approved = customers.filter(c => c.loan_status === 'Approved').length;
  const rejected = customers.filter(c => c.loan_status === 'Rejected').length;
  const pending = customers.filter(c => c.loan_status === 'Pending').length;
  const underReview = customers.filter(c => c.loan_status === 'Under Review').length;
  
  const totalLoanAmount = customers.reduce((sum, c) => sum + (c.loan_amount || 0), 0);

  const recentApplications = customers.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="text-3xl font-extrabold neon-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">AI-driven loan system analytics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={<FileText className="w-5 h-5" />}
            variant="primary"
            className="animate-fade-up"
          />
          <StatCard
            title="Approved"
            value={approved}
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
            trend="up"
            trendValue="+12% this month"
            className="animate-fade-up-delay-1"
          />
          <StatCard
            title="Rejected"
            value={rejected}
            icon={<XCircle className="w-5 h-5" />}
            variant="danger"
            className="animate-fade-up-delay-2"
          />
          <StatCard
            title="Pending / Review"
            value={pending + underReview}
            icon={<Clock className="w-5 h-5" />}
            variant="warning"
            className="animate-fade-up-delay-3"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="data-card animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Loan Value</p>
                <p className="text-2xl font-bold font-mono">₹{(totalLoanAmount / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4 rounded-full" />
            </div>
          </div>

          <div className="data-card animate-fade-up-delay-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {((approved / totalApplications) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full" 
                style={{ width: `${(approved / totalApplications) * 100}%` }}
              />
            </div>
          </div>

          <div className="data-card animate-fade-up-delay-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold font-mono">4.2 hrs</p>
              </div>
            </div>
            <p className="text-xs text-success">↓ 15% faster than last week</p>
          </div>
        </div>

        {/* Recent Applications & Category Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="data-card animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Applications</h2>
              <button 
                onClick={() => navigate('/admin/customers')}
                className="text-sm text-primary hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-4">
              {recentApplications.map((customer, index) => (
                <div 
                  key={customer.cust_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/customer/${customer.cust_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{customer.cust_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      ₹{(customer.loan_amount || 0).toLocaleString('en-IN')}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      customer.loan_status === 'Approved' ? 'bg-success/20 text-success' :
                      customer.loan_status === 'Rejected' ? 'bg-destructive/20 text-destructive' :
                      customer.loan_status === 'Pending' ? 'bg-warning/20 text-warning' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {customer.loan_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="data-card animate-fade-up-delay-1">
            <h2 className="text-xl font-bold mb-6">Customer Categories</h2>

            <div className="space-y-4">
              {[
                { label: 'Good Customer', count: customers.filter(c => c.category === 'Good Customer').length, color: 'bg-success' },
                { label: 'Self Employed', count: customers.filter(c => c.category === 'Self Employed').length, color: 'bg-accent' },
                { label: 'Bargainer', count: customers.filter(c => c.category === 'Bargainer').length, color: 'bg-warning' },
                { label: 'Risk', count: customers.filter(c => c.category === 'Risk').length, color: 'bg-destructive' },
                { label: 'New Customer', count: customers.filter(c => c.category === 'New Customer').length, color: 'bg-primary' },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{cat.label}</span>
                      <span className="text-sm font-mono">{cat.count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(cat.count / totalApplications) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
