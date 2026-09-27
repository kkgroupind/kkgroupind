'use client';

import React, { useState } from 'react';
import {
  Calculator,
  IndianRupee,
  Plus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export interface ServiceRateCard {
  id: string;
  name: string;
  category: string;
  rateText: string;
  unit: string;
  baseAmount: number;
  icon: string;
  description: string;
  deliverables: string[];
}

export const KK_SERVICE_RATES: ServiceRateCard[] = [
  {
    id: 'cococare',
    name: 'Cococare - Palm Tree Harvesting & Maintenance',
    category: 'Agricultural & Tree Care',
    rateText: '₹80 - ₹120 per palm',
    unit: 'palms',
    baseAmount: 100,
    icon: '🌴',
    description: 'Mechanical palm climbing, crown cleaning, beetle eradication, and yield harvesting.',
    deliverables: ['Mechanical Climbing', 'Crown Cleaning', 'Organic Pest Spray', 'Bunch Harvesting'],
  },
  {
    id: 'jcb',
    name: 'Heavy JCB Earthmoving & Site Preparation',
    category: 'Heavy Machinery & Earth Excavation',
    rateText: '₹1,400 per hour',
    unit: 'hours',
    baseAmount: 1400,
    icon: '🚜',
    description: 'Excavation, land leveling, foundation trenching, pond desilting, and boulder removal.',
    deliverables: ['Licensed Operator', 'Fuel Included', 'Laser Level Trenching', 'Rock / Soil Clearing'],
  },
  {
    id: 'masonry',
    name: 'Master Masonry & Exterior Plastering',
    category: 'Structural Construction',
    rateText: '₹45 per sq.ft',
    unit: 'sq.ft',
    baseAmount: 45,
    icon: '🧱',
    description: 'Precision brickwork, solid block masonry, cement rendering, and waterproofing coats.',
    deliverables: ['Plumb & Alignment', 'Double Coat Plaster', 'Smooth Float Finish', 'Curing Supervision'],
  },
  {
    id: 'painting',
    name: 'Residential & Commercial Painting',
    category: 'Surface Finishing',
    rateText: '₹18 per sq.ft',
    unit: 'sq.ft',
    baseAmount: 18,
    icon: '🎨',
    description: 'Exterior weather-guard coating, interior emulsions, primer application, and anti-fungal wash.',
    deliverables: ['Surface Putty Prep', '2x Top Coat Emulsion', 'Waterproof Seal', 'Post-Clean Handover'],
  },
  {
    id: 'tiling',
    name: 'Floor Tiling & Granite Installation',
    category: 'Interior Finishes',
    rateText: '₹35 per sq.ft',
    unit: 'sq.ft',
    baseAmount: 35,
    icon: '✨',
    description: 'Laser-leveled vitrified tiles, Italian marble polishing, and granite kitchen countertop fitting.',
    deliverables: ['Laser Level Bedding', 'Polymer Grouting', 'Diamond Edge Cutting', 'Zero Hollow Sound'],
  },
  {
    id: 'electrical',
    name: 'Industrial Electrical & Power Maintenance',
    category: 'Utilities & Power',
    rateText: '₹1,200 base + ₹150/pt',
    unit: 'points',
    baseAmount: 150,
    icon: '⚡',
    description: '3-phase distribution boards, industrial panel wiring, inverter backup, and copper earthing.',
    deliverables: ['KSEB Compliance', 'Load Balancing', 'Short Circuit Test', 'Flame-Retardant Conduits'],
  },
  {
    id: 'plumbing',
    name: 'High-Pressure Plumbing & Septic Drainage',
    category: 'Water & Waste Management',
    rateText: '₹950 base + lines',
    unit: 'lines',
    baseAmount: 950,
    icon: '🔧',
    description: 'CPVC piping, high-pressure pump installation, septic tank drainage lines, and leak repair.',
    deliverables: ['Pressure Leak Testing', 'Solvent Weld Joins', 'Slope Graded Drainage', 'Odor Trap Seals'],
  },
  {
    id: 'borewell',
    name: 'Precision Borewell Drilling & Casing',
    category: 'Groundwater Systems',
    rateText: '₹160 per foot',
    unit: 'feet depth',
    baseAmount: 160,
    icon: '🏗️',
    description: 'Deep geological rotary drilling, 6-inch PVC casing installation, and aquifer yield testing.',
    deliverables: ['Aquifer Survey Analysis', 'Heavy Rig Drilling', 'Class-4 PVC Casing', 'Yield Discharge Test'],
  },
];

interface OfficeStaffEstimatesViewProps {
  onDraftOrderWithService?: (serviceName: string, estimatedAmount: number) => void;
  onShowToast?: (msg: string) => void;
}

export function OfficeStaffEstimatesView({
  onDraftOrderWithService,
  onShowToast,
}: OfficeStaffEstimatesViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('cococare');
  const [quantity, setQuantity] = useState<number>(30);

  const selectedService =
    KK_SERVICE_RATES.find((s) => s.id === selectedServiceId) || KK_SERVICE_RATES[0];
  const totalEstimate = selectedService.baseAmount * (quantity || 1);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Interactive Quick Quote Calculator Bento Card */}
      <div className="bg-[#091540] rounded-[32px] p-6 sm:p-8 text-white shadow-2xl border border-[#7692FF]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#7692FF]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#1B2CC1]/30 border border-[#7692FF]/40 flex items-center justify-center text-[#ABD2FA]">
                <Calculator className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                Instant Customer Quote Calculator
              </h3>
            </div>
            <p className="text-xs text-[#ABD2FA]/80 mt-1 max-w-xl">
              Calculate official KK Group operational estimates based on standard Kerala field rates,
              squad overheads, and materials.
            </p>
          </div>

          {/* Quick Output & Draft Button */}
          <div className="bg-[#060E2C] border border-[#7692FF]/30 p-4 rounded-2xl flex items-center justify-between gap-6 shrink-0 shadow-inner">
            <div>
              <span className="text-[10px] text-[#ABD2FA]/70 font-semibold uppercase tracking-wider block">
                Estimated Total
              </span>
              <div className="text-2xl font-black text-[#ABD2FA] tracking-tight flex items-center">
                <span>₹</span>
                <span>{totalEstimate.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onDraftOrderWithService) {
                  onDraftOrderWithService(selectedService.name, totalEstimate);
                } else {
                  onShowToast?.(`Drafted work order for ${selectedService.name}`);
                }
              }}
              className="bg-[#1B2CC1] hover:bg-[#15239E] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(27,44,193,0.35)] flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>Draft Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Calculator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              Select Field Service
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-[#060E2C] border border-[#7692FF]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#7692FF] cursor-pointer"
            >
              {KK_SERVICE_RATES.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.icon} {srv.name} ({srv.rateText})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              Estimated Work Units ({selectedService.unit})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="5000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-[#060E2C] border border-[#7692FF]/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#7692FF]"
              />
              <span className="text-xs text-[#ABD2FA]/80 font-medium whitespace-nowrap">
                {selectedService.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Standard Kerala Service Rate Cards */}
      <div>
        <h4 className="text-base font-bold text-[#091540] mb-3 flex items-center gap-2">
          <span>Official KK Group Tariff & Package Cards</span>
          <span className="text-xs font-normal text-slate-500">(Kerala Operations)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KK_SERVICE_RATES.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-white/80 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-[10px] font-bold bg-[#ABD2FA]/30 text-[#091540] border border-[#7692FF]/30 px-2 py-0.5 rounded-full">
                    {card.rateText}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-[#091540] tracking-tight mt-3">
                  {card.name}
                </h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {card.description}
                </p>

                {/* Deliverables Checklist */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {card.deliverables.map((del, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-[#1B2CC1] shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Base: ₹{card.baseAmount}/{card.unit}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(card.id);
                    onShowToast?.(`Selected ${card.name} for calculation`);
                  }}
                  className="text-xs font-bold text-[#1B2CC1] hover:text-[#091540] cursor-pointer"
                >
                  Select & Calculate &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
