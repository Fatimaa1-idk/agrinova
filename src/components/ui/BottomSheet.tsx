import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
  /** Disables the inner scroll container so children control their own scroll */
  noScroll?: boolean;
}

const BottomSheet = ({ isOpen, onClose, title, children, fullHeight = false, noScroll = false }: BottomSheetProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close when clicking directly on the overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[100] flex justify-center items-end bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "w-full max-w-3xl bg-white rounded-t-[32px] overflow-hidden shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col mx-auto",
              fullHeight ? "h-[90vh]" : "max-h-[90vh]"
            )}
          >
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
              <h2 className="font-black text-slate-800 text-xl tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Body */}
            <div className={cn(
              "flex-1 relative",
              noScroll
                ? "overflow-hidden flex flex-col"
                : "overflow-y-auto bg-slate-50 custom-scrollbar pb-24"
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { BottomSheet };