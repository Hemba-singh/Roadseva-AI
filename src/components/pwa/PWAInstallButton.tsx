import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 font-medium transition cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs rounded-full bg-[#007AFF] text-white hover:bg-blue-600 shadow-sm'
            : 'px-3.5 py-2 text-sm rounded-xl bg-[#007AFF] text-white hover:bg-blue-600 shadow-sm active:scale-95'
        }`}
        title="Install RoadSeva as native app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 font-medium transition cursor-pointer border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-gray-50 ${
            compact
              ? 'px-2.5 py-1 text-xs rounded-full shadow-2xs'
              : 'px-3.5 py-2 text-sm rounded-xl shadow-xs active:scale-95'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom duration-250">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    RS
                  </div>
                  <h3 className="font-semibold text-[#1D1D1F] text-base">Install RoadSeva</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-[#1D1D1F]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Tap the <strong className="font-semibold">Share</strong> button in Safari's bottom toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="flex items-center gap-1.5 flex-wrap">
                    Scroll down and tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-semibold"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</span>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Launch RoadSeva directly from your home screen with offline caching.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#007AFF] text-white text-sm font-medium hover:bg-blue-600 active:scale-98 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
