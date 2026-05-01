import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center overflow-hidden relative">
      {/* Decorative Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <p className="font-mono text-orange-500 uppercase tracking-[0.5em] text-xs font-bold translate-y-4">
            Iriga Plastic Manufacturing
          </p>
          <h1 className="font-sans text-[15vw] md:text-[10vw] font-black text-white leading-[0.8] tracking-tighter uppercase transform skew-x-[-10deg]">
            IPMRI<br/><span className="text-orange-600">IVNT</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-white/40 font-mono uppercase text-sm tracking-widest max-w-md">
            Professional Inventory Management & Production Tracking Suite
          </p>
          
          <button
            onClick={signInWithGoogle}
            className="group relative flex items-center gap-4 bg-white text-black px-12 py-6 font-mono font-bold uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            <LogIn size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Enter Warehouse</span>
            <div className="absolute inset-0 border border-white translate-x-2 translate-y-2 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Micro-labels */}
      <div className="absolute bottom-10 left-10 p-4 border-l border-white/20 hidden md:block">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1 italic">Authorized Personnel Only</p>
        <p className="font-mono text-[10px] text-white uppercase tracking-widest">System v2.4.0</p>
      </div>
      
      <div className="absolute bottom-10 right-10 p-4 border-r border-white/20 hidden md:block text-right">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">Location</p>
        <p className="font-mono text-[10px] text-white uppercase tracking-widest">Iriga City, PH</p>
      </div>
    </div>
  );
};
