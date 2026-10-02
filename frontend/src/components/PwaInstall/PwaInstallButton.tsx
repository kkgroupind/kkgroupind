'use client';

import React from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Check, 
  X, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { usePwaInstall } from './use-pwa-install';

interface PwaInstallButtonProps {
  role?: 'admin' | 'office-staff' | 'worker';
  variant?: 'navbar' | 'sidebar' | 'card' | 'menu-item';
  className?: string;
}

export function PwaInstallButton({
  role = 'admin',
  variant = 'navbar',
  className = '',
}: PwaInstallButtonProps) {
  const {
    canInstall,
    isInstalled,
    isIos,
    isInstalling,
    hasNativePrompt,
    showInstructionsModal,
    setShowInstructionsModal,
    promptInstall,
  } = usePwaInstall();

  // Role accent colors
  const roleStyles = {
    admin: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      btnPrimary: 'bg-[#2A835F] hover:bg-[#236D4F] text-white',
      glow: 'shadow-[#2A835F]/20',
      accentText: 'text-emerald-400',
      bgCard: 'bg-[#14151A] border-gray-800',
    },
    'office-staff': {
      badge: 'bg-[#1B2CC1]/20 text-[#ABD2FA] border-[#1B2CC1]/40',
      btnPrimary: 'bg-[#1B2CC1] hover:bg-[#15239e] text-white',
      glow: 'shadow-[#1B2CC1]/25',
      accentText: 'text-[#7692FF]',
      bgCard: 'bg-[#0D1C52] border-[#1B2CC1]/30',
    },
    worker: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      btnPrimary: 'bg-[#2A835F] hover:bg-[#236D4F] text-white',
      glow: 'shadow-[#2A835F]/30',
      accentText: 'text-emerald-400',
      bgCard: 'bg-[#14151A] border-gray-800',
    },
  }[role];

  const modal = showInstructionsModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#14151A] border border-gray-800 rounded-3xl p-6 shadow-2xl text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none rounded-full blur-2xl -mr-10 -mt-10" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Install Web App
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                {role === 'worker' ? 'തൊഴിലാളി ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക' : 'Fast, 1-click home screen access'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInstructionsModal(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Body */}
        <div className="py-4 space-y-3.5 text-xs text-gray-300">
          {isIos ? (
            <div className="space-y-3 bg-[#0D0E12] p-4 rounded-2xl border border-gray-800">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <Share className="w-4 h-4 text-emerald-400" />
                iOS Safari Instructions:
              </div>
              <ol className="space-y-2 pl-4 list-decimal text-gray-300">
                <li>
                  Tap the <strong className="text-white">Share</strong> button (box with upward arrow <Share className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />) in Safari's bottom toolbar.
                </li>
                <li>
                  Scroll down the share sheet and tap <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />).
                </li>
                <li>
                  Tap <strong className="text-white">Add</strong> at the top right to complete.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 bg-[#0D0E12] p-4 rounded-2xl border border-gray-800">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-400" />
                Android &amp; Desktop Browser Instructions:
              </div>
              <ol className="space-y-2 pl-4 list-decimal text-gray-300">
                <li>
                  Tap browser menu (<strong className="text-white">&#8942;</strong> three dots) in the top-right corner.
                </li>
                <li>
                  Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.
                </li>
                <li>
                  On desktop Chrome/Edge, look for the <strong className="text-white">Install</strong> icon in the right side of the address bar.
                </li>
              </ol>
            </div>
          )}

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-300/90 leading-relaxed">
              Once installed, the KK Group web app runs in full-screen standalone mode with lightning fast performance, offline caching, and instant access from your home screen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={() => setShowInstructionsModal(false)}
            className="w-full py-2.5 rounded-xl bg-[#2A835F] hover:bg-[#236D4F] text-white font-bold text-xs shadow-lg transition-all"
          >
            Got it, Understood
          </button>
        </div>
      </div>
    </div>
  );

  // If already installed as standalone
  if (isInstalled && variant === 'navbar') {
    return (
      <div 
        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold ${className}`}
        title="KK Group Web App is Installed & Running in Standalone Mode"
      >
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold">App Installed</span>
      </div>
    );
  }

  // 1. NAVBAR VARIANT
  if (variant === 'navbar') {
    return (
      <>
        <button
          type="button"
          onClick={promptInstall}
          disabled={isInstalling}
          title={role === 'worker' ? 'Install Worker App / ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക' : 'Install KK Group Web App'}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${
            role === 'worker'
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'border-emerald-500/30 bg-[#14151A] hover:bg-[#1A1C23] text-gray-200 hover:text-white'
          } ${className}`}
        >
          <div className="relative">
            <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap">
            {role === 'worker' ? 'Install App' : 'Download App'}
          </span>
          <span className="hidden xl:inline text-[9px] px-1 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
            PWA
          </span>
        </button>
        {modal}
      </>
    );
  }

  // 2. SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <>
        <div className={`p-3 rounded-2xl border ${roleStyles.bgCard} ${className}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">Install Web App</span>
                <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  PWA
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block truncate">
                {isInstalled ? 'App active on device' : 'Fast standalone mode'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={promptInstall}
            disabled={isInstalling}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isInstalled
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                : `${roleStyles.btnPrimary}`
            }`}
          >
            {isInstalled ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Installed</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download App</span>
              </>
            )}
          </button>
        </div>
        {modal}
      </>
    );
  }

  // 3. CARD VARIANT (For worker dashboard top banner or office staff dashboard)
  if (variant === 'card') {
    return (
      <>
        <div className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border ${roleStyles.bgCard} relative overflow-hidden shadow-lg ${className}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#2A835F]/20 to-transparent pointer-events-none rounded-full blur-xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {role === 'worker' ? 'Install Worker Web App (PWA)' : 'Install KK Group App on Phone/PC'}
                  </h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    FAST
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {role === 'worker' 
                    ? 'ഹോം സ്ക്രീനിൽ ഒറ്റ ടാപ്പിൽ ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യാം (Offline support & Quick duty toggle).'
                    : 'Install directly to home screen or desktop taskbar without visiting an app store.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={promptInstall}
              disabled={isInstalling}
              className={`shrink-0 py-2.5 px-4 sm:px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                isInstalled
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                  : `${roleStyles.btnPrimary}`
              }`}
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Already Installed</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{role === 'worker' ? 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക' : 'Download Web App'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        {modal}
      </>
    );
  }

  // 4. MENU ITEM VARIANT (For drawers, profile menus)
  return (
    <>
      <button
        type="button"
        onClick={promptInstall}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
          role === 'office-staff'
            ? 'text-[#ABD2FA]/90 hover:bg-white/10 hover:text-white'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <Download className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Download Web App</span>
            <span className="text-[10px] text-gray-400">Install to Home Screen</span>
          </div>
        </div>
        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
          PWA
        </span>
      </button>
      {modal}
    </>
  );
}
