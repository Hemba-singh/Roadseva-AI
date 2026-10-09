import React from 'react';
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Navigation
} from 'lucide-react';
import type { RoadReport } from '../../types/index.js';
import { IncidentMap } from '../common/IncidentMap.js';

interface CitizenHomeProps {
  reports: RoadReport[];
  onStartReport: () => void;
  onSelectReport: (report: RoadReport) => void;
  onViewAllReports: () => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  reports,
  onStartReport,
  onSelectReport,
  onViewAllReports,
}) => {
  const pendingReports = reports.filter((r) => r.status === 'Pending Review' || r.status === 'Inspection Scheduled');
  const resolvedReports = reports.filter((r) => r.status === 'Resolved');
  const recentReports = reports.slice(0, 4);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Clean Civic Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0066DF] text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-[#0066DF]" />
              <span>PWD Manipur Civic Action Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Better roads start with you.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Report road damage across Manipur. Vision AI instantly inspects potholes, estimates severity, and routes priority alerts to Public Works Department engineers.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onStartReport}
                className="px-5 py-3 rounded-xl bg-[#0066DF] hover:bg-[#0055C4] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Report Road Damage</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-2.5 shrink-0 md:w-48">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-center md:text-left">
              <div className="text-lg font-bold text-slate-900">{reports.length}</div>
              <div className="text-[11px] text-slate-500 font-medium">Logged Incidents</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-center md:text-left">
              <div className="text-lg font-bold text-amber-800">{pendingReports.length}</div>
              <div className="text-[11px] text-amber-700 font-medium">Under Review</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-center md:text-left">
              <div className="text-lg font-bold text-emerald-800">{resolvedReports.length}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Resolved Roads</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: NEARBY INCIDENTS MAP */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Nearby Reported Incidents</h2>
            <p className="text-xs text-slate-500">Live incidents mapped across Manipur highways & streets</p>
          </div>
          <span className="text-xs font-semibold text-[#0066DF] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
            {reports.length} Active Pins
          </span>
        </div>

        <IncidentMap
          reports={reports}
          onSelectReport={onSelectReport}
          height="280px"
          zoom={11}
          center={[24.8170, 93.9368]}
        />
      </div>

      {/* SECTION: RECENT ACTIVITY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0066DF]" />
            <span>Recent Incident Reports</span>
          </h2>
          <button
            onClick={onViewAllReports}
            className="text-xs font-semibold text-[#0066DF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({reports.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {recentReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img src={report.imageUrl} alt={report.defectType} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                <span
                  className={`absolute top-1 right-1 px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                    report.estimatedSeverity === 'Critical'
                      ? 'bg-red-600 text-white'
                      : report.estimatedSeverity === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {report.estimatedSeverity}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm text-slate-900 truncate">{report.defectType}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      report.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : report.status === 'Under Repair'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : report.status === 'Inspection Scheduled'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#0066DF] shrink-0" />
                  <span className="truncate">{report.locationLabel}</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                  <span className="font-mono text-xs text-[#0066DF] font-bold">{report.referenceNumber}</span>
                  <span className="text-slate-500">
                    {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
