import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCsv, csvCell } from "../src/lib/csv-export";

test("CSV cells quote values and neutralize spreadsheet formula prefixes", () => {
  for (const value of [
    "=1+1",
    "+SUM(1,1)",
    "-1+1",
    "@SUM(1,1)",
    " \t=HYPERLINK(\"https://example.invalid\")",
    "\u200b=1+1",
    "＝1+1",
    "＋SUM(1,1)",
    "－1+1",
    "＠SUM(1,1)",
  ]) {
    assert.ok(csvCell(value).startsWith("\"'"));
  }

  assert.equal(csvCell("ordinary text"), '"ordinary text"');
  assert.equal(csvCell('A "quoted" value'), '"A ""quoted"" value"');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell(-5), '"-5"');
});

test("CSV output escapes header cells and preserves quoted multiline fields", () => {
  assert.equal(
    buildCsv([
      ["=header", "note"],
      ["＝1+1", "line one\nline two"],
    ]),
    '\uFEFF"\'=header","note"\r\n"\'＝1+1","line one\nline two"',
  );
});
