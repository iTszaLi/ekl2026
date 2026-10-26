// ISO 3166 alpha-3 to alpha-2 facts; labels come from the browser's Intl data.
// Source: lukes/ISO-3166-Countries-with-Regional-Codes/all/all.json, checked 26 October 2026.
const pairs = "afg:AF ala:AX alb:AL dza:DZ asm:AS and:AD ago:AO aia:AI ata:AQ atg:AG arg:AR arm:AM abw:AW aus:AU aut:AT aze:AZ bhs:BS bhr:BH bgd:BD brb:BB blr:BY bel:BE blz:BZ ben:BJ bmu:BM btn:BT bol:BO bes:BQ bih:BA bwa:BW bvt:BV bra:BR iot:IO brn:BN bgr:BG bfa:BF bdi:BI cpv:CV khm:KH cmr:CM can:CA cym:KY caf:CF tcd:TD chl:CL chn:CN cxr:CX cck:CC col:CO com:KM cog:CG cod:CD cok:CK cri:CR civ:CI hrv:HR cub:CU cuw:CW cyp:CY cze:CZ dnk:DK dji:DJ dma:DM dom:DO ecu:EC egy:EG slv:SV gnq:GQ eri:ER est:EE swz:SZ eth:ET flk:FK fro:FO fji:FJ fin:FI fra:FR guf:GF pyf:PF atf:TF gab:GA gmb:GM geo:GE deu:DE gha:GH gib:GI grc:GR grl:GL grd:GD glp:GP gum:GU gtm:GT ggy:GG gin:GN gnb:GW guy:GY hti:HT hmd:HM vat:VA hnd:HN hkg:HK hun:HU isl:IS ind:IN idn:ID irn:IR irq:IQ irl:IE imn:IM isr:IL ita:IT jam:JM jpn:JP jey:JE jor:JO kaz:KZ ken:KE kir:KI prk:KP kor:KR kwt:KW kgz:KG lao:LA lva:LV lbn:LB lso:LS lbr:LR lby:LY lie:LI ltu:LT lux:LU mac:MO mdg:MG mwi:MW mys:MY mdv:MV mli:ML mlt:MT mhl:MH mtq:MQ mrt:MR mus:MU myt:YT mex:MX fsm:FM mda:MD mco:MC mng:MN mne:ME msr:MS mar:MA moz:MZ mmr:MM nam:NA nru:NR npl:NP nld:NL ncl:NC nzl:NZ nic:NI ner:NE nga:NG niu:NU nfk:NF mkd:MK mnp:MP nor:NO omn:OM pak:PK plw:PW pse:PS pan:PA png:PG pry:PY per:PE phl:PH pcn:PN pol:PL prt:PT pri:PR qat:QA reu:RE rou:RO rus:RU rwa:RW blm:BL shn:SH kna:KN lca:LC maf:MF spm:PM vct:VC wsm:WS smr:SM stp:ST sau:SA sen:SN srb:RS syc:SC sle:SL sgp:SG sxm:SX svk:SK svn:SI slb:SB som:SO zaf:ZA sgs:GS ssd:SS esp:ES lka:LK sdn:SD sur:SR sjm:SJ swe:SE che:CH syr:SY twn:TW tjk:TJ tza:TZ tha:TH tls:TL tgo:TG tkl:TK ton:TO tto:TT tun:TN tur:TR tkm:TM tca:TC tuv:TV uga:UG ukr:UA are:AE gbr:GB usa:US umi:UM ury:UY uzb:UZ vut:VU ven:VE vnm:VN vgb:VG vir:VI wlf:WF esh:EH yem:YE zmb:ZM zwe:ZW";
const codes = Object.fromEntries(pairs.split(" ").map(pair => pair.split(":")));
const names = new Intl.DisplayNames(["en"], {type:"region"});
export function normalizeCountry(raw: string): string | null {
  const code = raw.trim();
  return codes[code.toLowerCase()] ? code.toLowerCase() : Object.keys(codes).find(key => codes[key] === code.toUpperCase()) ?? null;
}
export function countryLabel(raw: string): string {
  const normalized = normalizeCountry(raw);
  return normalized ? names.of(codes[normalized]) ?? raw : raw;
}
export function countryDisplay(raw: string): string {
  const label = countryLabel(raw);
  return label === raw ? raw : `${label} (${raw})`;
}
