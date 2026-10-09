import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  Info,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton.js';
import { getOfflineQueue, syncOfflineQueue, type QueuedReport } from '../../utils/offlineQueue.js';
import type { RoadReport } from '../../types/index.js';

interface ProfileSettingsViewProps {
  currentRole: 'Citizen' | 'PWD Official';
  onRoleChange: (newRole: 'Citizen' | 'PWD Official') => void;
  onResetDemoData: () => Promise<void>;
  onReportsUpdated: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  currentRole,
  onRoleChange,
  onResetDemoData,
  onReportsUpdated,
}) => {
  const [offlineQueue, setOfflineQueue] = useState<QueuedReport[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setOfflineQueue(getOfflineQueue());
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const synced = await syncOfflineQueue();
      setOfflineQueue(getOfflineQueue());
      if (synced.length > 0) {
        setSyncSuccessMessage(`Successfully synced ${synced.length} queued reports!`);
        onReportsUpdated();
      } else {
        setSyncSuccessMessage('No offline reports to sync.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset demonstration dataset to default Manipur road reports?')) {
      setIsResetting(true);
      await onResetDemoData();
      setIsResetting(false);
      alert('Demo reports reset successfully.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* User Identity Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#007AFF] to-blue-400 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
            {currentRole === 'PWD Official' ? <Shield className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1D1D1F]">
                {currentRole === 'PWD Official' ? 'Er. R.K. Tomba Singh' : 'Sanasam Hemba Singh'}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentRole === 'PWD Official' ? 'bg-blue-100 text-[#007AFF]' : 'bg-gray-100 text-[#6E6E73]'
                }`}
              >
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              {currentRole === 'PWD Official'
                ? 'Executive Engineer, PWD Manipur Imphal West'
                : 'Verified Citizen Contributor • Manipur'}
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="pt-3 border-t border-[#E5E5EA]">
          <div className="text-xs font-semibold text-[#1D1D1F] mb-2">Switch Active Persona / Role</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRoleChange('Citizen')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                currentRole === 'Citizen'
                  ? 'border-[#007AFF] bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-[#E5E5EA] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F]">
                <User className="w-4 h-4 text-[#007AFF]" />
                <span>Citizen Reporter</span>
              </div>
              <p className="text-[10px] text-[#6E6E73] mt-1">
                Report road damage, track status, view local repair progress.
              </p>
            </button>

            <button
              onClick={() => onRoleChange('PWD Official')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                currentRole === 'PWD Official'
                  ? 'border-[#007AFF] bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-[#E5E5EA] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#1D1D1F]">
                <Shield className="w-4 h-4 text-[#007AFF]" />
                <span>PWD Official / Admin</span>
              </div>
              <p className="text-[10px] text-[#6E6E73] mt-1">
                Assign engineers, update repair stages, view telemetry & map.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* PWA & Mobile Installation */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#007AFF]" />
            <div>
              <h3 className="font-bold text-sm text-[#1D1D1F]">Install Progressive Web App (PWA)</h3>
              <p className="text-xs text-[#6E6E73]">Fast offline access on iOS & Android</p>
            </div>
          </div>
          <PWAInstallButton />
        </div>
      </div>

      {/* Offline Sync Manager */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-[#1D1D1F]">Offline Drafts & Queue</h3>
              <p className="text-xs text-[#6E6E73]">
                {offlineQueue.length === 0
                  ? 'All local incident reports are synced'
                  : `${offlineQueue.length} drafts awaiting network sync`}
              </p>
            </div>
          </div>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-600 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          )}
        </div>

        {syncSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* About Manipur PWD-01 Initiative */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#007AFF]" />
          <span>About RoadSeva AI</span>
        </h3>
        <p className="text-xs text-[#6E6E73] leading-relaxed">
          Developed for <strong>PWD-01 — AI-Based Road Damage Reporting & Detection</strong> to modernize infrastructure maintenance in Manipur. The platform combines citizen reporting with computer vision artificial intelligence to automate severity classification, reduce repair turnaround time, and improve road safety across NH-2, NH-37, and state highways.
        </p>

        <div className="pt-2 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
          <span>PWD Manipur Helpline</span>
          <span className="font-semibold text-[#1D1D1F]">1800-345-3819 (Toll Free)</span>
        </div>
      </div>

      {/* Reset Demo Data Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="text-xs text-[#6E6E73] hover:text-[#FF3B30] font-medium flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demonstration Incidents Dataset</span>
        </button>
      </div>
    </div>
  );
};
