import {SERVICE_META} from "./service-data";
import {INDUSTRY_META} from "./industry-data";
import {normalizeCountry} from "./search-countries";
export const PRODUCTION_ORIGIN = "https://www.envodkingdom.net";
export const publicEnglishPaths = new Set(["/","/services","/about","/gallery","/contact","/privacy-policy","/terms-and-conditions","/cookie-notice","/industries","/vision-2030","/track",...Object.values(SERVICE_META).map(meta=>`/services/${meta.slug}`),...INDUSTRY_META.map(meta=>`/industries/${meta.slug}`)]);
export function classifyPage(value: string): "en"|"ar"|null {
  try {
    const url=new URL(value);
    if(!/^https?:$/.test(url.protocol)||!["envodkingdom.net","www.envodkingdom.net"].includes(url.hostname)||url.username||url.password||url.port)return null;
    const path=url.pathname.replace(/\/+$/,"")||"/";
    const ar=path==="/ar"||path.startsWith("/ar/");
    return publicEnglishPaths.has(ar?(path.slice(3)||"/"):path)?ar?"ar":"en":null;
  } catch {return null;}
}
export const isBrandQuery=(value:string)=>/envod|إنفود|انفود|إينفود|اينفود|إنڤود|انڤود/i.test(value);
export interface PerformanceFilters {language?:string;page?:string;country?:string;device?:string;query?:string}
export function performanceFilters(input: PerformanceFilters) {
  const filters:Array<{dimension:string;operator:string;expression:string}>=[];
  if(input.country) {
    const country=normalizeCountry(input.country);
    if(!country)throw new Error("Use a valid ISO country code, for example sau.");
    filters.push({dimension:"country",operator:"equals",expression:country});
  }
  if(input.device) {
    const device=input.device.toUpperCase();
    if(!["MOBILE","DESKTOP","TABLET"].includes(device))throw new Error("Invalid device");
    filters.push({dimension:"device",operator:"equals",expression:device});
  }
  if(input.language&&!["en","ar"].includes(input.language))throw new Error("Invalid language");
  if(input.page&&!publicEnglishPaths.has(input.page))throw new Error("Choose a verified public route");
  if(input.page&&input.language) filters.push({dimension:"page",operator:"equals",expression:PRODUCTION_ORIGIN+(input.language==="ar"?"/ar":"")+(input.page==="/"&&input.language==="ar"?"":input.page)});
  else if(input.language||input.page) {
    const escaped=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const paths=input.page?[input.page]:[...publicEnglishPaths];
    const alternatives=paths.flatMap(path=>(input.language?[input.language]:["en","ar"]).map(lang=>(lang==="ar"?"/ar":"")+(path==="/"?"":path)));
    filters.push({dimension:"page",operator:"includingRegex",expression:`^https?://(www\\.)?envodkingdom\\.net(${alternatives.map(escaped).join("|")})/?(\\?.*)?$`});
  }
  if(input.query?.trim())filters.push({dimension:"query",operator:"contains",expression:input.query.trim().slice(0,300)});
  return filters;
}
export function compareMetric(current:number,previous:number|null,lowerIsBetter=false) {
  if(previous===null||!Number.isFinite(current)||!Number.isFinite(previous))return {absolute:null,percent:null,direction:"Comparison unavailable"};
  const absolute=current-previous;
  return {absolute,percent:previous===0?null:absolute/Math.abs(previous)*100,direction:absolute===0?"Unchanged":(lowerIsBetter?absolute<0:absolute>0)?"Improved":"Worsened"};
}
export function equalPeriods(start:string,end:string,previousStart:string,previousEnd:string) {
  const days=(a:string,b:string)=>(Date.parse(b)-Date.parse(a))/86400000+1;
  const current=days(start,end);
  return Number.isInteger(current)&&current>0&&current===days(previousStart,previousEnd);
}
