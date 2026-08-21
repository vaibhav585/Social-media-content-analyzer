import React from 'react';
import { HistoryList } from './HistoryList';
import { TrendChart } from './TrendChart';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  return (
    <div className="relative w-full h-full p-8 overflow-y-auto custom-scrollbar">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analysis History</h1>
          <p className="text-slate-500 dark:text-slate-400">Track your past content performance and engagement trends over time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <HistoryList />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <TrendChart />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
