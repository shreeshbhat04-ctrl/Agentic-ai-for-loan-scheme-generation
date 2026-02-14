import { Customer } from '@/data/customers';
import { cn } from '@/lib/utils';
import { User, Phone, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerCardProps {
  customer: Customer;
}

const categoryColors: Record<string, string> = {
  'Good Customer': 'bg-success/20 text-success border-success/30',
  'Bargainer': 'bg-warning/20 text-warning border-warning/30',
  'Risk': 'bg-destructive/20 text-destructive border-destructive/30',
  'Self Employed': 'bg-accent/20 text-accent border-accent/30',
  'New Customer': 'bg-primary/20 text-primary border-primary/30',
};

const statusStyles: Record<string, string> = {
  'Approved': 'status-approved',
  'Pending': 'status-pending',
  'Rejected': 'status-rejected',
  'Under Review': 'bg-primary/20 text-primary border border-primary/30',
};

export const CustomerCard = ({ customer }: CustomerCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="data-card hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/admin/customer/${customer.cust_id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{customer.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">ID: {customer.cust_id}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{customer.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="w-4 h-4" />
          <span>Credit Score: <span className={cn(
            'font-semibold',
            customer.credit_score >= 750 ? 'text-success' : 
            customer.credit_score >= 650 ? 'text-warning' : 'text-destructive'
          )}>{customer.credit_score || 'N/A'}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <span className={cn('status-badge', categoryColors[customer.category])}>
          {customer.category}
        </span>
        {customer.loan_status && (
          <span className={cn('status-badge', statusStyles[customer.loan_status])}>
            {customer.loan_status}
          </span>
        )}
      </div>

      {customer.pre_approved_limit > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Pre-approved Limit</p>
          <p className="text-lg font-bold text-primary font-mono">
            ₹{customer.pre_approved_limit.toLocaleString('en-IN')}
          </p>
        </div>
      )}
    </div>
  );
};
