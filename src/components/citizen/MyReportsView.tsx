import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { RoadReport } from '../../types/index.js';

interface MyReportsViewProps {
  reports: RoadReport[];
  onSelectReport: (report: RoadReport) => void;
  onStartReport: () => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  onSelectReport,
  onStartReport,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        r.referenceNumber.toLowerCase().includes(q) ||
        r.locationLabel.toLowerCase().includes(q) ||
        r.defectType.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Track Road Damage Incidents</h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Monitor real-time repair progress, engineering inspections, and resolutions across Manipur.
          </p>
        </div>

        <button
          onClick={onStartReport}
          className="px-4 py-2.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by MN-PWD- reference or street name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E5EA] bg-white text-xs focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/60 overflow-x-auto">
          {['all', 'Pending Review', 'Under Repair', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-[#007AFF] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              {tab === 'all' ? 'All Incidents' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E5EA] space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-[#1D1D1F]">No reports found</h3>
          <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
            No incidents match your filter. Try adjusting your query or report a new road defect.
          </p>
          <button
            onClick={onStartReport}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 transition"
          >
            File Road Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="p-4 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs hover:shadow-md hover:border-blue-200 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md">
                    {report.referenceNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'Under Repair'
                        ? 'bg-blue-100 text-blue-800'
                        : report.status === 'Inspection Scheduled'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <img src={report.imageUrl} alt={report.defectType} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#1D1D1F] truncate">{report.defectType}</div>
                    <div className="text-xs text-[#6E6E73] mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#007AFF] shrink-0" />
                      <span className="truncate">{report.locationLabel}</span>
                    </div>
                    <div className="text-[11px] text-[#6E6E73] mt-0.5">District: {report.district}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      report.estimatedSeverity === 'Critical'
                        ? 'bg-[#FF3B30]'
                        : report.estimatedSeverity === 'High'
                        ? 'bg-[#FF9500]'
                        : 'bg-[#FFCC00]'
                    }`}
                  />
                  <span className="text-[#6E6E73]">{report.estimatedSeverity} Severity</span>
                </div>

                <span className="font-semibold text-[#007AFF] flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                  <span>Track Status</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
