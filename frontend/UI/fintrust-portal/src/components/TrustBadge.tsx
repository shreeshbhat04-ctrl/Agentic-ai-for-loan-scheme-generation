import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TrustBadgeProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function TrustBadge({ icon, title, description, delay = 0 }: TrustBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
