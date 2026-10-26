// Read-only public-route regression check. No forms or admin authentication are used.
// Run from the repository root after building/serving the site:
// node scripts/verify-scroll-history.mjs https://your-preview.example
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {chromium} from "playwright";
const base=process.argv[2];
if(!base)throw new Error("Provide the base URL of a running preview or production site.");
const browser=await chromium.launch({headless:true,...(existsSync("/repl/tools/bin/chromium")?{executablePath:"/repl/tools/bin/chromium"}:{}),args:["--no-sandbox"]});
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:"no-preference"});
const settle=()=>page.waitForTimeout(1200);
const position=()=>page.evaluate(()=>({x:scrollX,y:scrollY}));
const near=async(expected,label)=>{const actual=await position();assert(Math.abs(actual.y-expected.y)<40&&Math.abs(actual.x-expected.x)<4,label);};
const wheel=async(amount)=>{await page.mouse.wheel(0,amount);await settle();return position();};
const link=async(href)=>{await page.locator(`header a[href="${href}"]`).first().click();await page.waitForURL(url=>url.pathname===href);await settle();};
try{
  await page.goto(new URL("/services/relocation",base).href,{waitUntil:"networkidle"});await settle();
  const first=await wheel(1600);
  await link("/services");assert((await position()).y<5,"New route starts at top");
  await wheel(2200);
  const relocationLink=page.locator('a[href="/services/relocation"]').first();await relocationLink.scrollIntoViewIfNeeded();await settle();
  await relocationLink.evaluate(element=>element.addEventListener("click",()=>sessionStorage.setItem("envod.qa.leaving",JSON.stringify({x:scrollX,y:scrollY})),{capture:true,once:true}));
  await relocationLink.click();await page.waitForURL("**/services/relocation");const middle=JSON.parse(await page.evaluate(()=>sessionStorage.getItem("envod.qa.leaving")));await settle();
  const second=await wheel(2700);
  await page.goBack({waitUntil:"networkidle"});await settle();await near(middle,"Back restores the directory position");
  await page.goBack({waitUntil:"networkidle"});await settle();await near(first,"The first visit retains its own position");
  await page.goForward({waitUntil:"networkidle"});await settle();
  await page.goForward({waitUntil:"networkidle"});await settle();await near(second,"The repeat visit has a distinct position");
  await page.reload({waitUntil:"networkidle"});await settle();await near(second,"Reload preserves the current entry");
  await page.goto(new URL("/gallery",base).href,{waitUntil:"networkidle"});await settle();
  const gallery=await wheel(2100);
  await link("/services");await page.goBack({waitUntil:"networkidle"});await settle();await near(gallery,"Gallery reading position survives Back");
  await page.goto(new URL("/ar/services/relocation",base).href,{waitUntil:"networkidle"});await settle();
  const arabic=await wheel(1600);
  await link("/ar/services");await page.goBack({waitUntil:"networkidle"});await settle();await near(arabic,"Arabic route restores without changing language");
  console.log("PASS: fresh navigation; Back/Forward; repeat URL entries; reload; Gallery; Arabic history.");
}finally{await browser.close();}
