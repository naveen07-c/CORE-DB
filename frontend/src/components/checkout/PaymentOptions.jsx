import React from 'react';
import { CreditCard, Smartphone, Building2, Banknote, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export const PaymentOptions = ({ selectedPaymentMethod, onSelectPaymentMethod }) => {
  const methods = [
    {
      id: 'CARD',
      name: 'Credit / Debit Card',
      description: 'Visa, MasterCard, Amex & RuPay',
      icon: CreditCard,
      badge: 'Fast & Secure',
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
        <h3 className="text-xs sm:text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-600" />
          2. Payment Method
        </h3>
        <span className="text-xs text-ink/50 flex items-center gap-1">
          <Lock className="w-3 h-3 text-brand-600" />
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
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                isSelected
                  ? 'border-ink bg-white shadow-md'
                  : 'border-ink/10 bg-white hover:border-brand-300 hover:bg-peach/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-brand-500 text-ink' : 'bg-cream text-ink/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{method.name}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cream text-ink/60 border border-ink/10">
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/50 mt-0.5">{method.description}</p>
                </div>
              </div>

              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-ink/15 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Security Banner */}
      <div className="p-3 bg-mint-100/70 border border-mint-300 rounded-2xl flex items-center gap-2.5 text-xs text-ink/70">
        <ShieldCheck className="w-4 h-4 text-mint-600 flex-shrink-0" />
        <span>
          Transactions are protected by 256-bit bank-grade encryption and automated fraud protection.
        </span>
      </div>
    </div>
  );
};
