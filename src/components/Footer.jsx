import React from 'react';
import { Leaf, Heart, Globe, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-eco-600 flex items-center justify-center text-white shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">ECO CLUB</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              "Building a greener campus through participation, teamwork and sustainability."
            </p>
            <div className="flex items-center gap-2 text-xs text-eco-400 font-medium">
              <Sparkles className="w-4 h-4" /> 4 Houses • Continuous Campus Stewardship
            </div>
          </div>

          {/* 4 Houses Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">The Four Houses</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Green House (Emerald Forest)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Blue House (Ocean Wave)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Red House (Solar Flare)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Yellow House (Golden Sun)</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-eco-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-eco-400 transition">House Leaderboard</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-eco-400 transition">Portal Login</Link>
              </li>
              <li>
                <a href="#about" className="hover:text-eco-400 transition">About the Initiative</a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/ecoclub_sxcce?utm_source=qr&stkn=YnUwMnV2MTAzeGUy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 transition flex items-center gap-1.5"
                >
                  <span>Instagram (@ecoclub_sxcce)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Sustainability Mission */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Our Commitment</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Empowering students through structured ecological initiatives, waste segregation, tree plantation, and weekly environmental audits.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-eco-400 font-semibold border border-slate-700">
              <Globe className="w-3.5 h-3.5" /> Powered by Supabase & Vercel
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Eco Club House Management System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Designed for Campus Sustainability</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500 ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
