// Generate the Word edition of the learning needs and outcomes from the
// generated readable model. Run after build_capability_model.mjs.
// Usage: node training-planner/scripts/build_learning_outcomes_docx.mjs [model.md] [out.docx]
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat,
  Header, Footer, PageNumber, TableOfContents, VerticalAlign, TableLayoutType,
} from "docx";

const repo = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const modelPath = process.argv[2] || repo("capability-framework/Agentic-Era_Workforce_Capability_Model.md");
const outPath = process.argv[3] || repo("capability-framework/Learning_Needs_and_Outcomes.docx");
const md = fs.readFileSync(modelPath, "utf8").split("\n");

// Rows of the first markdown table after a heading, excluding its header.
function mdTable(heading) {
  const i = md.findIndex((l) => l.startsWith(heading));
  if (i < 0) throw new Error(`Model heading not found: ${heading}`);
  const rows = [];
  for (let j = md.findIndex((l, k) => k > i && l.startsWith("|")) + 2; md[j]?.startsWith("|"); j++)
    rows.push(md[j].split("|").slice(1, -1).map((c) => c.trim()));
  if (!rows.length) throw new Error(`No table under: ${heading}`);
  return rows;
}
const levelRows = mdTable("### Agentic levels");
const roleRefs = Object.fromEntries(mdTable("### Role specialisms").map(([r, ref]) => [parseInt(r, 10), ref]));
const toolRows = mdTable("### Tool training");

// ---------- Parse ----------
const start = md.findIndex((l) => l.startsWith("## Detailed learning needs and outcomes"));
const end = md.findIndex((l) => l.startsWith("## Crosswalk and compatibility"));
if (start < 0 || end < 0) throw new Error("Model sections not found");
const versionLine = md.find((l) => l.startsWith("**Version")).replace(/\*/g, "");
const [, modelVer, modelRev] = versionLine.match(/^Version (\d+), revision (\d+)/);

