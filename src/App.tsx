/**
 * RoadSeva AI — Manipur Road Damage Detection & Civic Action PWA
 * PWD-01: AI-Based Road Damage Reporting & Detection
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/layout/Header.js';
import { BottomNav } from './components/layout/BottomNav.js';
import { CitizenHome } from './components/citizen/CitizenHome.js';
import { ReportDamageWizard } from './components/reporting/ReportDamageWizard.js';
import { MyReportsView } from './components/citizen/MyReportsView.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView.js';
import { ReportDetailsModal } from './components/reports/ReportDetailsModal.js';
import type { DashboardStats, ReportStatus, RoadReport, SeverityLevel } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'reports' | 'admin' | 'profile'>('home');
  const [currentRole, setCurrentRole] = useState<'Citizen' | 'PWD Official'>('Citizen');

  // Reports & Stats State
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<RoadReport | null>(null);

  // In-flight guard to prevent race conditions and overlapping background network calls
  const isFetchingRef = useRef<boolean>(false);
  const reportsRef = useRef<RoadReport[]>([]);
  reportsRef.current = reports;

  // Optimized Fetch Reports with deep change detection to eliminate excessive state churn
  const fetchReports = useCallback(async (forceRefresh = false) => {
    if (isFetchingRef.current && !forceRefresh) return;
    isFetchingRef.current = true;

    try {
      const [reportsRes, statsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/stats'),
      ]);

      if (reportsRes.ok) {
        const data: RoadReport[] = await reportsRes.json();

        // Check if report items actually changed before calling setReports to avoid state churn
        setReports((prev) => {
          if (!forceRefresh && prev.length === data.length) {
            let hasChanged = false;
            for (let i = 0; i < prev.length; i++) {
              const p = prev[i];
              const d = data[i];
              if (
                !d ||
                p.id !== d.id ||
                p.status !== d.status ||
                p.updatedAt !== d.updatedAt ||
                p.assignedOfficerId !== d.assignedOfficerId ||
                p.priorityScore !== d.priorityScore ||
                p.officialNotes !== d.officialNotes ||
                p.history?.length !== d.history?.length
              ) {
                hasChanged = true;
                break;
              }
            }
            if (!hasChanged) {
              return prev; // Same reference -> React skips re-rendering!
            }
          }
          return data;
        });

        // Synchronize currently opened modal if its underlying report changed
        setSelectedReport((current) => {
          if (!current) return null;
          const fresh = data.find((r) => r.id === current.id || r.referenceNumber === current.referenceNumber);
          if (!fresh) return current;
          if (
            fresh.status !== current.status ||
            fresh.updatedAt !== current.updatedAt ||
            fresh.assignedOfficerId !== current.assignedOfficerId ||
            fresh.officialNotes !== current.officialNotes ||
            fresh.history?.length !== current.history?.length
          ) {
            return fresh;
          }
          return current;
        });
      }

      if (statsRes.ok) {
        const statsData: DashboardStats = await statsRes.json();
        // Prevent re-rendering if stats have not changed
        setStats((prev) => {
          if (
            prev &&
            prev.totalReports === statsData.totalReports &&
            prev.pendingReview === statsData.pendingReview &&
            prev.highPriority === statsData.highPriority &&
            prev.resolved === statsData.resolved &&
            prev.underRepair === statsData.underRepair
          ) {
            return prev;
          }
          return statsData;
        });
      }
    } catch (e) {
      console.warn('Network fetch error, using local state:', e);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Fetch only operational stats (lightweight, zero interference with reports)
  const refreshStatsOnly = useCallback(async () => {
    try {
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData: DashboardStats = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Initial load + non-intrusive reactive polling interval (15s)
  useEffect(() => {
    fetchReports(true);
    const interval = setInterval(() => {
      fetchReports(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  // Optimistic UI strategy for instantaneous user feedback with automatic rollback on network failure
  const handleUpdateStatus = useCallback(
    async (
      reportId: string,
      updateData: {
        status?: ReportStatus;
        assignedOfficerId?: string;
        officialNotes?: string;
        officialPriorityOverride?: SeverityLevel;
        estimatedCostInr?: number;
      }
    ) => {
      // 1. Snapshot previous state for rollback
      const previousReports = [...reportsRef.current];
      const previousSelected = selectedReport;

      const target = reportsRef.current.find(
        (r) => r.id === reportId || r.referenceNumber === reportId
      );

      // 2. Apply optimistic update immediately before network request
      if (target) {
        const optimisticHistory = target.history ? [...target.history] : [];
        if (updateData.status && updateData.status !== target.status) {
          optimisticHistory.unshift({
            id: `hist-opt-${Date.now()}`,
            reportId: target.id,
            actorId: 'official-user',
            actorName: currentRole === 'PWD Official' ? 'Er. R.K. Tomba Singh' : 'Sanasam Hemba Singh',
            actorRole: currentRole,
            previousStatus: target.status,
            newStatus: updateData.status,
            note: updateData.officialNotes || `Status updated from ${target.status} to ${updateData.status}.`,
            createdAt: new Date().toISOString(),
          });
        }

        const optimisticReport: RoadReport = {
          ...target,
          status: updateData.status !== undefined ? updateData.status : target.status,
          assignedOfficerId: updateData.assignedOfficerId !== undefined ? updateData.assignedOfficerId : target.assignedOfficerId,
          officialNotes: updateData.officialNotes !== undefined ? updateData.officialNotes : target.officialNotes,
          officialPriorityOverride: updateData.officialPriorityOverride !== undefined ? updateData.officialPriorityOverride : target.officialPriorityOverride,
          estimatedCostInr: updateData.estimatedCostInr !== undefined ? updateData.estimatedCostInr : target.estimatedCostInr,
          history: optimisticHistory,
          updatedAt: new Date().toISOString(),
        };

        // Instant local feedback in reports list
        setReports((prev) =>
          prev.map((r) =>
            r.id === target.id || r.referenceNumber === target.referenceNumber
              ? optimisticReport
              : r
          )
        );

        // Instant local feedback in open modal
        setSelectedReport((curr) =>
          curr && (curr.id === target.id || curr.referenceNumber === target.referenceNumber)
            ? optimisticReport
            : curr
        );

        // Optimistically adjust stats counters
        if (updateData.status && updateData.status !== target.status) {
          setStats((prevStats) => {
            if (!prevStats) return null;
            const prevStatus = target.status;
            const nextStatus = updateData.status!;

            let pending = prevStats.pendingReview;
            let resolved = prevStats.resolved;
            let repairing = prevStats.underRepair;

            if (prevStatus === 'Pending Review') pending--;
            if (prevStatus === 'Resolved') resolved--;
            if (prevStatus === 'Under Repair' || prevStatus === 'Inspection Scheduled') repairing--;

            if (nextStatus === 'Pending Review') pending++;
            if (nextStatus === 'Resolved') resolved++;
            if (nextStatus === 'Under Repair' || nextStatus === 'Inspection Scheduled') repairing++;

            return {
              ...prevStats,
              pendingReview: Math.max(0, pending),
              resolved: Math.max(0, resolved),
              underRepair: Math.max(0, repairing),
            };
          });
        }
      }

      // 3. Dispatch actual network call to backend
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updateData,
            actorName: currentRole === 'PWD Official' ? 'Er. R.K. Tomba Singh' : 'Sanasam Hemba Singh',
            actorRole: currentRole,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server update failed with code ${res.status}`);
        }

        const confirmedServerReport: RoadReport = await res.json();

        // 4. Reconcile with authoritative server record
        setReports((prev) =>
          prev.map((r) =>
            r.id === confirmedServerReport.id || r.referenceNumber === confirmedServerReport.referenceNumber
              ? confirmedServerReport
              : r
          )
        );

        setSelectedReport((curr) =>
          curr && (curr.id === confirmedServerReport.id || curr.referenceNumber === confirmedServerReport.referenceNumber)
            ? confirmedServerReport
            : curr
        );

        // Synchronize accurate backend stats
        refreshStatsOnly();

        return confirmedServerReport;
      } catch (err: unknown) {
        console.error('Optimistic update failed, rolling back state:', err);

        // 5. ROLLBACK on network failure
        setReports(previousReports);
        setSelectedReport(previousSelected);
        refreshStatsOnly();

        throw err;
      }
    },
    [currentRole, refreshStatsOnly, selectedReport]
  );

  // Fast status update from table action buttons
  const handleFastStatusUpdate = useCallback(
    async (reportId: string, newStatus: ReportStatus) => {
      await handleUpdateStatus(reportId, { status: newStatus });
    },
    [handleUpdateStatus]
  );

  // Reset demonstration dataset
  const handleResetDemoData = useCallback(async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await fetchReports(true);
      }
    } catch (e) {
      console.error('Failed to reset demo dataset:', e);
    }
  }, [fetchReports]);

  // When citizen completes reporting
  const handleReportCreated = useCallback(
    (newReport: RoadReport) => {
      setReports((prev) => [newReport, ...prev]);
      setSelectedReport(newReport);
      refreshStatsOnly();
    },
    [refreshStatsOnly]
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Bar */}
      <Header
        currentRole={currentRole}
        onRoleToggle={() =>
          setCurrentRole((prev) => (prev === 'Citizen' ? 'PWD Official' : 'Citizen'))
        }
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        onRefreshData={() => fetchReports(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6">
        {isLoading && reports.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-[#007AFF] rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-[#1D1D1F]">Loading RoadSeva AI Engine...</div>
            <p className="text-xs text-[#6E6E73]">Connecting to Manipur PWD incident registry</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <CitizenHome
                reports={reports}
                onStartReport={() => setActiveTab('report')}
                onSelectReport={(r) => setSelectedReport(r)}
                onViewAllReports={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'report' && (
              <ReportDamageWizard
                onSuccess={(newReport) => {
                  handleReportCreated(newReport);
                  setActiveTab('reports');
                }}
                onCancel={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'reports' && (
              <MyReportsView
                reports={reports}
                onSelectReport={(r) => setSelectedReport(r)}
                onStartReport={() => setActiveTab('report')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                reports={reports}
                stats={stats}
                onSelectReport={(r) => setSelectedReport(r)}
                onRefresh={() => fetchReports(true)}
                onResetDemoData={handleResetDemoData}
                onFastStatusUpdate={handleFastStatusUpdate}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSettingsView
                currentRole={currentRole}
                onRoleChange={(role) => setCurrentRole(role)}
                onResetDemoData={handleResetDemoData}
                onReportsUpdated={() => fetchReports(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modal for viewing single report details & audit history */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
          isOfficial={currentRole === 'PWD Official'}
        />
      )}

      {/* Mobile-first iOS bottom navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
        currentRole={currentRole}
      />
    </div>
  );
}
