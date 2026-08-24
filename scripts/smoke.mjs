import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
async function main(){
  console.log('clients', await prisma.client.count());
  console.log('properties', await prisma.property.count());
  console.log('projects', await prisma.project.count());
  console.log('templates', await prisma.documentChecklistTemplate.count());
  const phone='09171234567';
  let client = await prisma.client.findUnique({where:{phone}});
  if(!client) client = await prisma.client.create({data:{phone, name:'Test Client', verifiedAt:new Date()}});
  console.log('client', client.id);
  const prop = await prisma.property.create({data:{ label:'Lot 9999 - Cabadbaran', lotNo:'9999', titleNo:'TCT-TEST-'+Date.now(), municipality:'Cabadbaran', province:'Agusan del Norte', barangay:'Test', clientId: client.id }});
  console.log('property', prop.id);
  const proj = await prisma.project.create({data:{ propertyId: prop.id, surveyType:'RELOCATION_SURVEY', purpose:'Test purpose for smoke', status:'CLIENT_REQUEST', createdBy:'CLIENT', clientId: client.id }});
  console.log('project CLIENT_REQUEST', proj.id, proj.status);
  for(const t of ['TCT_OCT','TAX_DECLARATION','VALID_ID']){
    await prisma.document.create({data:{ projectId: proj.id, propertyId: prop.id, type: t, requirement:'REQUIRED', state:'MISSING' }});
  }
  await prisma.project.update({where:{id: proj.id}, data:{status:'DOCUMENT_CHECK'}});
  console.log('moved to DOCUMENT_CHECK');
  await prisma.document.updateMany({where:{projectId: proj.id}, data:{state:'VERIFIED'}});
  await prisma.project.update({where:{id: proj.id}, data:{status:'QUOTATION'}});
  console.log('moved to QUOTATION');
  const q = await prisma.quotation.create({data:{ projectId: proj.id, version:1, surveyFee:25000, otherFees:[{label:'Travel', amount:2000}], total:27000, validUntil:new Date(Date.now()+30*864e5)}});
  console.log('quotation', q.id, q.total);
  await prisma.payment.create({data:{ projectId: proj.id, quotationId: q.id, amount: q.total, method:'MANUAL', status:'CONFIRMED', confirmedAt:new Date()}});
  await prisma.project.update({where:{id: proj.id}, data:{status:'PAYMENT_CONFIRMATION'}});
  console.log('payment confirmed');
  await prisma.project.update({where:{id: proj.id}, data:{status:'SITE_SURVEY'}});
  console.log('site survey');
  console.log('smoke success');
}
main().catch(e=>{console.error(e); process.exit(1);}).finally(()=> prisma.$disconnect());
