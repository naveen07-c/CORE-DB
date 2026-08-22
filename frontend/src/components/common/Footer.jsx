import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-20">
      
      {/* 1. Hardware Guarantees Banner */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white flex-shrink-0">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free Express Delivery</h4>
                <p className="text-xs text-slate-400">Insured courier on orders &gt; $1,000</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">2-Year Full Warranty</h4>
                <p className="text-xs text-slate-400">Comprehensive parts & labor coverage</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">30-Day Money Back</h4>
                <p className="text-xs text-slate-400">Prepaid return shipping labels</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white flex-shrink-0">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certified Factory Sealed</h4>
                <p className="text-xs text-slate-400">Serialized quality assurance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Links */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand Story & Mission */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                V
              </div>
              <span className="text-xl font-black text-white tracking-tight">VORTEX HARDWARE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              We design and curate premium developer ultrabooks, audiophile reference monitors, and precision hardware tools crafted for engineers, designers, and creators worldwide.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Direct-to-Consumer Flagship Hardware</span>
            </div>
          </div>

          {/* Col 3: Shop Hardware */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Collections</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/catalog?category=laptops-computers" className="hover:text-white transition-colors">
                  Laptops & Workstations
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=smartphones-tablets" className="hover:text-white transition-colors">
                  Smartphones & Displays
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=audio-wearables" className="hover:text-white transition-colors">
                  Studio Audio & ANC
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">
                  Browse All Hardware
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">
                  Shipping & Dispatch Policy
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">
                  2-Year Warranty Coverage
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">
                  Returns & Refunds Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">My Account</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create an Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  View Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Purchase Receipts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar & Legal */}
        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VORTEX Hardware Labs Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Sale</span>
            <span>•</span>
            <span>Hardware Warranty Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
