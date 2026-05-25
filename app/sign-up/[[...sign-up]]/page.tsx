"use client";

import { useState, useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const easePremium = [0.16, 1, 0.3, 1];

  const images = ["/finanze-bg.png", "/finanze-bg1.png", "/finanze-bg2.png"];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#060606] grid grid-cols-1 lg:grid-cols-[45%_55%] p-3 sm:p-4 text-white relative overflow-hidden font-sans">

      {/* Decorative background glow for left column */}
      <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-950/10 blur-[100px] pointer-events-none z-0" />

      {/* Left Column: Sign Up Form container */}
      <div className="flex flex-col justify-between items-center lg:items-start p-6 sm:p-10 z-10 w-full relative">

        {/* Back Link to Homepage */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#bbb] transition-all duration-200 self-start group mb-8 lg:mb-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Kembali ke Beranda
        </Link>

        {/* Auth form centered */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: easePremium, duration: 0.8 }}
          className="my-auto w-full flex items-center justify-center"
        >
          <SignUp
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#10b981", // Emerald accent color
              }
            }}
          />
        </motion.div>

        {/* Footer info branding */}
        <div className="text-[10px] text-[#444] font-mono mt-8 lg:mt-0">
          &copy; {new Date().getFullYear()} Finanze. All rights reserved.
        </div>
      </div>

      {/* Right Column: Visual Showcase Canvas (Hidden on Mobile) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ease: easePremium, duration: 1, delay: 0.15 }}
        className="hidden lg:block rounded-3xl relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5 group"
      >
        {/* Full-bleed showcase dashboard image loop with Next.js dynamic AVIF optimization */}
        {images.map((img, idx) => (
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentIdx === idx ? 1 : 0,
              scale: currentIdx === idx ? 1.02 : 1
            }}
            transition={{ duration: 1.5, ease: easePremium }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <Image
              src={img}
              alt={`Finanze Dashboard Preview ${idx + 1}`}
              fill
              priority={idx === 0}
              sizes="55vw"
              className="object-cover object-left-top transition-transform duration-1000"
            />
          </motion.div>
        ))}

        {/* Page dot indicator overlay */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIdx === idx ? "bg-emerald-400 w-6" : "bg-white/30 hover:bg-white/50"
                }`}
              aria-label={`Showcase slide ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
