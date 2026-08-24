import { prisma } from "./prisma";
import { SurveyType, DocumentType } from "@/generated/prisma/client";

// Seed per-Survey-Type required docs (staff-configurable via this template)
const MATRIX: Record<SurveyType, Array<{ t: DocumentType; req: "REQUIRED" | "OPTIONAL" }>> = {
  LAND_PROPERTY_SURVEY: [
    { t: "TCT_OCT", req: "REQUIRED" },
    { t: "TAX_DECLARATION", req: "REQUIRED" },
    { t: "VALID_ID", req: "REQUIRED" },
    { t: "LOT_PLAN", req: "OPTIONAL" },
  ],
  RELOCATION_SURVEY: [
    { t: "TCT_OCT", req: "REQUIRED" },
    { t: "LOT_PLAN", req: "REQUIRED" },
    { t: "VALID_ID", req: "REQUIRED" },
  ],
  SUBDIVISION_SURVEY: [
    { t: "TCT_OCT", req: "REQUIRED" },
    { t: "LOT_PLAN", req: "REQUIRED" },
    { t: "TAX_DECLARATION", req: "REQUIRED" },
    { t: "VALID_ID", req: "REQUIRED" },
  ],
  CONSOLIDATION_SURVEY: [
    { t: "TCT_OCT", req: "REQUIRED" },
    { t: "VALID_ID", req: "REQUIRED" },
    { t: "DEED_OF_SALE", req: "OPTIONAL" },
  ],
  TOPOGRAPHIC_SURVEY: [
    { t: "LOT_PLAN", req: "OPTIONAL" },
    { t: "VALID_ID", req: "REQUIRED" },
  ],
  BOUNDARY_VERIFICATION: [
    { t: "TAX_DECLARATION", req: "REQUIRED" },
    { t: "VALID_ID", req: "REQUIRED" },
    { t: "TCT_OCT", req: "OPTIONAL" },
  ],
  OTHER: [
    { t: "VALID_ID", req: "REQUIRED" },
    { t: "TCT_OCT", req: "OPTIONAL" },
  ],
};

export async function seedChecklist() {
  for (const [st, rows] of Object.entries(MATRIX) as Array<[SurveyType, typeof MATRIX[SurveyType]]>) {
    for (const r of rows) {
      await prisma.documentChecklistTemplate.upsert({
        where: { surveyType_docType: { surveyType: st, docType: r.t } },
        update: { requirement: r.req },
        create: { surveyType: st, docType: r.t, requirement: r.req },
      });
    }
  }
}

