import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {normalizeCountry,countryDisplay} from "../src/lib/search-countries";
import {classifyPage,performanceFilters,compareMetric,equalPeriods,isBrandQuery,publicEnglishPaths} from "../src/lib/search-operations";
import {buildCsv,csvCell} from "../src/lib/csv-export";
import {SERVICE_CATALOG,SERVICE_META,getServiceById,SLUG_TO_ID} from "../src/lib/service-data";
import {seoIntelligenceResearch as research} from "../src/data/seo-intelligence-research";
import {SERVICE_PREPARATION} from "../src/lib/service-preparation";
test("ISO alpha-3 country values and alpha-2 input aliases retain readable raw codes",()=>{
  for(const [alias,code]of [["SA","sau"],["IN","ind"],["AE","are"],["US","usa"],["GB","gbr"],["DE","deu"],["PK","pak"]]){
    assert.equal(normalizeCountry(alias),code);assert.equal(normalizeCountry(code),code);assert.ok(countryDisplay(code).includes(`(${code})`));
  }
  assert.equal(normalizeCountry("NOT_A_COUNTRY"),null);assert.equal(countryDisplay("unknown"),"unknown");
});
test("known English and Arabic public routes exclude unknown, admin and external paths",()=>{
  for(const path of publicEnglishPaths) {
    assert.equal(classifyPage("https://www.envodkingdom.net"+path),"en");
    assert.equal(classifyPage("https://envodkingdom.net/ar"+(path==="/"?"":path)),"ar");
  }
  for(const url of ["https://www.envodkingdom.net/en/services","https://www.envodkingdom.net/admin/search-console","https://www.envodkingdom.net/assets/a.webp","https://www.envodkingdom.net/unknown","https://other.example/ar/services/relocation"])assert.equal(classifyPage(url),null);
});
test("country, device, query and canonical-page filters use real Search Analytics dimensions",()=>{
  const filters=performanceFilters({country:"SA",device:"mobile",language:"ar",page:"/services/relocation",query:"نقل عفش بالرياض"});
  assert.deepEqual(filters.find(filter=>filter.dimension==="country"),{dimension:"country",operator:"equals",expression:"sau"});
  assert.equal(filters.find(filter=>filter.dimension==="device")?.expression,"MOBILE");
  assert.equal(filters.find(filter=>filter.dimension==="page")?.expression,"https://www.envodkingdom.net/ar/services/relocation");
  assert.equal(filters.find(filter=>filter.dimension==="query")?.operator,"contains");
  assert.throws(()=>performanceFilters({country:"xyz"}));assert.throws(()=>performanceFilters({language:"fr"}));assert.throws(()=>performanceFilters({page:"/admin"}));
});
test("language regex admits only verified route families and historical host variants",()=>{
  const expression=performanceFilters({language:"ar"}).find(filter=>filter.dimension==="page")!.expression;
  const regex=new RegExp(expression);
  for(const path of publicEnglishPaths)assert(regex.test("http://envodkingdom.net/ar"+(path==="/"?"":path)+"/"));
  assert(!regex.test("https://www.envodkingdom.net/admin"));assert(!regex.test("https://www.envodkingdom.net/services/relocation"));
  assert(!regex.test("https://www.envodkingdom.net/ar/unknown"));
});
test("comparison keeps signed change, zero baseline, missing values and lower-is-better distinct",()=>{
  assert.deepEqual(compareMetric(10,20,true),{absolute:-10,percent:-50,direction:"Improved"});
  assert.equal(compareMetric(10,0).percent,null);assert.equal(compareMetric(10,0).absolute,10);
  assert.equal(compareMetric(2,2).direction,"Unchanged");assert.equal(compareMetric(2,null).direction,"Comparison unavailable");
  assert.equal(compareMetric(NaN,2).direction,"Comparison unavailable");
  assert(equalPeriods("2026-09-25","2026-10-22","2026-08-28","2026-09-24"));
  assert(!equalPeriods("2026-09-25","2026-10-22","2026-08-28","2026-09-23"));
});
test("English and Arabic brand spellings are explicitly heuristic",()=>{
  for(const query of ["ENVOD KINGDOM","envodkingdom","إنفود كينغدوم","انفود","إينفود"])assert(isBrandQuery(query));
  assert(!isBrandQuery("نقل عفش بالرياض"));assert(!isBrandQuery("exhibition freight Saudi Arabia"));
});
test("all priorities, research counts, phrases, targets and evidence remain intact",()=>{
  assert.equal(research.services.length,25);assert.equal(research.keywordCandidateRows,566);assert.equal(research.sourceRecords,52);
  assert.deepEqual(research.services.map(service=>service.priority),Array.from({length:25},(_,index)=>`P${index+1}`));
  for(const service of research.services){
    assert(!service.queryEn.startsWith("/"));assert(publicEnglishPaths.has(service.targetUrlEn));
    assert.equal(service.targetUrlAr,"/ar"+service.targetUrlEn);
    for(const evidence of service.evidence){
      assert.equal(new URL(evidence.url).protocol,"https:");assert.ok(readFileSync(resolve("../..",evidence.evidencePath)).length);
    }
  }
  assert.equal(research.services.find(service=>service.priority==="P24")?.targetUrlEn,"/services/door-to-door");
});
test("original catalog identities stay intact and Door-to-Door is a separate detail identity",()=>{
  assert.equal(SERVICE_CATALOG.length,24);
  for(const service of SERVICE_CATALOG)assert.strictEqual(getServiceById(service.id),service);
  assert.equal(SLUG_TO_ID["door-to-door"],25);assert.equal(getServiceById(25)?.name,"Door-to-Door Logistics");
  assert.equal(SERVICE_META[25].slug,"door-to-door");
});
test("relocation retains current cards and the 14 historical bilingual options",()=>{
  assert.equal(SERVICE_META[9].subServices.length,18);assert.equal(SERVICE_META[9].industries.length,9);
  for(const item of SERVICE_META[9].subServices)assert(item.name&&item.nameAr&&item.desc&&item.descAr);
});
test("reviewed bilingual FAQs and official preparation references are additive",()=>{
  for(const id of [4,9,11])assert(SERVICE_META[id].faq.every(faq=>faq.q&&faq.a&&faq.qAr&&faq.aAr));
  assert(SERVICE_META[4].faq.some(faq=>faq.q.includes("advance filing")));
  assert(SERVICE_META[11].faq.some(faq=>faq.q.includes("booth construction")));
  assert.equal(SERVICE_PREPARATION["customs-clearance"].references?.length,4);
});
test("CSV guards formula injection including whitespace and Unicode prefixes",()=>{
  for(const text of ["=1+1","+SUM(A1)","-CMD","@SUM(A1)"," \t=HYPERLINK(\"bad\")","\u200b=1","\ufeff=1"])assert(csvCell(text).startsWith('"\''));
  assert.equal(csvCell(-3),'"-3"');assert.equal(csvCell('a,"b"\nc'),'"a,""b""\nc"');
  const csv=buildCsv([["country","query"],["sau","نقل عفش بالرياض"]]);assert(csv.startsWith("\ufeff"));assert(csv.includes("نقل عفش بالرياض"));
});
test("service Gallery CTA has one exact destination and contains no photo preview",()=>{
  const cta=readFileSync("src/components/ServiceGalleryCta.tsx","utf8");
  assert(cta.includes('href="https://www.envodkingdom.net/gallery"'));
  assert(!cta.includes("<img"));assert(!cta.includes("?category"));
  const detail=readFileSync("src/pages/service-detail.tsx","utf8");assert(detail.includes("<ServiceGalleryCta />"));
});
