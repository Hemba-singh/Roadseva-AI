import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  RotateCw,
  X,
  ShieldAlert,
  Wrench,
  Ruler,
  Navigation,
  Copy,
  Check,
  Eye,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IncidentMap } from '../common/IncidentMap.js';
import type { AiAnalysisResult, DefectType, RoadReport, SeverityLevel } from '../../types/index.js';

interface ReportDamageWizardProps {
  onSuccess: (newReport: RoadReport) => void;
  onCancel: () => void;
}

const MANIPUR_DISTRICTS = [
  'Imphal West',
  'Imphal East',
  'Bishnupur',
  'Thoubal',
  'Churachandpur',
  'Ukhrul',
  'Senapati',
  'Tamenglong',
  'Kangpokpi',
  'Kakching',
  'Jiribam',
  'Tengnoupal',
  'Chandel',
  'Kamjong',
  'Noney',
  'Pherzawl',
];

const PRESET_SAMPLE_PHOTOS = [
  {
    title: 'Severe Pothole (Kangla Perimeter)',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    type: 'Pothole' as DefectType,
    location: 'Kangla Western Perimeter Road, Imphal',
    district: 'Imphal West',
    lat: 24.8055,
    lng: 93.9405,
  },
  {
    title: 'Fatigue Cracks (NH-2 Sekmai)',
    url: 'https://images.unsplash.com/photo-1584463699043-467f56193e2b?auto=format&fit=crop&w=1000&q=80',
    type: 'Road Crack' as DefectType,
    location: 'National Highway 2 (Imphal-Dimapur), Sekmai',
    district: 'Imphal East',
    lat: 24.9650,
    lng: 93.8820,
  },
  {
    title: 'Surface Stripping (Tiddim Road)',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1000&q=80',
    type: 'Surface Deterioration' as DefectType,
    location: 'Tiddim Road, Bishnupur Bazar Junction',
    district: 'Bishnupur',
    lat: 24.6315,
    lng: 93.7580,
  },
  {
    title: 'Shoulder Slip (Tedim Highway)',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
    type: 'Edge Break' as DefectType,
    location: 'Tedim Highway / Churachandpur Outer Bypass, Km 61',
    district: 'Churachandpur',
    lat: 24.3320,
    lng: 93.6730,
  },
];

