import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  CreditCard, 
  FileText, 
  Bell, 
  Download, 
  ChevronRight,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  IndianRupee,
  Percent,
  CalendarDays,
  AlertCircle,
  LogOut,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { formatCurrency, formatIndianNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCustomerDetail, type CustomerDetail, type Loan } from "@/lib/api/customer";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [customerData, setCustomerData] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadCustomerData();
  }, [user, navigate]);

  const loadCustomerData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await getCustomerDetail(user.custId);
      setCustomerData(data);
      if (data.loans && data.loans.length > 0) {
        setSelectedLoan(data.loans[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customerData || !user) {
    return null;
  }

  const loans = customerData.loans || [];
  const userData = {
    name: customerData.name,
    customerId: customerData.cust_id,
    email: customerData.phone, // Using phone as email placeholder
    mobile: customerData.phone,
    pan: customerData.aadhaar?.slice(0, 10) || "N/A",
    avatar: customerData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  };

  // Calculate EMI for a loan (simplified)
  const calculateEMI = (principal: number, rate: number, months: number): number => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    return Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
  };

  // Generate mock EMI schedule (in production, this would come from backend)
  const getEMISchedule = (loan: Loan) => {
    if (!loan.tenure_months || !loan.approved_amount || !loan.interest_rate) return [];
    const emi = calculateEMI(loan.approved_amount, loan.interest_rate, loan.tenure_months);
    const schedule = [];
    for (let i = 0; i < Math.min(4, loan.tenure_months); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      schedule.push({
        month: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        principal: Math.round(emi * 0.7),
        interest: Math.round(emi * 0.3),
        total: emi,
        status: "upcoming" as const,
      });
    }
    return schedule;
  };

  const emiSchedule = selectedLoan ? getEMISchedule(selectedLoan) : [];

  // Mock notifications (in production, this would come from backend)
  const notifications = [
    {
      id: 1,
      type: "payment" as const,
      title: "EMI Due Reminder",
      message: selectedLoan ? `Your loan EMI is due soon` : "No active loans",
      time: "2 hours ago",
      read: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back, {userData.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's an overview of your loan portfolio
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="dashboard-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {userData.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{userData.name}</h2>
                    <p className="text-muted-foreground text-sm">Customer ID: {userData.customerId}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                      <span>{userData.email}</span>
                      <span>{userData.mobile}</span>
                      <span>PAN: {userData.pan}</span>
                    </div>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>
              </motion.div>

              {/* Loan Status Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Your Active Loans
                </h3>

                {loans.length === 0 ? (
                  <div className="dashboard-card text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active loans found</p>
                    <Button className="mt-4" onClick={() => navigate('/ai-assistant')}>
                      Apply for a Loan
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {loans.map((loan) => {
                      const emi = loan.approved_amount && loan.interest_rate && loan.tenure_months
                        ? calculateEMI(loan.approved_amount, loan.interest_rate, loan.tenure_months)
                        : 0;
                      const progress = loan.tenure_months ? Math.min(100, ((loan.tenure_months - (loan.tenure_months * 0.5)) / loan.tenure_months) * 100) : 0;
                      
                      return (
                        <div
                          key={loan.loan_id}
                          onClick={() => setSelectedLoan(loan)}
                          className={`dashboard-card cursor-pointer transition-all ${
                            selectedLoan?.loan_id === loan.loan_id
                              ? "ring-2 ring-primary"
                              : "hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Loan #{loan.loan_id}</p>
                              <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(loan.approved_amount || loan.requested_amount)}
                              </p>
                            </div>
                            <Badge variant={loan.status === 'approved' ? 'success' : loan.status === 'pending' ? 'info' : 'destructive'}>
                              {loan.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Loan ID</span>
                              <span className="font-medium text-foreground">{loan.loan_id}</span>
                            </div>
                            {emi > 0 && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Monthly EMI</span>
                                  <span className="font-medium text-foreground">{formatCurrency(emi)}</span>
                                </div>
                                {loan.tenure_months && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tenure</span>
                                    <span className="font-medium text-foreground">{loan.tenure_months} months</span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Progress Bar */}
                            {loan.tenure_months && (
                              <div className="pt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Loan Details */}
              {selectedLoan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="dashboard-card"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Loan Details - Loan #{selectedLoan.loan_id}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <IndianRupee className="w-4 h-4" />
                        Principal
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(selectedLoan.approved_amount || selectedLoan.requested_amount)}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Percent className="w-4 h-4" />
                        Interest Rate
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {selectedLoan.interest_rate ? `${selectedLoan.interest_rate}% p.a.` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <CalendarDays className="w-4 h-4" />
                        Tenure
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {selectedLoan.tenure_months ? `${selectedLoan.tenure_months} Months` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <IndianRupee className="w-4 h-4" />
                        Status
                      </div>
                      <p className="text-xl font-bold text-foreground capitalize">
                        {selectedLoan.status}
                      </p>
                    </div>
                  </div>

                  {/* Outstanding */}
                  {selectedLoan.sanction_letter_path && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sanction Letter</p>
                          <p className="text-sm font-medium text-primary">
                            Available for download
                          </p>
                        </div>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download Letter
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* EMI Schedule Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="dashboard-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming EMI Schedule
                  </h3>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Month</th>
                        <th className="pb-3 font-medium text-right">Principal</th>
                        <th className="pb-3 font-medium text-right">Interest</th>
                        <th className="pb-3 font-medium text-right">Total EMI</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emiSchedule.map((emi, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium text-foreground">{emi.month}</td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formatCurrency(emi.principal)}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {formatCurrency(emi.interest)}
                          </td>
                          <td className="py-3 text-right font-semibold text-foreground">
                            {formatCurrency(emi.total)}
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant="info">
                              <Clock className="w-3 h-3 mr-1" />
                              Upcoming
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="dashboard-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </h3>
                  <Badge variant="secondary">{notifications.filter((n) => !n.read).length} new</Badge>
                </div>

                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border ${
                        notif.read
                          ? "bg-background border-border"
                          : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            notif.type === "payment"
                              ? "bg-warning/10 text-warning"
                              : notif.type === "offer"
                              ? "bg-info/10 text-info"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {notif.type === "payment" ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : notif.type === "offer" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full mt-4" size="sm">
                  View All Notifications
                </Button>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="dashboard-card"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>

                <div className="space-y-2">
                  {[
                    { icon: Download, label: "Download Loan Statement", action: () => {} },
                    { icon: FileText, label: "Request NOC Certificate", action: () => {} },
                    { icon: CreditCard, label: "Pay EMI Now", action: () => {} },
                    { icon: User, label: "Update Profile", action: () => {} },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-foreground">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-primary rounded-2xl p-6 text-primary-foreground"
              >
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Our AI assistant is available 24/7 to answer your questions.
                </p>
                <Button
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => window.location.href = "/ai-assistant"}
                >
                  Chat with AI Assistant
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