const sections = []; // {name, intro:[], roles:[], needs:[]}
let sec = null, role = null, need = null;
const fixCase = (s) => s.replace(/\buses ai\b/g, "uses AI");
for (let i = start + 1; i < end; i++) {
  const line = md[i].trim();
  if (!line) continue;
  let m;
  if ((m = line.match(/^### (.+)$/))) {
    sec = { name: m[1], intro: [], roles: [], needs: [] }; sections.push(sec); role = null; need = null; continue;
  }
  if (!sec) continue;
  if ((m = line.match(/^#### Role (\d+): (.+)$/))) {
    role = { num: +m[1], name: m[2], intro: [], needs: [] }; sec.roles.push(role); need = null; continue;
  }
  if ((m = line.match(/^#### ([NR][\d.]+) — (.+)$/))) {
    need = { id: m[1], title: m[2], summary: "", category: "", categoryWhy: "", outcomes: [] };
    (role ? role.needs : sec.needs).push(need); continue;
  }
  if (line.startsWith("| Outcome ID") || line.startsWith("| ---")) continue;
  if (line.startsWith("|")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    const idm = cells[0].match(/^([NR][\d.]+)( · must-have)?$/);
    const om = cells[1].match(/^\*\*(.+?)\*\*\s*(.*)$/);
    const parts = cells[2].split(" · ");
    const essential = parts.filter((p) => p.startsWith("Essential:")).map((p) => fixCase(p.replace(/^Essential:\s*/, "")));
    const placement = parts.filter((p) => !p.startsWith("Essential:"));
    const packages = placement.filter((p) => !/^(Foundation|L[123] )/.test(p));
    need.outcomes.push({
      id: idm[1], mustHave: !!idm[2], title: om[1].replace(/\.$/, ""), text: om[2], placement, packages, essential,
    });
    continue;
  }
  if ((m = line.match(/^\*\*Content category: (.+?)\.\*\*\s*(.*)$/))) { need.category = m[1]; need.categoryWhy = m[2]; continue; }
  if (need && !need.summary) { need.summary = line; continue; }
  (role || sec).intro.push(line);
}

// Index every listing of an outcome so shared outcomes can be cross-referenced.
const listings = new Map(); // id -> [{where, outcome, need}]
const levelSecs = sections.filter((s) => !["Specialisms", "Tooling"].includes(s.name));
for (const s of levelSecs) for (const n of s.needs) for (const o of n.outcomes)
  (listings.get(o.id) || listings.set(o.id, []).get(o.id)).push({ where: s.name, o, n });
const specialisms = sections.find((s) => s.name === "Specialisms");
for (const r of specialisms.roles) for (const n of r.needs) for (const o of n.outcomes)
  (listings.get(o.id) || listings.set(o.id, []).get(o.id)).push({ where: `Role ${r.num}: ${r.name}`, o, n });
if (listings.size !== 140) throw new Error(`Expected 140 outcomes, found ${listings.size}`);

// Need-level summary (unique outcomes per need ID).
const needSummary = new Map();
for (const [id, ls] of listings) {
  const { n, o } = ls[0];
  const ns = needSummary.get(n.id) || { id: n.id, title: n.title, category: n.category, outcomes: new Set(), must: new Set(), where: new Set() };
  ns.outcomes.add(id); if (o.mustHave) ns.must.add(id);
  ls.forEach((l) => ns.where.add(l.where.replace(/^(L\d) .*/, "$1").replace(/^Role (\d+):.*/, "Role $1")));
  needSummary.set(n.id, ns);
}
const needOrder = (a, b) => {
  const k = (id) => [id[0] === "N" ? 0 : 1, ...id.slice(1).split(".").map(Number)];
  const ka = k(a), kb = k(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) if ((ka[i] ?? -1) !== (kb[i] ?? -1)) return (ka[i] ?? -1) - (kb[i] ?? -1);
  return 0;
};
if (needSummary.size !== 23) throw new Error(`Expected 23 needs, found ${needSummary.size}`);

// ---------- Styling helpers ----------
const FONT = "Calibri";
const NAVY = "1F3A5F", TEAL = "0F766E", GREY = "5B6470", LINE = "C9D1DB", HEAD_FILL = "E8EEF5", MUST_FILL = "E6F4F1";
const PAGE_W = 11906, MARGIN = 1134, CONTENT_W = PAGE_W - 2 * MARGIN; // A4, 2 cm margins
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 70, bottom: 70, left: 110, right: 110 };

const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const para = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [run(children)], spacing: { after: 120 }, ...o });
const h = (text, level, pb = false) => new Paragraph({ heading: level, pageBreakBefore: pb, children: [run(text)] });
const bullet = (children) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: Array.isArray(children) ? children : [run(children)] });

function cell(children, width, o = {}) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins, verticalAlign: VerticalAlign.TOP,
    children, ...(o.fill ? { shading: { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } } : {}),
    ...(o.columnSpan ? { columnSpan: o.columnSpan } : {}),
  });
}
function table(widths, header, rows) {
  const headRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: header.map((t, i) => cell([new Paragraph({ children: [run(t, { bold: true, color: NAVY, size: 19 })] })], widths[i], { fill: HEAD_FILL })),
  });
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: [headRow, ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => (c instanceof TableCell ? c : cell(c, widths[i]))) }))],
  });
}
const small = (t, o = {}) => run(t, { size: 18, ...o });
const cellPara = (children, o = {}) => new Paragraph({ children, spacing: { after: 40 }, ...o });
const spacer = () => new Paragraph({ children: [], spacing: { after: 60 } });

