import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone } from '../types';
import { Award, Sparkles } from 'lucide-react';

interface MilestoneModalProps {
  milestone: Milestone | null;
  onClose?: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone }) => {
  if (!milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl border-2 border-white/40 backdrop-blur-md max-w-md">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-yellow-300">
                {milestone.title}
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium">
              {milestone.message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
