import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CustomerCard } from '@/components/admin/CustomerCard';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/api/admin';
import { Customer } from '@/data/customers';
import { Search, Filter, Users, Loader2 } from 'lucide-react';

const categories = ['All', 'Good Customer', 'Self Employed', 'Bargainer', 'Risk', 'New Customer'];
const statuses = ['All', 'Approved', 'Pending', 'Rejected', 'Under Review'];

const CustomerList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');


  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const idMatch = customer.cust_id?.includes(searchQuery) || false;
      const phoneMatch = customer.phone?.includes(searchQuery) || false;

      const matchesSearch = nameMatch || idMatch || phoneMatch;

      const matchesCategory = selectedCategory === 'All' || customer.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || customer.loan_status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [customers, searchQuery, selectedCategory, selectedStatus]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-red-500">
          Failed to load customers. Please check backend connection.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold neon-text">Customers</h1>
              <p className="text-muted-foreground">Manage loan applications and customer data</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="data-card animate-fade-up-delay-1">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or phone..."
                className="input-field pl-11"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-auto"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field w-auto"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between animate-fade-up-delay-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredCustomers.length}</span> of {customers.length} customers
          </p>
          <div className="flex items-center gap-2">
            {selectedCategory !== 'All' && (
              <span className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary">
                {selectedCategory}
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="px-3 py-1 text-xs rounded-full bg-accent/20 text-accent">
                {selectedStatus}
              </span>
            )}
          </div>
        </div>

        {/* Customer Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-up-delay-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.cust_id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="data-card text-center py-16">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerList;
