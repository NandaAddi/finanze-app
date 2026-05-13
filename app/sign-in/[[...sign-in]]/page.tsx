"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020604] p-6">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Image 
            src="/logo-dark.png" 
            alt="Finanze Logo" 
            width={48} 
            height={48} 
            className="rounded-xl shadow-xl shadow-emerald-500/20 mb-4"
          />
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white">Finanze</h1>
          <p className="text-white/40 text-sm mt-2">Welcome back to your financial cloud</p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-sm normal-case",
              card: "bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-[32px]",
              headerTitle: "text-white",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40",
              formFieldLabel: "text-white/60",
              formFieldInput: "bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:ring-emerald-500/10",
              footerActionLink: "text-emerald-500 hover:text-emerald-400",
              footerActionText: "text-white/40",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-emerald-500"
            }
          }}
        />
      </div>
    </div>
  );
}
