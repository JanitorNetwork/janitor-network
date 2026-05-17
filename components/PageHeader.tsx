"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  tag: string;
  title: string;
  description?: string;
}

export default function PageHeader({ tag, title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-[#1a1a1a] bg-[#080808] pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-px bg-[#00ff41]" />
            <span className="mono text-[10px] text-[#00ff41] tracking-[0.3em] uppercase">{tag}</span>
          </div>
          <h1 className="text-3xl font-black text-[#e8e8e8] tracking-tight mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-[#555] max-w-lg">{description}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
