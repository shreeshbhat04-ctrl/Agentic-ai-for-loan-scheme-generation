import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Calculator, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  Home as HomeIcon,
  Briefcase,
  GraduationCap,
  Wallet,
  TrendingUp,
  Star,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoanCard } from "@/components/LoanCard";
import { TrustBadge } from "@/components/TrustBadge";

const loanProducts = [
  {
    title: "Personal Loan",
    description: "For all your personal needs",
    features: ["No collateral required", "Minimal documentation", "Quick disbursement"],
    icon: <Wallet className="w-7 h-7" />,
    gradient: "personal" as const,
    interestRate: "10.5%",
    maxAmount: "₹40L",
  },
  {
    title: "Home Loan",
    description: "Make your dream home a reality",
    features: ["Up to 90% financing", "Flexible tenure", "Balance transfer facility"],
    icon: <HomeIcon className="w-7 h-7" />,
    gradient: "home" as const,
    interestRate: "8.5%",
    maxAmount: "₹5Cr",
  },
  {
    title: "Business Loan",
    description: "Fuel your business growth",
    features: ["Working capital support", "Equipment financing", "Overdraft facility"],
    icon: <Briefcase className="w-7 h-7" />,
    gradient: "business" as const,
    interestRate: "12%",
    maxAmount: "₹75L",
  },
  {
    title: "Education Loan",
    description: "Invest in your future",
    features: ["Cover tuition & living", "Moratorium period", "Tax benefits"],
    icon: <GraduationCap className="w-7 h-7" />,
    gradient: "education" as const,
    interestRate: "9.5%",
    maxAmount: "₹1Cr",
  },
];

const trustBadges = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "RBI Registered",
    description: "Fully compliant NBFC regulated by the Reserve Bank of India",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Quick Approval",
    description: "Get loan approval in as fast as 4 hours with minimal documentation",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "5 Lakh+ Customers",
    description: "Trusted by over 5 lakh customers across India",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Award Winning",
    description: "Recognized for excellence in digital lending innovation",
  },
];

const stats = [
  { value: "₹5000 Cr+", label: "Loans Disbursed" },
  { value: "5 Lakh+", label: "Happy Customers" },
  { value: "4.8/5", label: "Customer Rating" },
  { value: "15 Min", label: "Avg. Approval Time" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animated-blob w-96 h-96 bg-primary/20 top-20 -left-48" />
          <div className="animated-blob w-80 h-80 bg-accent/20 top-40 right-20" />
          <div className="animated-blob w-72 h-72 bg-info/20 bottom-20 left-1/3" />
        </div>

        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                Rated #1 Digital NBFC in India
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Financial Goals,{" "}
                <span className="text-primary">Our Priority</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Experience seamless digital lending with FinTrust NBFC. Get instant loan approvals, 
                competitive rates, and personalized service tailored to your needs.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/login">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/emi-calculator">
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate EMI
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image / Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-primary rounded-3xl p-8 text-primary-foreground shadow-large">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                        <TrendingUp className="w-7 h-7" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-primary-foreground/70">Your Loan Status</p>
                        <p className="text-lg font-semibold">Approved ✓</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-primary-foreground/70 text-sm">Loan Amount</p>
                      <p className="text-4xl font-bold">₹5,00,000</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-primary-foreground/20">
                      <div>
                        <p className="text-xs text-primary-foreground/70">Interest Rate</p>
                        <p className="font-semibold">10.5% p.a.</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-foreground/70">Tenure</p>
                        <p className="font-semibold">36 Months</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-foreground/70">Monthly EMI</p>
                        <p className="font-semibold">₹16,280</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-sm">Funds will be credited within 24 hours</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-large border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Approval Time</p>
                      <p className="font-semibold text-foreground">4 Hours</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-accent rounded-xl px-5 py-3 shadow-large"
                >
                  <p className="text-accent-foreground font-semibold">100% Digital Process</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <TrustBadge key={badge.title} {...badge} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Loan Product
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a range of loan products designed to meet your diverse financial needs with competitive rates and flexible terms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanProducts.map((product, i) => (
              <LoanCard key={product.title} {...product} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Your Loan in 3 Easy Steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined digital process makes getting a loan simpler than ever.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Apply Online",
                description: "Fill out our simple online application form with basic details and documents.",
              },
              {
                step: "02",
                title: "Quick Verification",
                description: "Our AI-powered system verifies your documents and assesses your eligibility instantly.",
              },
              {
                step: "03",
                title: "Get Funds",
                description: "Once approved, funds are disbursed directly to your bank account within 24 hours.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-card rounded-2xl p-8 border border-border shadow-soft hover:shadow-medium transition-all"
              >
                <span className="absolute -top-4 left-8 text-6xl font-bold text-primary/10">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-primary z-20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-3xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-96 h-96 rounded-full bg-primary-foreground -top-48 -left-48" />
              <div className="absolute w-64 h-64 rounded-full bg-primary-foreground -bottom-32 -right-32" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Join over 5 lakh satisfied customers who have achieved their financial goals with FinTrust NBFC.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="xl" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  asChild
                >
                  <Link to="/login">
                    Apply for Loan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="hero-outline" 
                  size="xl"
                  asChild
                >
                  <Link to="/ai-assistant">Talk to AI Assistant</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
