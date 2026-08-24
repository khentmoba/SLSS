import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as any);
const MATRIX: Record<string, Array<{ t: any; req: "REQUIRED" | "OPTIONAL" }>> = {
  LAND_PROPERTY_SURVEY: [{ t: "TCT_OCT", req: "REQUIRED" },{ t: "TAX_DECLARATION", req: "REQUIRED" },{ t: "VALID_ID", req: "REQUIRED" },{ t: "LOT_PLAN", req: "OPTIONAL" }],
  RELOCATION_SURVEY: [{ t: "TCT_OCT", req: "REQUIRED" },{ t: "LOT_PLAN", req: "REQUIRED" },{ t: "VALID_ID", req: "REQUIRED" }],
  SUBDIVISION_SURVEY: [{ t: "TCT_OCT", req: "REQUIRED" },{ t: "LOT_PLAN", req: "REQUIRED" },{ t: "TAX_DECLARATION", req: "REQUIRED" },{ t: "VALID_ID", req: "REQUIRED" }],
  CONSOLIDATION_SURVEY: [{ t: "TCT_OCT", req: "REQUIRED" },{ t: "VALID_ID", req: "REQUIRED" },{ t: "DEED_OF_SALE", req: "OPTIONAL" }],
  TOPOGRAPHIC_SURVEY: [{ t: "LOT_PLAN", req: "OPTIONAL" },{ t: "VALID_ID", req: "REQUIRED" }],
  BOUNDARY_VERIFICATION: [{ t: "TAX_DECLARATION", req: "REQUIRED" },{ t: "VALID_ID", req: "REQUIRED" },{ t: "TCT_OCT", req: "OPTIONAL" }],
  OTHER: [{ t: "VALID_ID", req: "REQUIRED" },{ t: "TCT_OCT", req: "OPTIONAL" }],
};
async function main(){
  for(const [st, rows] of Object.entries(MATRIX)){
    for(const r of rows){
      await prisma.documentChecklistTemplate.upsert({
        where: { surveyType_docType: { surveyType: st as any, docType: r.t } },
        update: { requirement: r.req },
        create: { surveyType: st as any, docType: r.t, requirement: r.req },
      });
    }
  }
  console.log("checklist seeded");
}
main().finally(()=> prisma.$disconnect());