export const ReportDamageWizard: React.FC<ReportDamageWizardProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [citizenDescription, setCitizenDescription] = useState<string>('');
  const [selectedDefectHint, setSelectedDefectHint] = useState<DefectType | ''>('');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Location State
  const [latitude, setLatitude] = useState<number>(24.8055);
  const [longitude, setLongitude] = useState<number>(93.9405);
  const [locationLabel, setLocationLabel] = useState<string>('Kangla Fort Western Perimeter Road, Imphal');
  const [district, setDistrict] = useState<string>('Imphal West');
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Citizen Details
  const [citizenName, setCitizenName] = useState<string>('');
  const [citizenContact, setCitizenContact] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<RoadReport | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Photo size exceeds 15MB. Please choose a smaller photograph.');
      return;
    }

    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Select Preset Sample Photo
  const handleSelectPreset = (preset: (typeof PRESET_SAMPLE_PHOTOS)[0]) => {
    setPhotoDataUrl(preset.url);
    setPhotoName(preset.title);
    setSelectedDefectHint(preset.type);
    setLocationLabel(preset.location);
    setDistrict(preset.district);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  // Run Real AI Damage Analysis
  const runAiAnalysis = async () => {
    if (!photoDataUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentStep(2);

    try {
      const res = await fetch('/api/ai/analyze-road', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoDataUrl,
          description: citizenDescription,
          defectHint: selectedDefectHint || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis service returned an error');
      }

      const result: AiAnalysisResult = await res.json();
      setAiResult(result);
    } catch (err: unknown) {
      console.error('Failed to run AI analysis:', err);
      setAnalysisError('Vision analysis encountered a temporary issue. Using calibrated engineering model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture real GPS Location
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingGPS(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationLabel(`GPS Verified: ${lat}°N, ${lng}°E`);
      },
      (error) => {
        setIsLocatingGPS(false);
        setGpsError(error.message || 'Unable to retrieve your current location. You can select it on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Final Submission
  const handleSubmitReport = async () => {
    if (isSubmitting || !photoDataUrl) return;

    setIsSubmitting(true);
    try {
      const payload = {
        citizenName: citizenName.trim() || 'Civic Volunteer',
        citizenContact: citizenContact.trim() || undefined,
        imageUrl: photoDataUrl,
        description: citizenDescription.trim() || `Road damage reported near ${locationLabel}`,
        latitude,
        longitude,
        locationLabel: locationLabel.trim() || `${latitude}°N, ${longitude}°E`,
        district,
        defectType: aiResult?.defectType || selectedDefectHint || 'Pothole',
        aiAnalysis: aiResult,
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit report');
      }

      const newReport: RoadReport = await res.json();
      setSubmittedReport(newReport);
      setCurrentStep(5); // Success step

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#34C759', '#FF9500', '#5856D6'],
      });
    } catch (err: unknown) {
      console.error('Submission error:', err);
      alert('Failed to submit incident. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceToClipboard = () => {
    if (!submittedReport) return;
    navigator.clipboard.writeText(submittedReport.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      {/* iOS Modal Header / Progress */}
      <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden mb-6">
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E5EA] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#007AFF]">
                PWD-01 Manipur Civic Action
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#1D1D1F] mt-1">Report Road Damage</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple Step Indicator */}
        {currentStep < 5 && (
          <div className="px-6 py-3 bg-[#F5F5F7] flex items-center justify-between text-xs font-medium text-[#6E6E73]">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-[#007AFF] font-semibold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 1 ? 'bg-[#007AFF] text-white' : 'bg-gray-200'}`}>1</span>
              <span>Photo</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-[#007AFF] font-semibold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 2 ? 'bg-[#007AFF] text-white' : 'bg-gray-200'}`}>2</span>
              <span>AI Scan</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-[#007AFF] font-semibold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 3 ? 'bg-[#007AFF] text-white' : 'bg-gray-200'}`}>3</span>
              <span>Location</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-[#007AFF] font-semibold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 4 ? 'bg-[#007AFF] text-white' : 'bg-gray-200'}`}>4</span>
              <span>Submit</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: UPLOAD PHOTO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Step 1: Upload Road Photograph</h3>
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  Capture a clear photograph showing the road damage, water stagnation, or pavement crack.
                </p>
              </div>

              {/* Photo Upload Area */}
              {photoDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-[#E5E5EA] bg-black aspect-video max-h-72 flex items-center justify-center group">
                  <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPhotoDataUrl('');
                        setPhotoName('');
                        setAiResult(null);
                      }}
                      className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Replace Photo
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs">
                    {photoName || 'Captured Image'}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#E5E5EA] hover:border-[#007AFF] rounded-2xl p-6 sm:p-8 text-center transition bg-[#F5F5F7]/50">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-[#007AFF] mx-auto flex items-center justify-center mb-4">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="font-semibold text-[#1D1D1F] text-base mb-1">Take photo or upload image</h4>
                  <p className="text-xs text-[#6E6E73] max-w-sm mx-auto mb-4">
                    Supports JPG, PNG, WebP up to 15MB. On mobile, launches camera directly.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition">
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E5EA] bg-white hover:bg-gray-50 text-[#1D1D1F] font-medium text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98 transition">
                      <Upload className="w-4 h-4 text-[#007AFF]" />
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Quick Preset Demonstrators */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                    Quick Test: Select Manipur Road Incident Sample
                  </span>
                  <span className="text-[11px] text-[#007AFF]">Tap to populate</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative rounded-xl overflow-hidden border p-2 text-left transition cursor-pointer ${
                        photoDataUrl === preset.url
                          ? 'border-[#007AFF] ring-2 ring-blue-500/20 bg-blue-50/30'
                          : 'border-[#E5E5EA] bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="h-16 rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                        <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="font-semibold text-xs text-[#1D1D1F] truncate">{preset.title.split(' ')[0]}</div>
                      <div className="text-[10px] text-[#6E6E73] truncate">{preset.district}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Citizen Notes (Optional) */}
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Additional Details or Landmark (Optional)
                </label>
                <textarea
                  value={citizenDescription}
                  onChange={(e) => setCitizenDescription(e.target.value)}
                  placeholder="e.g. Near Kangla West Gate, deep waterlogged pothole dangerous at night..."
                  rows={2}
                  className="w-full rounded-xl border border-[#E5E5EA] bg-white p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF] transition"
                />
              </div>

              {/* Next Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!photoDataUrl}
                  onClick={runAiAnalysis}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#007AFF] disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 active:scale-98 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with AI</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI ANALYSIS SCREEN */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#1D1D1F]">Step 2: AI Road Damage Analysis</h3>
                  {aiResult?.isRealAi ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Sparkles className="w-3 h-3" /> Gemini 3.8 Flash Vision
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Info className="w-3 h-3" /> Demonstration Model
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  Automated computer vision detection of pavement defects, dimensions, and priority rating.
                </p>
              </div>

              {/* Analysis Loading State */}
              {isAnalyzing ? (
                <div className="py-12 px-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-[#007AFF] animate-spin" />
                    <Sparkles className="w-8 h-8 text-[#007AFF] absolute inset-0 m-auto" />
                  </div>
                  <h4 className="font-semibold text-base text-[#1D1D1F]">Scanning Pavement Surface...</h4>
                  <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
                    Executing civil defect segmentation, cavitation estimation, and safety risk inference.
                  </p>
                </div>
              ) : aiResult ? (
                <div className="space-y-5">
                  {/* Image with Bounding Boxes */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#E5E5EA] bg-black max-h-80 flex items-center justify-center">
                    <img src={photoDataUrl} alt="Analyzed Damage" className="w-full h-full object-cover" />

                    {/* Bounding Box Highlights */}
                    {showBoundingBoxes &&
                      aiResult.boundingBoxes?.map((box, idx) => (
                        <div
                          key={idx}
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                          }}
                          className="absolute border-2 border-[#34C759] bg-green-500/15 rounded-md pointer-events-none transition"
                        >
                          <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-[#34C759] text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                            {box.label || aiResult.defectType}
                          </span>
                        </div>
                      ))}

                    {/* Bounding box toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showBoundingBoxes ? 'Hide Markers' : 'Show Markers'}</span>
                    </button>
                  </div>

                  {/* AI Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <div className="text-[11px] font-medium text-[#6E6E73]">Detected Defect</div>
                      <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">{aiResult.defectType}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                        {(aiResult.confidence * 100).toFixed(0)}% Confidence
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <div className="text-[11px] font-medium text-[#6E6E73]">Estimated Severity</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            aiResult.estimatedSeverity === 'Critical'
                              ? 'bg-[#FF3B30]'
                              : aiResult.estimatedSeverity === 'High'
                              ? 'bg-[#FF9500]'
                              : 'bg-[#FFCC00]'
                          }`}
                        />
                        <span className="font-bold text-[#1D1D1F] text-sm">{aiResult.estimatedSeverity}</span>
                      </div>
                      <div className="text-[10px] text-[#6E6E73] mt-1">Hazard evaluation</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <div className="text-[11px] font-medium text-[#6E6E73]">Operational Priority</div>
                      <div className="font-bold text-[#007AFF] text-base mt-0.5">
                        {aiResult.priorityScore}<span className="text-xs text-[#6E6E73] font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-[#6E6E73] mt-1">Queue weight</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                      <div className="text-[11px] font-medium text-[#6E6E73]">Dimensions (Approx)</div>
                      <div className="font-bold text-[#1D1D1F] text-xs mt-0.5">
                        {aiResult.dimensions?.estimatedLengthMeters}m × {aiResult.dimensions?.estimatedWidthMeters}m
                      </div>
                      <div className="text-[10px] text-[#6E6E73] mt-1">
                        {aiResult.dimensions?.estimatedDepthCm ? `Depth ~${aiResult.dimensions.estimatedDepthCm}cm` : 'Surface layer'}
                      </div>
                    </div>
                  </div>

                  {/* Civil Engineering Explanation & Suggestions */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#1D1D1F]">Defect Analysis & Safety Hazard</div>
                        <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">{aiResult.explanation}</p>
                        <p className="text-[11px] text-amber-700 font-medium mt-1">
                          Safety Risk: {aiResult.safetyRisk}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-start gap-2.5">
                      <Wrench className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#1D1D1F]">Suggested PWD Remediation</div>
                        <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">{aiResult.repairSuggestion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Defect Type Adjustment */}
                  <div>
                    <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                      Need to correct defect category? (Optional citizen override)
                    </label>
                    <select
                      value={aiResult.defectType}
                      onChange={(e) =>
                        setAiResult({
                          ...aiResult,
                          defectType: e.target.value as DefectType,
                        })
                      }
                      className="w-full rounded-xl border border-[#E5E5EA] bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF]"
                    >
                      <option value="Pothole">Pothole</option>
                      <option value="Road Crack">Road Crack</option>
                      <option value="Surface Deterioration">Surface Deterioration</option>
                      <option value="Edge Break">Edge Break</option>
                      <option value="Waterlogging & Erosion">Waterlogging & Erosion</option>
                      <option value="Debris / Obstruction">Debris / Obstruction</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Navigation Controls */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-[#1D1D1F] text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Photo</span>
                </button>

                <button
                  type="button"
                  disabled={!aiResult || isAnalyzing}
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#007AFF] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-98 transition"
                >
                  <span>Confirm Location</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM LOCATION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Step 3: Confirm Incident Location</h3>
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  Pinpoint exact Manipur road coordinates so PWD maintenance crews can locate and inspect the site.
                </p>
              </div>

              {/* GPS Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleGetGPS}
                  disabled={isLocatingGPS}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#007AFF] text-xs font-semibold flex items-center justify-center gap-2 border border-blue-200 active:scale-98 transition cursor-pointer"
                >
                  <Navigation className={`w-4 h-4 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGPS ? 'Acquiring GPS Fix...' : 'Use My Live GPS Location'}</span>
                </button>

                <div className="px-3 py-2 rounded-xl bg-gray-50 border border-[#E5E5EA] text-center text-xs font-mono text-[#1D1D1F]">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </div>
              </div>

              {gpsError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* Interactive Map */}
              <div>
                <IncidentMap
                  selectedLocation={{ lat: latitude, lng: longitude }}
                  interactiveSelect={true}
                  onLocationSelect={(lat, lng) => {
                    setLatitude(Number(lat.toFixed(6)));
                    setLongitude(Number(lng.toFixed(6)));
                  }}
                  height="260px"
                  zoom={13}
                  center={[latitude, longitude]}
                />
              </div>

              {/* Location Label & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    Road / Landmark Name
                  </label>
                  <input
                    type="text"
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="e.g. Kangla Western Perimeter Road"
                    className="w-full rounded-xl border border-[#E5E5EA] bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                    Manipur District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E5EA] bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF]"
                  >
                    {MANIPUR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-[#1D1D1F] text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to AI Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-blue-600 active:scale-98 transition"
                >
                  <span>Review & Submit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-semibold text-[#1D1D1F]">Step 4: Review and Submit Incident</h3>
                <p className="text-sm text-[#6E6E73] mt-0.5">
                  Confirm the details below. Once submitted, a unique PWD tracking reference will be generated.
                </p>
              </div>

              {/* Review Card */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                    <img src={photoDataUrl} alt="Report Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1D1D1F] text-base">{aiResult?.defectType || 'Pothole'}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aiResult?.estimatedSeverity === 'Critical'
                            ? 'bg-red-100 text-red-700'
                            : aiResult?.estimatedSeverity === 'High'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {aiResult?.estimatedSeverity} Severity
                      </span>
                    </div>
                    <div className="text-xs text-[#6E6E73] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                      <span>{locationLabel} ({district})</span>
                    </div>
                    <div className="text-[11px] text-[#6E6E73] mt-0.5">
                      Coordinates: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E6E73]">AI Confidence: </span>
                    <strong className="text-[#1D1D1F]">{((aiResult?.confidence || 0.9) * 100).toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span className="text-[#6E6E73]">Priority Score: </span>
                    <strong className="text-[#007AFF]">{aiResult?.priorityScore || 75}/100</strong>
                  </div>
                </div>
              </div>

              {/* Citizen Details (Optional) */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#1D1D1F]">Citizen Contact Details (Optional)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name (e.g. Sanasam H.)"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5EA] bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF]"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (for resolution SMS updates)"
                      value={citizenContact}
                      onChange={(e) => setCitizenContact(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5EA] bg-white p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-[#007AFF]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6E6E73]">
                  Your contact details are protected and only used for automated PWD resolution updates.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-[#1D1D1F] text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Location</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitReport}
                  className="px-8 py-3 rounded-xl bg-[#34C759] hover:bg-emerald-600 disabled:bg-gray-300 text-white text-sm font-semibold flex items-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting to PWD...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Incident Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {currentStep === 5 && submittedReport && (
            <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-250">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#34C759] mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#34C759]">Report Registered</span>
                <h3 className="text-2xl font-bold text-[#1D1D1F] mt-1">Thank You for Your Civic Service!</h3>
                <p className="text-sm text-[#6E6E73] max-w-md mx-auto mt-1">
                  Your road damage report has been logged in the PWD Manipur Inspection Queue with priority score {submittedReport.priorityScore}/100.
                </p>
              </div>

              {/* Unique Reference Number Badge */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] max-w-sm mx-auto">
                <div className="text-[11px] font-medium text-[#6E6E73]">Official PWD Tracking ID</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-mono text-xl font-extrabold text-[#007AFF] tracking-wider">
                    {submittedReport.referenceNumber}
                  </span>
                  <button
                    onClick={copyReferenceToClipboard}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition cursor-pointer"
                    title="Copy Reference Number"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-[#6E6E73] mt-1">Keep this reference ID to track repair milestones.</div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onSuccess(submittedReport)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-medium text-sm shadow-sm active:scale-98 transition cursor-pointer"
                >
                  Track This Incident
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl('');
                    setPhotoName('');
                    setAiResult(null);
                    setSubmittedReport(null);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#E5E5EA] bg-white hover:bg-gray-50 text-[#1D1D1F] font-medium text-sm active:scale-98 transition cursor-pointer"
                >
                  Report Another Road
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
