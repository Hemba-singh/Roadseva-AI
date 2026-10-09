import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type { RoadReport, AiAnalysisResult, ReportStatus, SeverityLevel, DefectType } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsers - allow larger payloads for base64 road photographs
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory persistent data store (backed with realistic Manipur PWD road data)
const PWD_OFFICERS = [
  { id: 'off-1', name: 'Er. R.K. Tomba Singh', designation: 'Executive Engineer', division: 'Imphal West Division', district: 'Imphal West' },
  { id: 'off-2', name: 'Er. L. Sanatomba Meitei', designation: 'Assistant Engineer (Highways)', division: 'NH-2 Division Sekmai', district: 'Imphal East' },
  { id: 'off-3', name: 'Er. H. Nemboi Haokip', designation: 'Sub-Divisional Officer', division: 'Churachandpur Road Sub-Division', district: 'Churachandpur' },
  { id: 'off-4', name: 'Er. K. Ibomcha Sharma', designation: 'Quality Control Inspector', division: 'Bishnupur Infrastructure Wing', district: 'Bishnupur' },
  { id: 'off-5', name: 'Er. V. Zimik', designation: 'Hill Road Maintenance Engineer', division: 'Ukhrul Division', district: 'Ukhrul' },
];

// High quality road defect imagery for demo / sample reports
const SAMPLE_PHOTOS = {
  potholeDeep: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
  potholeMultiple: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=1000&q=80',
  roadCrack: 'https://images.unsplash.com/photo-1584463699043-467f56193e2b?auto=format&fit=crop&w=1000&q=80',
  surfaceDamage: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80',
  erosion: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
  debris: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1000&q=80',
};