// ---------- Outcome table ----------
const OUT_W = [1450, CONTENT_W - 1450];
function outcomeTable(n, ctx) {
  const rows = n.outcomes.map((o) => {
    const idCell = [cellPara([run(o.id, { bold: true, color: NAVY, size: 20 })])];
    if (o.mustHave) idCell.push(cellPara([small("MUST-HAVE", { bold: true, color: TEAL, size: 15 })]));
    const body = [cellPara([run(o.title + ". ", { bold: true, size: 20 }), run(o.text, { size: 20 })])];
    const notes = [];
    if (ctx.kind === "role") notes.push(["Learning package", o.packages.join(" · ")]);
    else if (o.placement.length > 1) notes.push(["Also part of", o.placement.slice(1).join(" · ")]);
    if (o.essential.length) notes.push(["Must-have", o.essential.join("; ")]);
    const others = listings.get(o.id).map((l) => l.where).filter((w) => w !== ctx.where);
    if (others.length) notes.push(["Also listed under", [...new Set(others)].join("; ")]);
    for (const [k, v] of notes) body.push(cellPara([small(`${k}: `, { bold: true, color: GREY }), small(v, { color: GREY, italics: true })]));
    return [cell(idCell, OUT_W[0], { fill: o.mustHave ? MUST_FILL : undefined }), cell(body, OUT_W[1])];
  });
  return table(OUT_W, ["Outcome ID", "Learning outcome"], rows);
}
function needBlock(n, level, ctx) {
  const out = [h(`${n.id} — ${n.title}`, level)];
  out.push(para([run(n.summary, { italics: true })]));
  out.push(para([run("Content category: ", { bold: true, color: GREY, size: 20 }), run(n.category + ". ", { bold: true, color: n.category === "Generic" ? NAVY : TEAL, size: 20 }), run(n.categoryWhy, { color: GREY, size: 20 })]));
  out.push(outcomeTable(n, ctx));
  return out;
}

// ---------- Content ----------
const children = [];
// Title page
children.push(
  new Paragraph({ spacing: { before: 2400, after: 200 }, children: [run("AI-Era Cyber Workforce", { size: 28, color: TEAL, bold: true })] }),
  new Paragraph({ heading: HeadingLevel.TITLE, children: [run("Learning Needs and Outcomes")] }),
  para([run("Agentic-Era Workforce Capability Model — all learning needs and outcomes, organised by Foundation, agentic level, role specialism and tool training", { size: 24, color: GREY })], { spacing: { after: 600 } }),
  para([run("Source: ", { bold: true }), run(`Agentic-Era Workforce Capability Model, ${versionLine.replace(/^Version/, "version")}`)]),
  para([run("Scope: ", { bold: true }), run(`${needSummary.size} learning needs and ${listings.size} active learning outcomes`)]),
  para([run("Generated: ", { bold: true }), run(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))]),
  para([run("This document extracts the learning needs and outcomes only. The capability model remains the authoritative description of the framework; course coverage, scoring and planning rules are out of scope here.", { italics: true, color: GREY, size: 20 })], { spacing: { before: 600 } }),
  h("Contents", HeadingLevel.HEADING_1, true),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }),
);

