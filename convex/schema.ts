/**
 * Convex Database Schema for RoadSeva AI
 * Defines tables for profiles, reports, reportHistory, and possibleDuplicates.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles with roles (Citizen vs PWD Official)
  profiles: defineTable({
    userId: v.string(),
    fullName: v.string(),
    email: v.string(),
    role: v.union(v.literal("Citizen"), v.literal("PWD Official"), v.literal("Administrator")),
    phone: v.optional(v.string()),
    designation: v.optional(v.string()),
    department: v.optional(v.string()),
    district: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  // Core road damage reports
  reports: defineTable({
    referenceNumber: v.string(),
    citizenId: v.string(),
    citizenName: v.string(),
    citizenContact: v.optional(v.string()),
    imageStorageId: v.string(), // Convex file storage ID or image URL
    imageUrl: v.string(),
    description: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    locationLabel: v.string(),
    district: v.string(),
    defectType: v.string(), // Pothole, Road Crack, etc.
    confidence: v.number(),
    modelIdentifier: v.string(),
    estimatedSeverity: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High"), v.literal("Critical")),
    priorityScore: v.number(),
    officialPriorityOverride: v.optional(v.string()),
    status: v.union(
      v.literal("Pending Review"),
      v.literal("Inspection Scheduled"),
      v.literal("Under Repair"),
      v.literal("Resolved"),
      v.literal("Rejected"),
      v.literal("Duplicate")
    ),
    assignedOfficerId: v.optional(v.string()),
    assignedOfficerName: v.optional(v.string()),
    officialNotes: v.optional(v.string()),
    estimatedCostInr: v.optional(v.number()),
    aiAnalysis: v.any(),
    isDemo: v.optional(v.boolean()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_referenceNumber", ["referenceNumber"])
    .index("by_citizenId", ["citizenId"])
    .index("by_status", ["status"])
    .index("by_severity", ["estimatedSeverity"])
    .index("by_district", ["district"]),

  // Status transition history audit trail
  reportHistory: defineTable({
    reportId: v.string(),
    actorId: v.string(),
    actorName: v.string(),
    actorRole: v.string(),
    previousStatus: v.string(),
    newStatus: v.string(),
    note: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_reportId", ["reportId"]),

  // Spatial / defect duplicate flags for human review
  possibleDuplicates: defineTable({
    reportId: v.string(),
    relatedReportId: v.string(),
    similarityReason: v.string(),
    distanceMeters: v.number(),
    reviewStatus: v.union(v.literal("Pending Review"), v.literal("Confirmed Duplicate"), v.literal("Dismissed")),
    createdAt: v.string(),
  }).index("by_reportId", ["reportId"]),
});
