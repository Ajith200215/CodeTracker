"use client";

import React from "react";
import { Code2, Globe, Share2, MessageSquare, Send } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#161723] text-white pt-16 pb-12 px-4 lg:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
        {/* Brand & Socials Column */}
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-md">
              <Code2 className="w-5.5 h-5.5" />
            </div>
            <span className="font-serif-display text-2xl font-bold tracking-tight text-white">
              Code<span className="text-[#8B8CF6]">Tracker</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Empowering universities and college students with unified coding progress 
            analytics, platform stat aggregation, and browser-proctored online assessments.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {[Globe, Share2, MessageSquare, Send].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-9 h-9 rounded-full bg-[#232538] hover:bg-[#6C5CE7] flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</h4>
          <ul className="space-y-2 text-xs text-slate-300 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors">App</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">People</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Solutions</h4>
          <ul className="space-y-2 text-xs text-slate-300 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">For Colleges</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Brain Training</a></li>
            <li><a href="#" className="hover:text-white transition-colors">E-Learning</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Online Modules</a></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Support & Contact</h4>
          <ul className="space-y-2 text-xs text-slate-300 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Media Kit</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
        <div>Copyright © 2026 CodeTracker Inc. All rights reserved.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span>Terms of Service</span>
          <span>Security & Proctoring</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
};