// 1. How to read
children.push(
  h("1. How the learning needs are organised", HeadingLevel.HEADING_1, true),
  para([run("Each person's target capability profile is ", {}), run("Foundation + agentic level + relevant role specialisms + tool training", { bold: true }), run(". The profile is translated into learning needs (topics such as supervising agents or assessing AI risk); each need contains learning outcomes — specific statements of what someone must know or do.")]),
  h("1.1 Components of the profile", HeadingLevel.HEADING_2),
  table([2300, CONTENT_W - 2300], ["Component", "What it covers"], [
    [[cellPara([run("Foundation", { bold: true })])], [cellPara([run("Shared by everyone: common knowledge of AI, agents, limitations, risks, threats and responsible use. Foundation is not a fourth level.")])]],
    ...levelRows.map(([name, target]) => {
      const [lvl, desc] = name.split(" — ");
      return [[cellPara([run(lvl, { bold: true })]), cellPara([small(desc || "", { color: GREY })])], [cellPara([run(target)])]];
    }),
    [[cellPara([run("Role specialisms", { bold: true })])], [cellPara([run("Additional capabilities for the responsibilities of the nine defined roles. They can apply at any agentic level; select the outcomes for the actual responsibilities.")])]],
    [[cellPara([run("Tool training", { bold: true })])], [cellPara([run("How to use a specific approved product, platform or in-house tool, assigned according to access and intended work.")])]],
  ]),
  spacer(),
  para([run("Levels describe target agentic capability, not seniority, professional expertise or operational authorisation. Higher levels build on the lower shared capabilities, but demonstrated capabilities need not be retaught. ", {}), run("The L2/L3 boundary: ", { bold: true }), run("L2 operates and adapts an existing agent workflow and runs task checks; L3 designs the agent's behaviour and its evaluation approach.")]),
  h("1.2 Reading the outcome tables", HeadingLevel.HEADING_2),
  bullet([run("Outcome ID ", { bold: true }), run("— stable identifier (for example N7.3 or R9.1.1). Need IDs (N7, R9.1) identify topics; outcome IDs identify the detailed requirements beneath them.")]),
  bullet([run("Must-have ", { bold: true }), run("— essential to achieving the learning objective safely and effectively at the depth appropriate to the person's work. Some must-haves apply only in a stated situation (for example, when automated judges are used).")]),
  bullet([run("Content category ", { bold: true }), run("— Generic (transfers across functions) or Cyber-specific (the learning objective concerns cybersecurity work, threats, controls or specialist practice). The model has 11 generic and 12 cyber-specific needs.")]),
  bullet([run("Learning package ", { bold: true }), run("— for role specialisms, the responsibility-based package the outcome belongs to. Packages are editable starting points, not mandatory assignments for everyone in a function.")]),
  bullet([run("Shared outcomes ", { bold: true }), run("— an outcome may appear under its level and under a role specialism. It is the same outcome and is learned once.")]),
  h("1.3 Depth of learning", HeadingLevel.HEADING_2),
  bullet("Foundation learners recognise risks, explain examples and know the precaution or escalation route."),
  bullet("L2 Practitioners apply precautions, check results and intervene."),
  bullet("Builders (L3) and relevant specialists design, test and improve controls."),
  para([run("The existing cyber curriculum (N0, core craft) remains a prerequisite outside these 23 needs. This model describes the additional capabilities for the agentic era.", { color: GREY, size: 20 })]),
);

// 2. Summary of needs
const sumW = [800, 3600, 1500, 1100, 1000, CONTENT_W - 8000];
children.push(
  h("2. Summary of learning needs", HeadingLevel.HEADING_1, true),
  para(`All ${needSummary.size} learning needs, with the number of active outcomes and must-have outcomes in each, and where they are applied.`),
  table(sumW, ["Need", "Title", "Category", "Outcomes", "Must-have", "Applied in"],
    [...needSummary.values()].sort((a, b) => needOrder(a.id, b.id)).map((s) => [
      [cellPara([run(s.id, { bold: true, color: NAVY, size: 19 })])],
      [cellPara([run(s.title, { size: 19 })])],
      [cellPara([run(s.category, { size: 19, color: s.category === "Generic" ? NAVY : TEAL })])],
      [cellPara([run(String(s.outcomes.size), { size: 19 })], { alignment: AlignmentType.CENTER })],
      [cellPara([run(String(s.must.size), { size: 19 })], { alignment: AlignmentType.CENTER })],
      [cellPara([run([...s.where].join(", "), { size: 17, color: GREY })])],
    ])),
  spacer(),
  para([run(`Total: ${listings.size} active outcomes, of which ${[...listings.values()].filter((l) => l[0].o.mustHave).length} are must-have (including situational must-haves). Retired outcome N5.2 (Deepfakes) is merged into N5.1.`, { color: GREY, size: 20 })]),
);

