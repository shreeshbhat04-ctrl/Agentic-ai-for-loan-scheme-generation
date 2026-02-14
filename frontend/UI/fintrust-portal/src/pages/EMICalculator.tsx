import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, IndianRupee, Percent, CalendarDays, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { calculateEMI, formatCurrency, formatIndianNumber } from "@/lib/utils";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenure, setTenure] = useState(36);

  const result = useMemo(() => {
    return calculateEMI(loanAmount, interestRate, tenure);
  }, [loanAmount, interestRate, tenure]);

  // Calculate pie chart percentages
  const principalPercent = (loanAmount / result.totalPayable) * 100;
  const interestPercent = (result.totalInterest / result.totalPayable) * 100;

  // Generate amortization preview
  const amortizationPreview = useMemo(() => {
    const schedule = [];
    let remainingPrincipal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;

    for (let i = 0; i < Math.min(tenure, 12); i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = result.emi - interestPayment;
      remainingPrincipal -= principalPayment;

      schedule.push({
        month: i + 1,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(remainingPrincipal)),
      });
    }

    return schedule;
  }, [loanAmount, interestRate, tenure, result.emi]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animated-blob w-96 h-96 bg-primary/10 top-40 -right-48" />
          <div className="animated-blob w-80 h-80 bg-accent/10 bottom-20 -left-40" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              EMI Calculator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plan your loan repayment with our easy-to-use EMI calculator. Adjust the loan amount, interest rate, and tenure to see your monthly EMI in real-time.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Calculator Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="dashboard-card space-y-8"
            >
              {/* Loan Amount */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Loan Amount
                  </label>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg px-3 py-1.5">
                    <span className="text-muted-foreground text-sm">₹</span>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Math.min(10000000, Math.max(50000, Number(e.target.value))))}
                      className="w-24 bg-transparent text-foreground font-semibold text-right focus:outline-none"
                    />
                  </div>
                </div>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(v) => setLoanAmount(v[0])}
                  min={50000}
                  max={10000000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹50K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Percent className="w-4 h-4 text-primary" />
                    Interest Rate (per annum)
                  </label>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg px-3 py-1.5">
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.min(30, Math.max(5, Number(e.target.value))))}
                      step="0.1"
                      className="w-16 bg-transparent text-foreground font-semibold text-right focus:outline-none"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(v) => setInterestRate(v[0])}
                  min={5}
                  max={30}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Loan Tenure (months)
                  </label>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg px-3 py-1.5">
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Math.min(360, Math.max(6, Number(e.target.value))))}
                      className="w-16 bg-transparent text-foreground font-semibold text-right focus:outline-none"
                    />
                    <span className="text-muted-foreground text-sm">mo</span>
                  </div>
                </div>
                <Slider
                  value={[tenure]}
                  onValueChange={(v) => setTenure(v[0])}
                  min={6}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 months</span>
                  <span>30 years</span>
                </div>
              </div>

              {/* Tenure in Years */}
              <div className="flex justify-center gap-2 pt-4 border-t border-border">
                {[12, 24, 36, 60, 84, 120, 180, 240].map((months) => (
                  <Button
                    key={months}
                    variant={tenure === months ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTenure(months)}
                    className="text-xs"
                  >
                    {months < 12 ? `${months}M` : `${months / 12}Y`}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* EMI Result Card */}
              <div className="bg-primary rounded-2xl p-8 text-primary-foreground shadow-large">
                <div className="text-center mb-6">
                  <p className="text-primary-foreground/70 text-sm uppercase tracking-wider mb-2">
                    Your Monthly EMI
                  </p>
                  <motion.p
                    key={result.emi}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-bold"
                  >
                    {formatCurrency(result.emi)}
                  </motion.p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <p className="text-primary-foreground/70 text-xs uppercase tracking-wider mb-1">
                      Total Interest
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(result.totalInterest)}</p>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <p className="text-primary-foreground/70 text-xs uppercase tracking-wider mb-1">
                      Total Payable
                    </p>
                    <p className="text-xl font-bold">{formatCurrency(result.totalPayable)}</p>
                  </div>
                </div>
              </div>

              {/* Breakdown Chart */}
              <div className="dashboard-card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Payment Breakdown
                </h3>

                <div className="flex items-center gap-6">
                  {/* Simple Visual Pie */}
                  <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="20"
                        strokeDasharray={`${principalPercent * 2.51} 251`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {principalPercent.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Principal</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-sm bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Principal Amount</p>
                        <p className="font-semibold text-foreground">{formatCurrency(loanAmount)}</p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {principalPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-sm bg-secondary" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(result.totalInterest)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {interestPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amortization Preview */}
              <div className="dashboard-card">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  First Year Amortization
                </h3>

                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="pb-2 font-medium">Month</th>
                        <th className="pb-2 font-medium text-right">Principal</th>
                        <th className="pb-2 font-medium text-right">Interest</th>
                        <th className="pb-2 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationPreview.map((row) => (
                        <tr key={row.month} className="border-b border-border/50 last:border-0">
                          <td className="py-2 font-medium text-foreground">Month {row.month}</td>
                          <td className="py-2 text-right text-muted-foreground">
                            {formatCurrency(row.principal)}
                          </td>
                          <td className="py-2 text-right text-muted-foreground">
                            {formatCurrency(row.interest)}
                          </td>
                          <td className="py-2 text-right font-medium text-foreground">
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {tenure > 12 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Showing first 12 months of {tenure} month tenure
                  </p>
                )}
              </div>

              {/* Apply Now CTA */}
              <Button variant="accent" size="xl" className="w-full" asChild>
                <a href="/login">Apply for This Loan Now</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
