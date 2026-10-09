import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  Shield,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Wrench,
  Check,
  Share2,
  FileText,
  Copy,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import type { RoadReport, ReportStatus, SeverityLevel } from '../../types/index.js';
import { IncidentMap } from '../common/IncidentMap.js';

interface ReportDetailsModalProps {
  report: RoadReport;
  onClose: () => void;
  onUpdateStatus?: (reportId: string, updateData: {
    status?: ReportStatus;
    assignedOfficerId?: string;
    officialNotes?: string;
    officialPriorityOverride?: SeverityLevel;
    estimatedCostInr?: number;
  }) => Promise<RoadReport | void>;
  isOfficial?: boolean;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onUpdateStatus,
  isOfficial = false,
}) => {
  const [showMarkers, setShowMarkers] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);

  // Official Form State
  const [newStatus, setNewStatus] = useState<ReportStatus>(report.status);
  const [officerId, setOfficerId] = useState<string>(report.assignedOfficerId || '');
  const [notes, setNotes] = useState<string>(report.officialNotes || '');
  const [overridePriority, setOverridePriority] = useState<SeverityLevel | ''>(report.officialPriorityOverride || '');
  const [estimatedCost, setEstimatedCost] = useState<number | string>(report.estimatedCostInr || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Synchronize internal form state when report updates from PATCH or backend
  React.useEffect(() => {
    setNewStatus(report.status);
    setOfficerId(report.assignedOfficerId || '');
    setNotes(report.officialNotes || '');
    setOverridePriority(report.officialPriorityOverride || '');
    setEstimatedCost(report.estimatedCostInr || '');
  }, [
    report.id,
    report.status,
    report.assignedOfficerId,
    report.officialNotes,
    report.officialPriorityOverride,
    report.estimatedCostInr,
  ]);

  const copyRef = () => {
    navigator.clipboard.writeText(report.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleOfficialSave = async () => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(report.id, {
        status: newStatus,
        assignedOfficerId: officerId || undefined,
        officialNotes: notes,
        officialPriorityOverride: (overridePriority as SeverityLevel) || undefined,
        estimatedCostInr: estimatedCost ? Number(estimatedCost) : undefined,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Could not update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#E5E5EA] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#E5E5EA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md">
                  {report.referenceNumber}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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
              <h2 className="text-base font-bold text-[#1D1D1F] mt-0.5">{report.defectType} — {report.district}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyRef}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
              title="Copy Reference"
            >
              {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visual & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Photograph with Bounding Boxes */}
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-[#E5E5EA] bg-black aspect-4/3 flex items-center justify-center">
                <img src={report.imageUrl} alt={report.defectType} className="w-full h-full object-cover" />

                {/* Bounding Boxes */}
                {showMarkers &&
                  report.aiAnalysis?.boundingBoxes?.map((box, idx) => (
                    <div
                      key={idx}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                      }}
                      className="absolute border-2 border-[#34C759] bg-green-500/15 rounded-md pointer-events-none"
                    >
                      <span className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-[#34C759] text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                        {box.label || report.defectType}
                      </span>
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() => setShowMarkers(!showMarkers)}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 hover:bg-black/80 transition"
                >
                  <Eye className="w-3 h-3" />
                  <span>{showMarkers ? 'Hide Markers' : 'Show Markers'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E6E73] px-1">
                <span>Model: {report.modelIdentifier}</span>
                <span className="text-emerald-600 font-semibold">{((report.confidence || 0.9) * 100).toFixed(0)}% Confidence</span>
              </div>
            </div>

            {/* Right: Key Incident Attributes */}
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#6E6E73]">Severity Rating</div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        report.estimatedSeverity === 'Critical'
                          ? 'bg-[#FF3B30]'
                          : report.estimatedSeverity === 'High'
                          ? 'bg-[#FF9500]'
                          : 'bg-[#FFCC00]'
                      }`}
                    />
                    <span className="font-bold text-xs text-[#1D1D1F]">{report.estimatedSeverity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                  <div className="text-xs text-[#6E6E73]">Operational Priority Score</div>
                  <div className="font-bold text-sm text-[#007AFF]">{report.priorityScore}/100</div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                  <div className="text-xs text-[#6E6E73]">Reported By</div>
                  <div className="font-medium text-xs text-[#1D1D1F]">{report.citizenName}</div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                  <div className="text-xs text-[#6E6E73]">Assigned Officer</div>
                  <div className="font-semibold text-xs text-[#1D1D1F]">
                    {report.assignedOfficerName || 'Pending Assignment'}
                  </div>
                </div>

                {report.estimatedCostInr && (
                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                    <div className="text-xs text-[#6E6E73]">Estimated Budget</div>
                    <div className="font-bold text-xs text-emerald-700">₹ {report.estimatedCostInr.toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>

              {/* Location Mini Box */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-[#1D1D1F]">{report.locationLabel}</div>
                    <div className="text-[11px] text-[#6E6E73]">
                      {report.latitude.toFixed(5)}°N, {report.longitude.toFixed(5)}°E ({report.district})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Engineering Assessment */}
          <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3">
            <div>
              <div className="text-xs font-bold text-[#1D1D1F] mb-1">Citizen Incident Description</div>
              <p className="text-xs text-[#6E6E73] leading-relaxed italic">
                "{report.description}"
              </p>
            </div>

            {report.aiAnalysis && (
              <div className="pt-3 border-t border-gray-200/80 space-y-2">
                <div className="text-xs font-bold text-[#1D1D1F]">Civil Engineering Analysis & Remediation</div>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  {report.aiAnalysis.explanation}
                </p>
                <div className="flex items-start gap-2 pt-1 text-xs">
                  <Wrench className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                  <span className="text-[#1D1D1F] font-medium">{report.aiAnalysis.repairSuggestion}</span>
                </div>
              </div>
            )}
          </div>

          {/* Location Map Preview */}
          <div>
            <div className="text-xs font-bold text-[#1D1D1F] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Incident Geographic Location</span>
            </div>
            <IncidentMap
              selectedLocation={{ lat: report.latitude, lng: report.longitude }}
              reports={[report]}
              height="200px"
              zoom={14}
              center={[report.latitude, report.longitude]}
            />
          </div>

          {/* Possible Duplicates Warning (if detected) */}
          {report.possibleDuplicates && report.possibleDuplicates.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Possible Nearby Duplicate Incident Detected</span>
              </div>
              <p className="text-xs text-amber-800">
                Another incident is reported within {report.possibleDuplicates[0].distanceMeters} meters with a matching defect category ({report.possibleDuplicates[0].relatedReferenceNumber}).
              </p>
            </div>
          )}

          {/* Status Timeline History Audit Trail */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Resolution Audit Trail ({report.history?.length || 1} events)</span>
            </div>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {report.history?.map((h) => (
                <div key={h.id} className="relative flex items-start gap-3">
                  <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#007AFF] ring-4 ring-white" />
                  <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#1D1D1F]">
                        {h.actorName} <span className="text-[10px] text-[#6E6E73] font-normal">({h.actorRole})</span>
                      </span>
                      <span className="text-[10px] text-[#6E6E73]">
                        {new Date(h.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-700 leading-snug">{h.note}</div>
                    <div className="mt-1 text-[10px] font-medium text-[#007AFF]">
                      Status: {h.newStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PWD Official Actions Box (Only for officials or demo review) */}
          {isOfficial && (
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">Official PWD Action & Status Control</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Inspection Scheduled">Inspection Scheduled</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Duplicate">Mark as Duplicate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1">Assign PWD Officer</label>
                  <select
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Officer...</option>
                    <option value="off-1">Er. R.K. Tomba Singh (Imphal West)</option>
                    <option value="off-2">Er. L. Sanatomba Meitei (NH-2 Sekmai)</option>
                    <option value="off-3">Er. H. Nemboi Haokip (Churachandpur)</option>
                    <option value="off-4">Er. K. Ibomcha Sharma (Bishnupur)</option>
                    <option value="off-5">Er. V. Zimik (Ukhrul Division)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-[#1D1D1F] mb-1">Official Notes / Inspection Log</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter site inspection findings, contractor work orders, repair materials..."
                    rows={2}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-700 font-medium">
                  {updateSuccess && '✓ Audit trail & status updated!'}
                </span>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleOfficialSave}
                  className="px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 disabled:bg-gray-300 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-98 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving Update...' : 'Commit Status Update'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
