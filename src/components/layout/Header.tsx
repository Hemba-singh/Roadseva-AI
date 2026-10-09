import React from 'react';
import { Shield, Sparkles, User, RefreshCw } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton.js';
import { OfflineBanner } from '../pwa/OfflineBanner.js';

interface HeaderProps {
  currentRole: 'Citizen' | 'PWD Official';
  onRoleToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleToggle,
  activeTab,
  onTabChange,
  onRefreshData,
}) => {
  return (
    <>
      <OfflineBanner />

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0066DF] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19L8 5L12 5L16 19" />
                <path d="M12 9V14" strokeDasharray="2 2" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">RoadSeva</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-[#0066DF] border border-blue-100">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Manipur PWD-01 Damage Detection</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'home' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange('report')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'report' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Report Damage
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'reports' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Reports
            </button>
            <button
              onClick={() => onTabChange('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>PWD Command</span>
            </button>
            <button
              onClick={() => onTabChange('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'profile' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Profile
            </button>
          </nav>

          {/* Right Header Utilities: PWA Button + Role Toggle */}
          <div className="flex items-center gap-2">
            <PWAInstallButton compact={true} />

            {/* Role Persona Toggle */}
            <button
              onClick={onRoleToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                currentRole === 'PWD Official'
                  ? 'bg-blue-50 text-[#0066DF] border-blue-200'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
              }`}
              title="Click to toggle between Citizen and PWD Official persona"
            >
              {currentRole === 'PWD Official' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#0066DF]" />
                  <span className="hidden sm:inline">Official: </span>
                  <span>PWD Mode</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Mode: </span>
                  <span>Citizen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