// 3–6. Levels
const levelMeta = {
  "Foundation": ["3. Foundation — common knowledge for everyone", "Everyone shares the Foundation, whatever their level, role or tools. It covers needs N1–N5, except N4.7 (L2) and N5.7 (Threat intelligence & detection)."],
  "L1 Entry": ["4. L1 Entry — Work with AI assistance", "Perform work primarily yourself, use AI where useful, provide context, check outputs and own the result. Covers need N6."],
  "L2 Practitioner": ["5. L2 Practitioner — Supervise agents", "Delegate, monitor, verify, intervene and remain accountable; adapt task instructions and run checks within approved workflows. Covers N7–N9 and N4.7 (third-party vetting). Writing a reusable task instruction within an approved workflow does not by itself make someone L3."],
  "L3 Expert": ["6. L3 Expert — Build and evaluate agents", "Design agent behaviour and workflows, configure or code agents, design evaluations and improve reliability, including no-code/low-code builders. Covers N10 and N11, except N10.3, N10.6 and N10.7, which belong to agent infrastructure within Security architecture & engineering. Safe deployment (N10.8) is common L3 learning; detailed security design belongs to the relevant specialism."],
};
for (const s of levelSecs) {
  const [title, intro] = levelMeta[s.name];
  children.push(h(title, HeadingLevel.HEADING_1, true), para(intro));
  if (s.name === "Foundation") children.push(para([run("Foundation depth: ", { bold: true }), run("recognise, explain and know the precaution or escalation. N2 agent anatomy and safety components are conceptual at this level. For N5.1, a short awareness segment on recognising social engineering, independent verification and escalation is sufficient; deepfakes are a brief impersonation example. For N5.8, the learner outcome is recognition and an appropriate response, informed by the OWASP LLM and agentic risk lists, not memorisation of them.")]));
  for (const n of s.needs) children.push(...needBlock(n, HeadingLevel.HEADING_2, { kind: "level", where: s.name }));
}

// 7. Role specialisms
const packagesTable = []; // from placement data
const pkgMap = new Map();
for (const r of specialisms.roles) for (const n of r.needs) for (const o of n.outcomes) for (const p of o.packages) {
  const key = `${r.num}|${p}`;
  const e = pkgMap.get(key) || { role: r, pkg: p, ids: [] };
  if (!e.ids.includes(o.id)) e.ids.push(o.id);
  pkgMap.set(key, e);
}
children.push(
  h("7. Role specialisms", HeadingLevel.HEADING_1, true),
  para("Role specialisms add capabilities for the responsibilities of the nine roles defined in the model (grouped from ENISA's European Cybersecurity Skills Framework profiles). Select the outcomes for a person's actual responsibilities: a person can work across roles and need several specialisms at any agentic level, and specialist depth follows the responsibility. A specialist outcome can apply at L1."),
  para("Role 8 is Identity & access management; its assessment identifiers remain R9.1 and R9.1.1–R9.1.10 for traceability. Role 9 is Leadership."),
);
for (const r of specialisms.roles) {
  children.push(h(`7.${r.num} Role ${r.num} — ${r.name}`, HeadingLevel.HEADING_2));
  if (!roleRefs[r.num]) throw new Error(`No ECSF reference for role ${r.num}`);
  children.push(para([run("ECSF reference: ", { bold: true, color: GREY, size: 20 }), run(roleRefs[r.num], { color: GREY, size: 20 })]));
  r.intro.forEach((t) => children.push(para(t)));
  const pk = [...pkgMap.values()].filter((e) => e.role === r);
  if (pk.length) {
    children.push(para([run("Learning packages for this role", { bold: true })], { spacing: { after: 60 } }));
    pk.forEach((e) => children.push(bullet([run(e.pkg + ": ", { bold: true }), run(e.ids.join(", "))])));
    children.push(spacer());
  }
  for (const n of r.needs) children.push(...needBlock(n, HeadingLevel.HEADING_3, { kind: "role", where: `Role ${r.num}: ${r.name}` }));
}

