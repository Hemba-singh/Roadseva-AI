import React, { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  Map as MapIcon,
  List,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Wrench,
  UserCheck,
  ChevronRight,
  RotateCcw,
  BarChart3,
  ExternalLink,
  Layers
} from 'lucide-react';
import type { DashboardStats, DefectType, ReportStatus, RoadReport, SeverityLevel } from '../../types/index.js';
import { IncidentMap } from '../common/IncidentMap.js';

interface AdminDashboardProps {
  reports: RoadReport[];
  stats: DashboardStats | null;
  onSelectReport: (report: RoadReport) => void;
  onRefresh: () => void;
  onResetDemoData: () => Promise<void>;
  onFastStatusUpdate: (reportId: string, newStatus: ReportStatus) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  stats,
  onSelectReport,
  onRefresh,
  onResetDemoData,
  onFastStatusUpdate,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'map' | 'analytics'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [defectFilter, setDefectFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [isResetting, setIsResetting] = useState(false);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.estimatedSeverity !== severityFilter) return false;
    if (defectFilter !== 'all' && r.defectType !== defectFilter) return false;
    if (districtFilter !== 'all' && r.district !== districtFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.referenceNumber.toLowerCase().includes(q) ||
        r.locationLabel.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.defectType.toLowerCase().includes(q) ||
        r.citizenName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleReset = async () => {
    if (confirm('Reset Manipur demonstration dataset to initial PWD state?')) {
      setIsResetting(true);
      await onResetDemoData();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* PWD Command Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0066DF] flex items-center justify-center text-white shadow-xs shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0066DF]">
                  Public Works Department (PWD)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Government of Manipur
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                Road Damage Incident Command & Resolution
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs active:scale-98 transition cursor-pointer"
              title="Reset sample demonstration incidents"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Data</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'map' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'analytics' ? 'bg-white text-[#0066DF] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500">Total Incidents</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalReports || reports.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across Manipur highways</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90">
            <div className="text-xs font-medium text-amber-800">Pending Official Review</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {stats?.pendingReview || reports.filter((r) => r.status === 'Pending Review').length}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">Awaiting engineer dispatch</div>
          </div>

          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/90">
            <div className="text-xs font-medium text-red-800">High & Critical Priority</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {stats?.highPriority || reports.filter((r) => r.estimatedSeverity === 'Critical' || r.estimatedSeverity === 'High').length}
            </div>
            <div className="text-[11px] text-red-700 mt-0.5">Urgent safety hazards</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90">
            <div className="text-xs font-medium text-emerald-800">Resolved Incidents</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {stats?.resolved || reports.filter((r) => r.status === 'Resolved').length}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Avg turnaround 2.8 days</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference ID (MN-PWD-...), location, defect, citizen..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Inspection Scheduled">Inspection Scheduled</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={defectFilter}
              onChange={(e) => setDefectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Defect Types</option>
              <option value="Pothole">Pothole</option>
              <option value="Road Crack">Road Crack</option>
              <option value="Surface Deterioration">Surface Deterioration</option>
              <option value="Edge Break">Edge Break</option>
              <option value="Waterlogging & Erosion">Waterlogging & Erosion</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW: TABLE LIST */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Incident / Photo</th>
                  <th className="py-3 px-4">Defect Type</th>
                  <th className="py-3 px-4">Location & District</th>
                  <th className="py-3 px-4">Severity & Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4 text-right">Official Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No road incidents match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/70 transition group cursor-pointer"
                      onClick={() => onSelectReport(report)}
                    >
                      {/* Photo & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img src={report.imageUrl} alt={report.defectType} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-xs text-[#0066DF]">
                              {report.referenceNumber}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Defect Type */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{report.defectType}</div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          {((report.confidence || 0.9) * 100).toFixed(0)}% AI Confidence
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{report.locationLabel}</div>
                        <div className="text-[10px] text-slate-500">{report.district}</div>
                      </td>

                      {/* Severity & Priority */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              report.estimatedSeverity === 'Critical'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : report.estimatedSeverity === 'High'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {report.estimatedSeverity}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#0066DF]">
                            P{report.priorityScore}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
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
                      </td>

                      {/* Officer */}
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-700 font-medium">
                          {report.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {report.status === 'Pending Review' && (
                            <button
                              onClick={() => onFastStatusUpdate(report.id, 'Inspection Scheduled')}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0066DF] text-[11px] font-semibold border border-blue-100 transition"
                              title="Schedule site inspection"
                            >
                              Schedule
                            </button>
                          )}
                          {report.status === 'Inspection Scheduled' && (
                            <button
                              onClick={() => onFastStatusUpdate(report.id, 'Under Repair')}
                              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-semibold border border-sky-100 transition"
                              title="Dispatch repair unit"
                            >
                              Dispatch Unit
                            </button>
                          )}
                          {report.status === 'Under Repair' && (
                            <button
                              onClick={() => onFastStatusUpdate(report.id, 'Resolved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-100 transition"
                              title="Mark resolved"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => onSelectReport(report)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="Open full inspector details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: INTERACTIVE MAP */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Manipur Road Network Incident Map</h3>
              <p className="text-xs text-slate-500">
                Red (Critical) • Amber (High) • Slate (Medium) • Green (Resolved)
              </p>
            </div>
            <span className="text-xs font-semibold text-[#0066DF] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              {filteredReports.length} Plotted Pins
            </span>
          </div>

          <IncidentMap
            reports={filteredReports}
            onSelectReport={onSelectReport}
            height="500px"
            zoom={10}
            center={[24.8170, 93.9368]}
          />
        </div>
      )}

      {/* VIEW: ANALYTICS & DEFECT DISTRIBUTION */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Defect Categories Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Defect Category Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(stats?.byDefectType || {}).map(([defect, count]) => {
                const total = stats?.totalReports || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={defect} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{defect}</span>
                      <span className="font-semibold text-slate-500">{count} incidents ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-[#0066DF] transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Geographic District Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats?.byDistrict || {}).map(([dist, count]) => {
                const total = stats?.totalReports || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={dist} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{dist}</span>
                      <span className="font-semibold text-slate-500">{count} incidents ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
