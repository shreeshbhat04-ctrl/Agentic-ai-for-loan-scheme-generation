import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { customers } from '@/data/customers';
import { BarChart3, TrendingUp, Users, IndianRupee, PieChart, Activity } from 'lucide-react';

const Analytics = () => {
  const totalCustomers = customers.length;
  const avgCreditScore = Math.round(
    customers.filter(c => c.credit_score > 0).reduce((sum, c) => sum + c.credit_score, 0) / 
    customers.filter(c => c.credit_score > 0).length
  );
  const totalPreApproved = customers.reduce((sum, c) => sum + c.pre_approved_limit, 0);
  const approvalRate = (customers.filter(c => c.loan_status === 'Approved').length / totalCustomers) * 100;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold neon-text">Analytics</h1>
              <p className="text-muted-foreground">Loan portfolio insights and metrics</p>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            className="animate-fade-up"
          />
          <StatCard
            title="Avg Credit Score"
            value={avgCreditScore}
            icon={<Activity className="w-5 h-5" />}
            variant="success"
            className="animate-fade-up-delay-1"
          />
          <StatCard
            title="Pre-approved Value"
            value={`₹${(totalPreApproved / 100000).toFixed(1)}L`}
            icon={<IndianRupee className="w-5 h-5" />}
            variant="primary"
            className="animate-fade-up-delay-2"
          />
          <StatCard
            title="Approval Rate"
            value={`${approvalRate.toFixed(0)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
            trend="up"
            trendValue="+5% vs last month"
            className="animate-fade-up-delay-3"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Loan Distribution */}
          <div className="data-card animate-fade-up">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Category Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Good Customer', value: 2, color: 'bg-success', percent: 20 },
                { label: 'Self Employed', value: 2, color: 'bg-accent', percent: 20 },
                { label: 'Bargainer', value: 2, color: 'bg-warning', percent: 20 },
                { label: 'Risk', value: 2, color: 'bg-destructive', percent: 20 },
                { label: 'New Customer', value: 2, color: 'bg-primary', percent: 20 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.value} ({item.percent}%)</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Score Distribution */}
          <div className="data-card animate-fade-up-delay-1">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Credit Score Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-end justify-between h-40 gap-2">
                {[
                  { range: '0-549', count: 2, height: 25 },
                  { range: '550-649', count: 0, height: 5 },
                  { range: '650-749', count: 2, height: 25 },
                  { range: '750-799', count: 4, height: 50 },
                  { range: '800+', count: 2, height: 25 },
                ].map((bar) => (
                  <div key={bar.range} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500"
                      style={{ height: `${bar.height}%` }}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">{bar.range}</p>
                    <p className="text-xs font-mono">{bar.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="data-card animate-fade-up-delay-2">
          <h3 className="text-lg font-bold mb-6">Monthly Application Trend</h3>
          <div className="flex items-end justify-between h-48 gap-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [60, 75, 45, 90, 70, 85];
              return (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-lg transition-all duration-500 hover:from-primary/70 hover:to-primary"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <p className="text-sm text-muted-foreground mt-3">{month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
