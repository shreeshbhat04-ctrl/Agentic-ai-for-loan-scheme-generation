import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LoanCardProps {
  title: string;
  description: string;
  features: string[];
  icon: ReactNode;
  gradient: "personal" | "home" | "business" | "education";
  interestRate: string;
  maxAmount: string;
  delay?: number;
}

const gradientClasses = {
  personal: "loan-card-personal",
  home: "loan-card-home",
  business: "loan-card-business",
  education: "loan-card-education",
};

export function LoanCard({
  title,
  description,
  features,
  icon,
  gradient,
  interestRate,
  maxAmount,
  delay = 0,
}: LoanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className={`relative rounded-2xl overflow-hidden text-primary-foreground shadow-large hover:shadow-glow transition-all duration-300 ${gradientClasses[gradient]}`}
    >
      <div className="p-6 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-primary-foreground/80 text-sm">{description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary-foreground/20">
          <div>
            <p className="text-primary-foreground/70 text-xs uppercase tracking-wider">Interest Rate</p>
            <p className="text-2xl font-bold">{interestRate}</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-xs uppercase tracking-wider">Max Amount</p>
            <p className="text-2xl font-bold">{maxAmount}</p>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Apply Button */}
        <button className="w-full py-3 rounded-lg bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-colors">
          Apply Now
        </button>
      </div>

      {/* Decorative Element */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary-foreground/5" />
    </motion.div>
  );
}
