import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, ArrowRight, CheckCircle, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-neon">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">LoanAI</span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#home" className="hover:text-foreground transition">Home</a>
              <a href="#features" className="hover:text-foreground transition">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition">How it Works</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/login"
                className="text-sm px-4 py-2 rounded-md hover:bg-secondary transition"
              >
                Admin Login
              </Link>
              <button className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:brightness-110 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-36">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-6/12 space-y-6 animate-fade-up">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight neon-text">
                Get approved faster — AI-powered loans in minutes
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg">
                LoanAI uses secure KYC, automated income assessment and risk scoring to deliver 
                customized loan offers — instant eligibility checks, transparent EMIs, and safe disbursals.
              </p>

              <div className="flex items-center gap-4">
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-neon hover:scale-[1.02] transition flex items-center gap-2">
                  Check Eligibility
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-5 py-3 rounded-lg border border-border hover:bg-secondary transition">
                  View Loan Offers
                </button>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  98% Document Accuracy
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  1–10 min Processing
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="w-full lg:w-6/12 relative animate-fade-up-delay-1">
              <div className="data-card relative animate-float">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
                  <div>LoanAI • Secure</div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Live Demo
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-secondary/30">
                  <h4 className="font-semibold">Estimated Offer Preview</h4>
                  <p className="text-muted-foreground text-sm mt-1">Personal Loan — Fast track</p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background/50">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold font-mono">₹2,50,000</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50">
                      <p className="text-xs text-muted-foreground">Tenure</p>
                      <p className="text-xl font-bold font-mono">36 mo</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50">
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="text-xl font-bold font-mono">12.5%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50">
                      <p className="text-xs text-muted-foreground">EMI</p>
                      <p className="text-xl font-bold font-mono text-success">₹9,950</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold">
                      Apply Now
                    </button>
                    <button className="px-3 py-2 border border-border rounded-md hover:bg-secondary transition">
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'AI-driven Eligibility',
              desc: 'Instant checks using verified income parsing, document OCR and scoring models.',
            },
            {
              icon: <Lock className="w-6 h-6" />,
              title: 'Secure & Compliant',
              desc: 'End-to-end encryption, GDPR ready deletion flows, and secure audits.',
            },
            {
              icon: <TrendingUp className="w-6 h-6" />,
              title: 'Fast Disbursals',
              desc: 'Automated approvals and payout pipelines for fastest fund delivery.',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`data-card hover:scale-[1.02] transition-all animate-fade-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
                  {feature.icon}
                </div>
                <h4 className="font-semibold">{feature.title}</h4>
              </div>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="stat-card">
              <h3 className="text-3xl font-bold text-primary font-mono">1.2M+</h3>
              <p className="text-muted-foreground">Applications processed</p>
            </div>
            <div className="stat-card">
              <h3 className="text-3xl font-bold text-primary font-mono">92%</h3>
              <p className="text-muted-foreground">Avg approval accuracy</p>
            </div>
            <div className="stat-card">
              <h3 className="text-3xl font-bold text-success font-mono">99%</h3>
              <p className="text-muted-foreground">Data extraction accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center neon-text">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Upload KYC',
              desc: 'Securely upload Aadhaar, PAN and income proof — OCR reads and validates instantly.',
            },
            {
              step: '2',
              title: 'AI Assessment',
              desc: 'Income parsing, credit checks and policy rules determine eligibility.',
            },
            {
              step: '3',
              title: 'Offer & Disburse',
              desc: 'Choose offers, e-sign and receive funds through secure payout rails.',
            },
          ].map((item, i) => (
            <div key={item.step} className="data-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-sm text-primary font-semibold mb-2">Step {item.step}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Admin CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="data-card text-center">
          <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Banker Portal</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Access the admin dashboard to manage loan applications, view customer data, and process approvals.
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-neon hover:scale-[1.02] transition"
          >
            <Users className="w-4 h-4" />
            Access Admin Portal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold">LoanAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LoanAI — All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
