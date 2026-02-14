import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ChatHistory } from '@/components/admin/ChatHistory';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, getChatHistory } from '@/api/admin';
import { Customer } from '@/data/customers';
import { MessageSquare, Search, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ChatLogs = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch all customers first to populate the list
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  // Get unique customer IDs from chat history logic is simplified here: 
  // We actually need a way to know WHICH customers have chats. 
  // For now, we'll list ALL customers, highlighting ones with chats could be a future enhancement.
  // Or, better, we filter customers locally.

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cust_id?.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const selectedCustomer = useMemo(() =>
    customers.find(c => c.cust_id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Fetch chats for selected customer
  const { data: selectedMessages = [], isLoading: isLoadingChats } = useQuery({
    queryKey: ['chat', selectedCustomerId],
    queryFn: () => getChatHistory(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold neon-text">Chat Logs</h1>
              <p className="text-muted-foreground">View customer conversation history</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="data-card animate-fade-up-delay-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">

              {filteredCustomers.map((customer) => (
                <div
                  key={customer.cust_id}
                  onClick={() => setSelectedCustomerId(customer.cust_id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${selectedCustomerId === customer.cust_id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {customer.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        ID: {customer.cust_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 data-card animate-fade-up-delay-2">
            {selectedCustomer ? (
              <>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedCustomer.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{selectedCustomer.cust_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/customer/${selectedCustomer.cust_id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-2">
                  {isLoadingChats ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                  ) : (
                    <ChatHistory messages={selectedMessages} customerName={selectedCustomer.name} />
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Customer</h3>
                <p className="text-muted-foreground">Choose a customer from the list to view their chat history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatLogs;
