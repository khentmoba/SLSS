import { z } from "zod";
import { SurveyType } from "@/generated/prisma/client";

export const surveyTypeEnum = z.nativeEnum(SurveyType);

export const createProjectSchema = z.object({
  // client or guest identity: either client phone will be derived from session
  guestName: z.string().min(2).optional(),
  guestPhone: z.string().regex(/^09\d{9}$/, "Enter 11-digit PH mobile (09xxxxxxxxx)").optional(),
  // property
  propertyId: z.string().optional(), // existing property
  propertyLabel: z.string().min(3).optional(),
  lotNo: z.string().optional(),
  titleNo: z.string().optional(),
  taxDecNo: z.string().optional(),
  barangay: z.string().optional(),
  municipality: z.string().min(2),
  province: z.string().min(2),
  areaSqm: z.coerce.number().positive().optional(),
  gpsLat: z.coerce.number().min(-90).max(90).optional(),
  gpsLng: z.coerce.number().min(-180).max(180).optional(),
  addressNotes: z.string().optional(),
  // request
  surveyType: surveyTypeEnum,
  purpose: z.string().min(5),
  preferredSchedule: z.string().optional(),
  surveyDate: z.string().optional(), // ISO date from staff input (e.g., 2026-08-02)
  statusMessage: z.string().max(500).optional(), // staff free-text status visible to client
});

export const otpSendSchema = z.object({ phone: z.string().regex(/^09\d{9}$/) });
export const otpVerifySchema = z.object({ phone: z.string().regex(/^09\d{9}$/), code: z.string().length(6) });

export const quotationSchema = z.object({
  surveyFee: z.coerce.number().min(0),
  otherFees: z.array(z.object({ label: z.string().min(1), amount: z.coerce.number().min(0) })).default([]),
  validDays: z.coerce.number().min(1).max(90).default(30),
  note: z.string().optional(),
});

export const appointmentSchema = z.object({
  date: z.string().min(1), // ISO date
  time: z.string().min(1),
  alternateDate: z.string().optional(),
  siteLocation: z.string().min(3),
  contactPerson: z.string().min(2),
  contactPhone: z.string().regex(/^09\d{9}$/).optional(),
});

export const publicTrackQuerySchema = z.object({
  q: z.string().min(1).max(100),
});

export const updateProjectMetaSchema = z.object({
  guestName: z.string().min(2).max(100).optional(),
  surveyDate: z.string().optional().nullable(),
  statusMessage: z.string().max(500).optional().nullable(),
  purpose: z.string().min(5).optional(),
});