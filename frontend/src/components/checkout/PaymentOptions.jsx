import React from 'react';
import { CreditCard, Smartphone, Building2, Banknote, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const PaymentOptions = ({ selectedPaymentMethod, onSelectPaymentMethod }) => {
  const methods = [
    {
      id: 'CREDIT_CARD',
      name: 'Credit Card',
      description: 'Visa, MasterCard, Amex',
      icon: CreditCard,
      badge: 'Fast & Secure',
    },
    {
      id: 'DEBIT_CARD',
      name: 'Debit Card',
      description: 'Direct bank debit',
      icon: CreditCard,
      badge: 'Direct Debit',
    },
    {
      id: 'UPI',
      name: 'UPI / Instant QR',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
      badge: 'Zero Fee',
    },
    {
      id: 'NET_BANKING',
      name: 'Net Banking',
      description: 'All major national banks',
      icon: Building2,
      badge: 'Online Portal',
    },
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay cash upon delivery',
      icon: Banknote,
      badge: 'Doorstep Pay',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          2. Payment Method
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          256-Bit SSL Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((method) => {
          const isSelected = selectedPaymentMethod === method.id;
          const Icon = method.icon;

          return (
            <div
              key={method.id}
              onClick={() => onSelectPaymentMethod(method.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                isSelected
                  ? 'border-slate-900 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800/80 shadow-sm ring-1 ring-slate-900 dark:ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{method.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{method.description}</p>
                </div>
              </div>

              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Security Banner */}
      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>
          Transactions are protected by 256-bit bank-grade encryption and automated fraud protection.
        </span>
      </div>
    </div>
  );
};
