import React from 'react';
import { Home, Camera, FileText, Shield, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole: 'Citizen' | 'PWD Official';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  currentRole,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#E5E5EA] safe-bottom">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
            activeTab === 'home' ? 'text-[#007AFF]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>

        {/* Tab 2: My Reports */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
            activeTab === 'reports' ? 'text-[#007AFF]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <FileText className="w-5 h-5" strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Reports</span>
        </button>

        {/* Center: Report Damage Primary Action */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={() => onTabChange('report')}
            className="w-13 h-13 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-blue-500/35 hover:bg-blue-600 active:scale-92 transition cursor-pointer border-4 border-white"
            title="Report Road Damage"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 4: PWD Admin Command */}
        <button
          onClick={() => onTabChange('admin')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
            activeTab === 'admin' ? 'text-[#007AFF]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Shield className="w-5 h-5" strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">PWD Portal</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition cursor-pointer ${
            activeTab === 'profile' ? 'text-[#007AFF]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <User className="w-5 h-5" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
