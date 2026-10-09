export type DefectType =
  | 'Pothole'
  | 'Road Crack'
  | 'Surface Deterioration'
  | 'Edge Break'
  | 'Waterlogging & Erosion'
  | 'Debris / Obstruction';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus =
  | 'Pending Review'
  | 'Inspection Scheduled'
  | 'Under Repair'
  | 'Resolved'
  | 'Rejected'
  | 'Duplicate';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
}

export interface AiAnalysisResult {
  defectType: DefectType;
  confidence: number; // 0.00 to 1.00
  estimatedSeverity: SeverityLevel;
  priorityScore: number; // 1 to 100
  explanation: string;
  dimensions?: {
    estimatedLengthMeters: number;
    estimatedWidthMeters: number;
    estimatedDepthCm?: number;
  };
  repairSuggestion: string;
  safetyRisk: string;
  boundingBoxes: BoundingBox[];
  isRealAi: boolean;
  analyzedAt: string;
}

export interface ReportHistoryItem {
  id: string;
  reportId: string;
  actorId: string;
  actorName: string;
  actorRole: 'Citizen' | 'PWD Official' | 'System AI';
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  note?: string;
  createdAt: string;
}

export interface DuplicateFlag {
  reportId: string;
  relatedReportId: string;
  relatedReferenceNumber: string;
  similarityReason: string;
  distanceMeters: number;
  reviewStatus: 'Pending Review' | 'Confirmed Duplicate' | 'Dismissed';
  createdAt: string;
}

export interface RoadReport {
  id: string;
  referenceNumber: string;
  citizenId: string;
  citizenName: string;
  citizenContact?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  description: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  district: string;
  defectType: DefectType;
  confidence: number;
  modelIdentifier: string;
  estimatedSeverity: SeverityLevel;
  priorityScore: number;
  officialPriorityOverride?: SeverityLevel;
  status: ReportStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  officialNotes?: string;
  estimatedCostInr?: number;
  aiAnalysis: AiAnalysisResult;
  possibleDuplicates?: DuplicateFlag[];
  history: ReportHistoryItem[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  role: 'Citizen' | 'PWD Official' | 'Administrator';
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  district?: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReview: number;
  highPriority: number;
  resolved: number;
  underRepair: number;
  avgResolutionDays: number;
  byDefectType: Record<string, number>;
  byDistrict: Record<string, number>;
  bySeverity: Record<string, number>;
}
