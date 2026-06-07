'use client';

import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24 min-h-[calc(100vh-var(--header-height))]"
    >
      {children}
    </motion.div>
  );
}
