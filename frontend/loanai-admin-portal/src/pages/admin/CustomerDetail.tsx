import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ChatHistory } from '@/components/admin/ChatHistory';
import { DocumentViewer } from '@/components/admin/DocumentViewer';
import { getCustomerDetail, getChatHistory } from '@/api/admin';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  IndianRupee,
  Shield,
  MessageSquare,
  FileText,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomerDetail = () => {
  const { custId } = useParams<{ custId: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', custId],
    queryFn: () => getCustomerDetail(custId!),
    enabled: !!custId
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chat', custId],
    queryFn: () => getChatHistory(custId!),
    enabled: !!custId
  });

  if (isLoadingCustomer) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      </AdminLayout>
    )
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="data-card text-center py-16">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Customer Not Found</h3>
          <p className="text-muted-foreground mb-6">The customer ID "{custId}" does not exist.</p>
          <button
            onClick={() => navigate('/admin/customers')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Back to Customers
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statusStyles: Record<string, string> = {
    'Approved': 'bg-success/20 text-success border-success/30',
    'Pending': 'bg-warning/20 text-warning border-warning/30',
    'Rejected': 'bg-destructive/20 text-destructive border-destructive/30',
    'Under Review': 'bg-primary/20 text-primary border-primary/30',
  };

  const categoryColors: Record<string, string> = {
    'Good Customer': 'bg-success/20 text-success',
    'Bargainer': 'bg-warning/20 text-warning',
    'Risk': 'bg-destructive/20 text-destructive',
    'Self Employed': 'bg-accent/20 text-accent',
    'New Customer': 'bg-primary/20 text-primary',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4 animate-fade-up">
          <button
            onClick={() => navigate('/admin/customers')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground font-mono">Customer ID: {customer.cust_id}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="data-card animate-fade-up">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-neon">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{customer.name}</h2>
                    <span className={cn('status-badge', categoryColors[customer.category])}>
                      {customer.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {customer.age} yrs, {customer.gender}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs">Credit Score</span>
                  </div>
                  <p className={cn(
                    'text-2xl font-bold font-mono',
                    customer.credit_score >= 750 ? 'text-success' :
                      customer.credit_score >= 650 ? 'text-warning' : 'text-destructive'
                  )}>
                    {customer.credit_score || 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-xs">Pre-approved</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary">
                    ₹{(customer.pre_approved_limit / 1000).toFixed(0)}K
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs">Interest Rate</span>
                  </div>
                  <p className="text-2xl font-bold font-mono">
                    {customer.interest_options[0] || 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs">Aadhaar</span>
                  </div>
                  <p className="text-lg font-bold font-mono">
                    XXXX-{customer.aadhaar.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Loan Status Card */}
            <div className="data-card animate-fade-up-delay-1">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Loan Application
              </h3>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Requested Amount</p>
                  <p className="text-3xl font-bold font-mono">
                    ₹{(customer.loan_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <span className={cn(
                    'status-badge text-base px-4 py-2',
                    statusStyles[customer.loan_status || 'Pending']
                  )}>
                    {customer.loan_status || 'Pending'}
                  </span>
                </div>
              </div>

              {customer.interest_options.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Available Interest Options</p>
                  <div className="flex gap-2">
                    {customer.interest_options.map((rate) => (
                      <span key={rate} className="px-4 py-2 rounded-lg bg-primary/20 text-primary font-mono">
                        {rate}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="data-card animate-fade-up-delay-2">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents
              </h3>
              <DocumentViewer documents={customer.documents} customerId={customer.cust_id} />
            </div>
          </div>

          {/* Right Column - Chat History */}
          <div className="space-y-6">
            <div className="data-card animate-fade-up-delay-3">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat History
              </h3>
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <ChatHistory messages={chatMessages} customerName={customer.name} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="data-card animate-fade-up-delay-3">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-3 rounded-xl bg-success/20 text-success font-semibold hover:bg-success/30 transition-colors">
                  Approve Loan
                </button>
                <button className="w-full py-3 rounded-xl bg-warning/20 text-warning font-semibold hover:bg-warning/30 transition-colors">
                  Request Documents
                </button>
                <button className="w-full py-3 rounded-xl bg-destructive/20 text-destructive font-semibold hover:bg-destructive/30 transition-colors">
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerDetail;