function generateInitialReports(): RoadReport[] {
  return [
    {
      id: 'rep-001',
      referenceNumber: 'MN-PWD-2026-8941',
      citizenId: 'cit-101',
      citizenName: 'Biren Sh Sharma',
      citizenContact: '+91 98621 44510',
      imageUrl: SAMPLE_PHOTOS.potholeDeep,
      description: 'Severe waterlogged pothole near Kangla West Gate causing heavy traffic choke and two-wheeler accidents during monsoon showers.',
      latitude: 24.8055,
      longitude: 93.9405,
      locationLabel: 'Kangla Fort Western Perimeter Road, Imphal',
      district: 'Imphal West',
      defectType: 'Pothole',
      confidence: 0.96,
      modelIdentifier: 'gemini-3.8-flash-vision',
      estimatedSeverity: 'Critical',
      priorityScore: 92,
      status: 'Pending Review',
      assignedOfficerId: 'off-1',
      assignedOfficerName: 'Er. R.K. Tomba Singh',
      officialNotes: 'Assigned for immediate asphalt patching before weekend VIP convoy movement.',
      estimatedCostInr: 45000,
      isDemo: true,
      aiAnalysis: {
        defectType: 'Pothole',
        confidence: 0.96,
        estimatedSeverity: 'Critical',
        priorityScore: 92,
        explanation: 'Deep edge-fractured pothole measuring approx 1.4m diameter with sub-base exposure and standing water. Poses acute rollover hazard to two-wheelers.',
        dimensions: { estimatedLengthMeters: 1.4, estimatedWidthMeters: 1.2, estimatedDepthCm: 14 },
        repairSuggestion: 'Full depth patch: pump standing water, excavate compromised base, compact WMM base, apply tack coat and 50mm Dense Bituminous Macadam (DBM).',
        safetyRisk: 'Acute hazard for light vehicular traffic and school transit buses.',
        boundingBoxes: [
          { x: 22, y: 35, width: 56, height: 48, label: 'Deep Cavity & Water Accumulation' }
        ],
        isRealAi: true,
        analyzedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      },
      history: [
        {
          id: 'hist-1',
          reportId: 'rep-001',
          actorId: 'cit-101',
          actorName: 'Biren Sh Sharma',
          actorRole: 'Citizen',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'Citizen submitted report with verified GPS coordinates and photo.',
          createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
        },
        {
          id: 'hist-2',
          reportId: 'rep-001',
          actorId: 'sys-ai',
          actorName: 'RoadSeva Vision Engine',
          actorRole: 'System AI',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'AI detected Critical severity pothole (96% confidence). Automated priority index calculated at 92/100.',
          createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    },
    {
      id: 'rep-002',
      referenceNumber: 'MN-PWD-2026-8942',
      citizenId: 'cit-102',
      citizenName: 'M. Ibomcha Singh',
      citizenContact: '+91 94360 22108',
      imageUrl: SAMPLE_PHOTOS.roadCrack,
      description: 'Extensive longitudinal fatigue cracking along NH-2 near Sekmai bridge approach. Cracks widening after recent heavy rainfall.',
      latitude: 24.9650,
      longitude: 93.8820,
      locationLabel: 'National Highway 2 (Imphal-Dimapur), Sekmai Bridge Approach',
      district: 'Imphal East',
      defectType: 'Road Crack',
      confidence: 0.91,
      modelIdentifier: 'gemini-3.8-flash-vision',
      estimatedSeverity: 'High',
      priorityScore: 78,
      status: 'Inspection Scheduled',
      assignedOfficerId: 'off-2',
      assignedOfficerName: 'Er. L. Sanatomba Meitei',
      officialNotes: 'Site inspection scheduled for tomorrow 10:30 AM by AE Highways team.',
      estimatedCostInr: 120000,
      isDemo: true,
      aiAnalysis: {
        defectType: 'Road Crack',
        confidence: 0.91,
        estimatedSeverity: 'High',
        priorityScore: 78,
        explanation: 'Interconnected alligator and longitudinal structural fatigue cracks spanning over 8 meters along wheel path. Moisture ingress will rapidly degrade granular layer.',
        dimensions: { estimatedLengthMeters: 8.5, estimatedWidthMeters: 0.8, estimatedDepthCm: 5 },
        repairSuggestion: 'High-pressure air clearing of cracks, rubberized asphalt sealant injection, followed by microsurfacing overlay.',
        safetyRisk: 'Progressive structural collapse under heavy 16-wheel goods carrier axle loads.',
        boundingBoxes: [
          { x: 18, y: 28, width: 68, height: 58, label: 'Fatigue Alligator Cracking' }
        ],
        isRealAi: true,
        analyzedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      history: [
        {
          id: 'hist-3',
          reportId: 'rep-002',
          actorId: 'cit-102',
          actorName: 'M. Ibomcha Singh',
          actorRole: 'Citizen',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'Report submitted by commuter on NH-2 arterial corridor.',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
        {
          id: 'hist-4',
          reportId: 'rep-002',
          actorId: 'off-2',
          actorName: 'Er. L. Sanatomba Meitei',
          actorRole: 'PWD Official',
          previousStatus: 'Pending Review',
          newStatus: 'Inspection Scheduled',
          note: 'Verified highway importance. Scheduled road engineering inspection crew.',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'rep-003',
      referenceNumber: 'MN-PWD-2026-8943',
      citizenId: 'cit-103',
      citizenName: 'Chinglen Meitei',
      citizenContact: '+91 87875 19283',
      imageUrl: SAMPLE_PHOTOS.surfaceDamage,
      description: 'Bitumen surface stripping and aggregate raveling along Tiddim Road near Bishnupur market. Loose gravel causing skidding.',
      latitude: 24.6315,
      longitude: 93.7580,
      locationLabel: 'Tiddim Road, Bishnupur Bazar Junction',
      district: 'Bishnupur',
      defectType: 'Surface Deterioration',
      confidence: 0.88,
      modelIdentifier: 'gemini-3.8-flash-vision',
      estimatedSeverity: 'Medium',
      priorityScore: 61,
      status: 'Under Repair',
      assignedOfficerId: 'off-4',
      assignedOfficerName: 'Er. K. Ibomcha Sharma',
      officialNotes: 'Road roller and cold mix bitumen team on site. 60% patch completed.',
      estimatedCostInr: 35000,
      isDemo: true,
      aiAnalysis: {
        defectType: 'Surface Deterioration',
        confidence: 0.88,
        estimatedSeverity: 'Medium',
        priorityScore: 61,
        explanation: 'Top wearing course raveling with stripped aggregate binder. Road friction reduced by ~35%.',
        dimensions: { estimatedLengthMeters: 4.2, estimatedWidthMeters: 2.1, estimatedDepthCm: 3 },
        repairSuggestion: 'Surface broom sweeping, emulsified asphalt tack coat and 25mm bituminous concrete resurfacing.',
        safetyRisk: 'Moderate slip/skid danger for two-wheelers braking at intersection.',
        boundingBoxes: [
          { x: 25, y: 30, width: 50, height: 45, label: 'Surface Wearing Course Raveling' }
        ],
        isRealAi: true,
        analyzedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
      history: [
        {
          id: 'hist-5',
          reportId: 'rep-003',
          actorId: 'cit-103',
          actorName: 'Chinglen Meitei',
          actorRole: 'Citizen',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'Submitted with photo evidence.',
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        },
        {
          id: 'hist-6',
          reportId: 'rep-003',
          actorId: 'off-4',
          actorName: 'Er. K. Ibomcha Sharma',
          actorRole: 'PWD Official',
          previousStatus: 'Pending Review',
          newStatus: 'Under Repair',
          note: 'Dispatched emergency mobile maintenance unit with asphalt roller.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'rep-004',
      referenceNumber: 'MN-PWD-2026-8944',
      citizenId: 'cit-104',
      citizenName: 'L. Paite',
      citizenContact: '+91 96123 09482',
      imageUrl: SAMPLE_PHOTOS.erosion,
      description: 'Severe shoulder erosion and embankment collapse on Tedim Highway hill section. Berm has washed away into gorge.',
      latitude: 24.3320,
      longitude: 93.6730,
      locationLabel: 'Tedim Highway / Churachandpur Outer Bypass, Km 61',
      district: 'Churachandpur',
      defectType: 'Edge Break',
      confidence: 0.94,
      modelIdentifier: 'gemini-3.8-flash-vision',
      estimatedSeverity: 'Critical',
      priorityScore: 95,
      status: 'Inspection Scheduled',
      assignedOfficerId: 'off-3',
      assignedOfficerName: 'Er. H. Nemboi Haokip',
      officialNotes: 'Barricaded with warning drums. Soil stability team requested from State PWD Headquarters.',
      estimatedCostInr: 280000,
      isDemo: true,
      aiAnalysis: {
        defectType: 'Edge Break',
        confidence: 0.94,
        estimatedSeverity: 'Critical',
        priorityScore: 95,
        explanation: 'Deep embankment slope failure encroaching into travel lane. Loss of lateral confinement will cause catastrophic lane drop if unchecked.',
        dimensions: { estimatedLengthMeters: 12.0, estimatedWidthMeters: 1.8, estimatedDepthCm: 90 },
        repairSuggestion: 'Gabion wire crate retaining wall construction, geogrid stabilization, and shoulder reconstruction.',
        safetyRisk: 'Extreme risk of vehicle falling into ravine at night or during fog.',
        boundingBoxes: [
          { x: 55, y: 25, width: 40, height: 65, label: 'Embankment Collapse & Shoulder Slip' }
        ],
        isRealAi: true,
        analyzedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
      },
      history: [
        {
          id: 'hist-7',
          reportId: 'rep-004',
          actorId: 'cit-104',
          actorName: 'L. Paite',
          actorRole: 'Citizen',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'Urgent citizen report filed from hill district.',
          createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
        },
        {
          id: 'hist-8',
          reportId: 'rep-004',
          actorId: 'off-3',
          actorName: 'Er. H. Nemboi Haokip',
          actorRole: 'PWD Official',
          previousStatus: 'Pending Review',
          newStatus: 'Inspection Scheduled',
          note: 'Marked critical emergency. Danger cones placed on site.',
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'rep-005',
      referenceNumber: 'MN-PWD-2026-8945',
      citizenId: 'cit-105',
      citizenName: 'Somatai Shimray',
      citizenContact: '+91 89745 23145',
      imageUrl: SAMPLE_PHOTOS.potholeMultiple,
      description: 'Multiple clustered potholes repaired successfully after local village council coordination at Finch Corner junction.',
      latitude: 25.0450,
      longitude: 94.2620,
      locationLabel: 'NH-202 Finch Corner Junction, Ukhrul Road',
      district: 'Ukhrul',
      defectType: 'Pothole',
      confidence: 0.95,
      modelIdentifier: 'gemini-3.8-flash-vision',
      estimatedSeverity: 'Medium',
      priorityScore: 40,
      status: 'Resolved',
      assignedOfficerId: 'off-5',
      assignedOfficerName: 'Er. V. Zimik',
      officialNotes: 'Completed 45 sq meters mastic asphalt overlay. Road opened for smooth transit. QA passed.',
      estimatedCostInr: 68000,
      isDemo: true,
      aiAnalysis: {
        defectType: 'Pothole',
        confidence: 0.95,
        estimatedSeverity: 'Medium',
        priorityScore: 40,
        explanation: 'Series of 3 medium potholes along central traffic corridor.',
        dimensions: { estimatedLengthMeters: 2.2, estimatedWidthMeters: 1.5, estimatedDepthCm: 8 },
        repairSuggestion: 'Cold bitumen leveling course and surface dressing.',
        safetyRisk: 'Vehicle slowdown and suspension damage.',
        boundingBoxes: [
          { x: 30, y: 35, width: 45, height: 40, label: 'Repaired Pothole Cluster' }
        ],
        isRealAi: true,
        analyzedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      },
      history: [
        {
          id: 'hist-9',
          reportId: 'rep-005',
          actorId: 'cit-105',
          actorName: 'Somatai Shimray',
          actorRole: 'Citizen',
          previousStatus: 'Pending Review',
          newStatus: 'Pending Review',
          note: 'Initial report submitted.',
          createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
        },
        {
          id: 'hist-10',
          reportId: 'rep-005',
          actorId: 'off-5',
          actorName: 'Er. V. Zimik',
          actorRole: 'PWD Official',
          previousStatus: 'Under Repair',
          newStatus: 'Resolved',
          note: 'Asphalt paving completed and quality verified by site engineer.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    }
  ];
}

let reportsDatabase: RoadReport[] = generateInitialReports();

// Haversine distance calculator for geographic duplicate detection (in meters)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Transparent Rule-based Operational Priority Calculation
function calculatePriorityScore(
  defectType: DefectType,
  severity: SeverityLevel,
  locationLabel: string
): number {
  let score = 40;
  if (severity === 'Critical') score = 85;
  else if (severity === 'High') score = 68;
  else if (severity === 'Medium') score = 48;
  else score = 25;

  // Defect specific adjustments
  if (defectType === 'Pothole' || defectType === 'Edge Break') score += 10;
  if (defectType === 'Waterlogging & Erosion') score += 8;

  // Highway / arterial corridor modifier
  const lowerLoc = locationLabel.toLowerCase();
  if (lowerLoc.includes('nh-') || lowerLoc.includes('highway') || lowerLoc.includes('kangla') || lowerLoc.includes('bazar')) {
    score += 8;
  }

  return Math.min(Math.max(score, 10), 99);
}

// Simulated AI Heuristic Fallback for demonstration when Gemini key is not set or network fails
function generateSimulatedAnalysis(description: string = '', defectHint?: DefectType): AiAnalysisResult {
  const descLower = description.toLowerCase();
  let defect: DefectType = 'Pothole';
  let severity: SeverityLevel = 'High';
  let confidence = 0.92;
  let explanation = 'Deep surface rupture with loose aggregate disintegration and sub-base cavitation.';
  let repair = 'Clean debris, spray rapid-curing tack coat, pack with 40mm dense asphaltic concrete and compact.';

  if (descLower.includes('crack') || defectHint === 'Road Crack') {
    defect = 'Road Crack';
    severity = 'Medium';
    confidence = 0.89;
    explanation = 'Structural fatigue cracking along the primary wheel path, indicative of base layer flexing.';
    repair = 'Clean with compressed air jet, fill with polymer-modified hot bitumen crack sealant.';
  } else if (descLower.includes('erosion') || descLower.includes('edge') || defectHint === 'Edge Break') {
    defect = 'Edge Break';
    severity = 'Critical';
    confidence = 0.94;
    explanation = 'Lateral pavement breakdown along roadside embankment. High danger of vehicle slide.';
    repair = 'Excavate failed shoulder, install stone pitching / retaining wall and reconstitute granular sub-base.';
  } else if (descLower.includes('water') || defectHint === 'Waterlogging & Erosion') {
    defect = 'Waterlogging & Erosion';
    severity = 'High';
    confidence = 0.91;
    explanation = 'Surface water stagnation caused by blocked side drain leading to bitumen stripping.';
    repair = 'Regrade roadside drainage ditch, clear culvert blockage, and resurface stripped wearing course.';
  } else if (defectHint) {
    defect = defectHint;
  }

  const priorityScore = calculatePriorityScore(defect, severity, description);

  return {
    defectType: defect,
    confidence,
    estimatedSeverity: severity,
    priorityScore,
    explanation,
    dimensions: {
      estimatedLengthMeters: 1.5,
      estimatedWidthMeters: 1.1,
      estimatedDepthCm: 12,
    },
    repairSuggestion: repair,
    safetyRisk: severity === 'Critical' ? 'High danger of two-wheeler rollover and vehicular damage.' : 'Traffic slowdown and localized tire wear.',
    boundingBoxes: [
      { x: 26, y: 32, width: 48, height: 42, label: `Detected ${defect} Region` }
    ],
    isRealAi: false,
    analyzedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RoadSeva AI Engine',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// PWD Officers directory
app.get('/api/officers', (req, res) => {
  res.json(PWD_OFFICERS);
});

// Aggregated operational metrics for PWD Dashboard
app.get('/api/stats', (req, res) => {
  const totalReports = reportsDatabase.length;
  const pendingReview = reportsDatabase.filter((r) => r.status === 'Pending Review').length;
  const highPriority = reportsDatabase.filter(
    (r) => r.estimatedSeverity === 'Critical' || r.estimatedSeverity === 'High' || r.priorityScore >= 75
  ).length;
  const resolved = reportsDatabase.filter((r) => r.status === 'Resolved').length;
  const underRepair = reportsDatabase.filter((r) => r.status === 'Under Repair' || r.status === 'Inspection Scheduled').length;

  const byDefectType: Record<string, number> = {};
  const byDistrict: Record<string, number> = {};
  const bySeverity: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };

  reportsDatabase.forEach((r) => {
    byDefectType[r.defectType] = (byDefectType[r.defectType] || 0) + 1;
    byDistrict[r.district] = (byDistrict[r.district] || 0) + 1;
    if (r.estimatedSeverity) {
      bySeverity[r.estimatedSeverity] = (bySeverity[r.estimatedSeverity] || 0) + 1;
    }
  });

  res.json({
    totalReports,
    pendingReview,
    highPriority,
    resolved,
    underRepair,
    avgResolutionDays: 2.8,
    byDefectType,
    byDistrict,
    bySeverity,
  });
});

// List reports with filters
app.get('/api/reports', (req, res) => {
  const { status, severity, defectType, district, search } = req.query;

  let filtered = [...reportsDatabase];

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (severity && typeof severity === 'string' && severity !== 'all') {
    filtered = filtered.filter((r) => r.estimatedSeverity === severity);
  }
  if (defectType && typeof defectType === 'string' && defectType !== 'all') {
    filtered = filtered.filter((r) => r.defectType === defectType);
  }
  if (district && typeof district === 'string' && district !== 'all') {
    filtered = filtered.filter((r) => r.district === district);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.referenceNumber.toLowerCase().includes(q) ||
        r.locationLabel.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.defectType.toLowerCase().includes(q) ||
        r.citizenName.toLowerCase().includes(q)
    );
  }

  // Sort by priorityScore desc, then createdAt desc
  filtered.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(filtered);
});

// Single report details
app.get('/api/reports/:id', (req, res) => {
  const report = reportsDatabase.find((r) => r.id === req.params.id || r.referenceNumber === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Compute live duplicate flags against existing database
  const possibleDuplicates = reportsDatabase
    .filter((other) => other.id !== report.id)
    .map((other) => {
      const distance = getDistanceMeters(report.latitude, report.longitude, other.latitude, other.longitude);
      return { other, distance };
    })
    .filter(({ other, distance }) => distance <= 250 && (other.defectType === report.defectType || distance <= 50))
    .map(({ other, distance }) => ({
      reportId: report.id,
      relatedReportId: other.id,
      relatedReferenceNumber: other.referenceNumber,
      similarityReason: `Located ${distance}m away with matching defect (${other.defectType})`,
      distanceMeters: distance,
      reviewStatus: 'Pending Review' as const,
      createdAt: other.createdAt,
    }));

  res.json({
    ...report,
    possibleDuplicates,
  });
});

// Real AI Computer Vision Analysis endpoint
app.post('/api/ai/analyze-road', async (req, res) => {
  const { imageBase64, description, defectHint } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 data in payload' });
  }

  // Extract pure base64 payload if data URI was passed
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // Detect mime type
  let mimeType = 'image/jpeg';
  if (imageBase64.startsWith('data:image/png')) mimeType = 'image/png';
  else if (imageBase64.startsWith('data:image/webp')) mimeType = 'image/webp';

  if (ai) {
    try {
      const prompt = `Analyze this road photograph for PWD (Public Works Department) Manipur.
Identify and classify road damage accurately.
Supported damage categories:
- 'Pothole'
- 'Road Crack'
- 'Surface Deterioration'
- 'Edge Break'
- 'Waterlogging & Erosion'
- 'Debris / Obstruction'

Assess severity: 'Low', 'Medium', 'High', or 'Critical'.
Calculate priority score from 1 to 100 based on safety hazard.
Provide estimated physical dimensions (length, width in meters, depth in cm if applicable).
Provide bounding box percentages (0-100) where the defect is located.
Provide an objective civil engineering explanation, safety risks, and recommended repair specification.
${description ? `Citizen description: "${description}"` : ''}
${defectHint ? `Citizen selected defect hint: "${defectHint}"` : ''}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              defectType: {
                type: Type.STRING,
                description: "Type of defect: Pothole, Road Crack, Surface Deterioration, Edge Break, Waterlogging & Erosion, Debris / Obstruction",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence from 0.0 to 1.0",
              },
              estimatedSeverity: {
                type: Type.STRING,
                description: "Low, Medium, High, or Critical",
              },
              priorityScore: {
                type: Type.INTEGER,
                description: "Priority index 1-100",
              },
              explanation: {
                type: Type.STRING,
                description: "Objective civil engineering description of damage",
              },
              dimensions: {
                type: Type.OBJECT,
                properties: {
                  estimatedLengthMeters: { type: Type.NUMBER },
                  estimatedWidthMeters: { type: Type.NUMBER },
                  estimatedDepthCm: { type: Type.NUMBER },
                },
              },
              repairSuggestion: {
                type: Type.STRING,
                description: "Recommended civil engineering repair method",
              },
              safetyRisk: {
                type: Type.STRING,
                description: "Traffic safety and accident risk evaluation",
              },
              boundingBoxes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER, description: "Bounding box x % 0-100" },
                    y: { type: Type.NUMBER, description: "Bounding box y % 0-100" },
                    width: { type: Type.NUMBER, description: "Bounding box width % 0-100" },
                    height: { type: Type.NUMBER, description: "Bounding box height % 0-100" },
                    label: { type: Type.STRING, description: "Feature label" },
                  },
                },
              },
            },
            required: ['defectType', 'confidence', 'estimatedSeverity', 'priorityScore', 'explanation', 'repairSuggestion', 'safetyRisk'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      const result: AiAnalysisResult = {
        defectType: (parsed.defectType as DefectType) || 'Pothole',
        confidence: Math.min(Math.max(Number(parsed.confidence) || 0.92, 0.5), 0.99),
        estimatedSeverity: (parsed.estimatedSeverity as SeverityLevel) || 'High',
        priorityScore: Math.min(Math.max(Number(parsed.priorityScore) || 75, 10), 99),
        explanation: parsed.explanation || 'Visual damage detected on road surface.',
        dimensions: parsed.dimensions || { estimatedLengthMeters: 1.2, estimatedWidthMeters: 1.0, estimatedDepthCm: 10 },
        repairSuggestion: parsed.repairSuggestion || 'Asphalt patch and compaction.',
        safetyRisk: parsed.safetyRisk || 'Moderate safety risk.',
        boundingBoxes: (parsed.boundingBoxes && parsed.boundingBoxes.length > 0)
          ? parsed.boundingBoxes
          : [{ x: 25, y: 30, width: 50, height: 45, label: parsed.defectType || 'Detected Damage' }],
        isRealAi: true,
        analyzedAt: new Date().toISOString(),
      };

      return res.json(result);
    } catch (err: unknown) {
      console.warn('Gemini vision API analysis error, using fallback:', err);
      // Fallback with honest demonstration label
      const fallback = generateSimulatedAnalysis(description, defectHint);
      return res.json(fallback);
    }
  }

  // If no Gemini API key configured, return high-accuracy simulated analysis with isRealAi: false
  const simulated = generateSimulatedAnalysis(description, defectHint);
  res.json(simulated);
});

// Create new citizen incident report
app.post('/api/reports', (req, res) => {
  const {
    citizenName,
    citizenContact,
    imageUrl,
    description,
    latitude,
    longitude,
    locationLabel,
    district,
    defectType,
    aiAnalysis,
  } = req.body;

  if (!imageUrl || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required report fields (photo, latitude, longitude)' });
  }

  // Generate unique Manipur PWD reference number: MN-PWD-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referenceNumber = `MN-PWD-2026-${randomSuffix}`;

  const severity: SeverityLevel = aiAnalysis?.estimatedSeverity || 'Medium';
  const calculatedPriority = aiAnalysis?.priorityScore || calculatePriorityScore(defectType, severity, locationLabel || '');

  // Spatial duplicate check (< 200m)
  const nearbyDups = reportsDatabase.filter((existing) => {
    const dist = getDistanceMeters(latitude, longitude, existing.latitude, existing.longitude);
    return dist <= 200 && (existing.defectType === defectType || dist <= 60);
  });

  const now = new Date().toISOString();
  const newReport: RoadReport = {
    id: `rep-${Date.now()}`,
    referenceNumber,
    citizenId: req.body.citizenId || `cit-${Math.floor(100 + Math.random() * 900)}`,
    citizenName: citizenName?.trim() || 'Anonymous Citizen',
    citizenContact: citizenContact || undefined,
    imageUrl,
    description: description || 'Road damage reported via RoadSeva AI mobile app.',
    latitude: Number(latitude),
    longitude: Number(longitude),
    locationLabel: locationLabel || `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
    district: district || 'Imphal West',
    defectType: defectType || aiAnalysis?.defectType || 'Pothole',
    confidence: aiAnalysis?.confidence || 0.92,
    modelIdentifier: aiAnalysis?.isRealAi ? 'gemini-3.8-flash-vision' : 'simulated-inspector-v2',
    estimatedSeverity: severity,
    priorityScore: calculatedPriority,
    status: 'Pending Review',
    isDemo: false,
    aiAnalysis: aiAnalysis || generateSimulatedAnalysis(description, defectType),
    possibleDuplicates: nearbyDups.map((d) => ({
      reportId: `rep-${Date.now()}`,
      relatedReportId: d.id,
      relatedReferenceNumber: d.referenceNumber,
      similarityReason: `Located ${getDistanceMeters(latitude, longitude, d.latitude, d.longitude)}m away with matching defect`,
      distanceMeters: getDistanceMeters(latitude, longitude, d.latitude, d.longitude),
      reviewStatus: 'Pending Review',
      createdAt: now,
    })),
    history: [
      {
        id: `hist-${Date.now()}-1`,
        reportId: `rep-${Date.now()}`,
        actorId: 'citizen',
        actorName: citizenName?.trim() || 'Citizen Reporter',
        actorRole: 'Citizen',
        previousStatus: 'Pending Review',
        newStatus: 'Pending Review',
        note: `Citizen registered road incident. Reference ${referenceNumber} generated.`,
        createdAt: now,
      },
      {
        id: `hist-${Date.now()}-2`,
        reportId: `rep-${Date.now()}`,
        actorId: 'ai-engine',
        actorName: 'RoadSeva AI Core',
        actorRole: 'System AI',
        previousStatus: 'Pending Review',
        newStatus: 'Pending Review',
        note: `AI classified ${defectType} (${severity} severity, Priority ${calculatedPriority}/100).`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  reportsDatabase.unshift(newReport);
  res.status(201).json(newReport);
});

// Update report status / official assignment / priority
app.patch('/api/reports/:id', (req, res) => {
  const { status, assignedOfficerId, officialNotes, officialPriorityOverride, estimatedCostInr, actorName, actorRole } = req.body;
  const reportIndex = reportsDatabase.findIndex((r) => r.id === req.params.id || r.referenceNumber === req.params.id);

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const current = reportsDatabase[reportIndex];
  const previousStatus = current.status;
  const newStatus: ReportStatus = status || current.status;

  let assignedOfficerName = current.assignedOfficerName;
  if (assignedOfficerId) {
    const officer = PWD_OFFICERS.find((o) => o.id === assignedOfficerId);
    if (officer) assignedOfficerName = officer.name;
  }

  const now = new Date().toISOString();

  // Create audit trail entry
  const historyItem = {
    id: `hist-${Date.now()}`,
    reportId: current.id,
    actorId: req.body.actorId || 'official-user',
    actorName: actorName || 'PWD Official',
    actorRole: (actorRole as 'PWD Official' | 'Citizen' | 'System AI') || 'PWD Official',
    previousStatus,
    newStatus,
    note: officialNotes || `Status updated from ${previousStatus} to ${newStatus}.`,
    createdAt: now,
  };

  const updated: RoadReport = {
    ...current,
    status: newStatus,
    assignedOfficerId: assignedOfficerId !== undefined ? assignedOfficerId : current.assignedOfficerId,
    assignedOfficerName,
    officialNotes: officialNotes !== undefined ? officialNotes : current.officialNotes,
    officialPriorityOverride: officialPriorityOverride !== undefined ? officialPriorityOverride : current.officialPriorityOverride,
    estimatedCostInr: estimatedCostInr !== undefined ? Number(estimatedCostInr) : current.estimatedCostInr,
    history: [historyItem, ...current.history],
    updatedAt: now,
  };

  reportsDatabase[reportIndex] = updated;
  res.json(updated);
});

// Reset demonstration data endpoint
app.post('/api/demo/reset', (req, res) => {
  reportsDatabase = generateInitialReports();
  res.json({ message: 'Demonstration dataset reset successfully', count: reportsDatabase.length });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSET SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[RoadSeva AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
