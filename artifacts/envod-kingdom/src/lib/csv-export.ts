export function csvCell(value: unknown): string {
  let text=value==null?"":String(value);
  if(typeof value==="string"&&/^[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]*[=+\-@]/.test(text))text="'"+text;
  return `"${text.replace(/"/g,'""')}"`;
}
export function buildCsv(rows:unknown[][]): string {
  return "\ufeff"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n");
}
export function downloadCsv(filename:string,rows:unknown[][]|Array<Record<string,unknown>>) {
  if(!rows.length)return;
  const headers=Array.isArray(rows[0])?[]:Object.keys(rows[0]);
  const data=Array.isArray(rows[0])?rows as unknown[][]:[headers,...(rows as Array<Record<string,unknown>>).map(row=>headers.map(key=>row[key]))];
  const url=URL.createObjectURL(new Blob([buildCsv(data)],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