// 8. Tool training
const toolW = [3400, CONTENT_W - 3400];
children.push(
  h("8. Tool training", HeadingLevel.HEADING_1, true),
  para("Tool training teaches someone how to use a specific product, platform or in-house tool. Its audience follows tool distribution and intended work — use, supervise, build or administer — and may be everyone, users across several functions, or a specialist group. It has no separate assessed outcomes: it is product-specific practice linked to the relevant shared or specialist outcomes above."),
  table(toolW, ["Who needs the tool training", "What the training teaches"], toolRows.map(([a, b]) => [[cellPara([run(a, { bold: true, size: 20 })])], [cellPara([run(b, { size: 20 })])]])),
  spacer(),
  para([run("The named products illustrate training needs where the products are approved and access is provided; they do not imply the tools are already deployed. The same product can require different training for users, supervisors and builders. Familiarity with a product alone does not demonstrate the shared or specialist capabilities, or grant operational permission.", { color: GREY, size: 20 })]),
);

// Appendix A: packages
children.push(
  h("Appendix A. Role learning packages", HeadingLevel.HEADING_1, true),
  para("Responsibility-based packages of outcomes within the role specialisms. An outcome can support more than one package; reused outcomes are learned once."),
  table([2600, 3000, CONTENT_W - 5600], ["Role", "Learning package", "Learning outcomes"],
    [...pkgMap.values()].map((e) => [
      [cellPara([run(`Role ${e.role.num} — ${e.role.name}`, { size: 19 })])],
      [cellPara([run(e.pkg, { bold: true, size: 19 })])],
      [cellPara([run(e.ids.join(", "), { size: 19 })])],
    ])),
);

// Appendix B: index of all outcomes
const idxW = [1100, 3250, 1200, CONTENT_W - 5550];
children.push(
  h("Appendix B. Index of all learning outcomes", HeadingLevel.HEADING_1, true),
  para(`All ${listings.size} active outcomes in ID order, with where each one is applied.`),
  table(idxW, ["Outcome", "Title", "Must-have", "Applied in"],
    [...listings.entries()].sort((a, b) => needOrder(a[0], b[0])).map(([id, ls]) => {
      const o = ls[0].o;
      return [
        [cellPara([run(id, { bold: true, color: NAVY, size: 18 })])],
        [cellPara([run(o.title, { size: 18 })])],
        [cellPara([run(o.mustHave ? (o.essential.length ? "Situational" : "Yes") : "", { size: 18, color: TEAL, bold: true })], { alignment: AlignmentType.CENTER })],
        [cellPara([run([...new Set(ls.map((l) => l.where))].join("; "), { size: 17, color: GREY })])],
      ];
    })),
);

// ---------- Document ----------
const hstyle = (size, color, before, after) => ({ run: { font: FONT, size, bold: true, color }, paragraph: { spacing: { before, after }, keepNext: true, keepLines: true } });
const doc = new Document({
  creator: "AI era training", title: "Learning Needs and Outcomes",
  description: "Agentic-Era Workforce Capability Model learning needs and outcomes",
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: FONT, size: 21 } },
      title: { run: { font: FONT, size: 56, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 200 }, keepNext: true } },
      heading1: hstyle(34, NAVY, 240, 160),
      heading2: hstyle(27, NAVY, 300, 120),
      heading3: hstyle(24, TEAL, 240, 100),
    },
  },
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 1134, bottom: 1134, left: MARGIN, right: MARGIN } }, titlePage: true },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [small(`Learning Needs and Outcomes · Capability Model v${modelVer} rev ${modelRev}`, { color: GREY })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [small("Page ", { color: GREY }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GREY })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath}: ${needSummary.size} needs, ${listings.size} outcomes, ${[...listings.values()].reduce((a, l) => a + l.length, 0)} listings`);
});
