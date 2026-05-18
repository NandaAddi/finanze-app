"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020604] p-6 relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/loginteaser.webm" type="video/webm" />
      </video>

      {/* Dark Overlay with subtle blur for readability */}
      <div className="absolute inset-0 bg-[#020604]/75 backdrop-blur-[2px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/logo-dark.png" 
            alt="Finanze Logo" 
            width={52} 
            height={52} 
            priority
            className="rounded-xl shadow-xl shadow-emerald-500/10 mb-4 border border-emerald-500/20"
          />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white font-sans">Finanze</h1>
          <p className="text-white/40 text-sm mt-1.5">Welcome back to your financial cloud</p>
        </div>

        <SignIn 
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#10b981", // Keep Emerald brand color
            }
          }}
        />
      </motion.div>
    </div>
  );
}
