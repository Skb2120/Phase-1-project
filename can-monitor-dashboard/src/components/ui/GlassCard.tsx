import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-[22px] border border-[rgba(255,190,40,0.25)] bg-[rgba(10,10,10,0.7)] shadow-[0_0_30px_rgba(255,186,72,0.08)] backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
