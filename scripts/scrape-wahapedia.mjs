/**
 * Wahapedia Scraper
 * Downloads all CSV data from wahapedia.ru and generates per-faction JSON files
 * into public/wahapedia/ for use by the Next.js app.
 *
 * Usage:
 *   npm run scrape              (uses cached CSVs if available)
 *   npm run scrape -- --force   (re-downloads all CSVs)
 */

import { parse } from 'node-html-parser';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const CACHE_DIR = join(ROOT, 'wahapedia-cache');
const OUT_DIR   = join(ROOT, 'public', 'wahapedia');

const BASE_URL = 'http://wahapedia.ru/wh40k10ed/';

const CSV_FILES = [
  'Factions.csv',
  'Source.csv',
  'Datasheets.csv',
  'Datasheets_abilities.csv',
  'Datasheets_keywords.csv',
  'Datasheets_models.csv',
  'Datasheets_wargear.csv',
  'Datasheets_unit_composition.csv',
  'Datasheets_models_cost.csv',
  'Datasheets_leader.csv',
  'Datasheets_stratagems.csv',
  'Datasheets_enhancements.csv',
  'Datasheets_detachment_abilities.csv',
  'Abilities.csv',
  'Stratagems.csv',
  'Enhancements.csv',
  'Detachment_abilities.csv',
  'Last_update.csv',
];

// ─── CSV parsing ──────────────────────────────────────────────────────────────

const toCamelCase = (s) =>
  s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());

const stripHtml = (input) => {
  if (!input || !input.includes('<')) return input.trim();
  try {
    const root = parse(`<body>${input}</body>`);
    return root.querySelector('body').text
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return input.trim();
  }
};

const parseCSV = (text) => {
  const lines = text.replace(/^\uFEFF/, '').split('\r\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('|').map(toCamelCase);
  const result = [];
  for (let i = 1; i < lines.length - 1; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split('|');
    const obj = {};
    for (let c = 0; c < cols.length - 1; c++) {
      obj[headers[c]] = stripHtml(cols[c] ?? '');
    }
    result.push(obj);
  }
  return result;
};

// ─── Download + cache ─────────────────────────────────────────────────────────

const localName = (f) => f.toLowerCase().replace(/_/g, '-');

const loadCSV = async (file, force) => {
  const cachePath = join(CACHE_DIR, localName(file));
  if (!force && existsSync(cachePath)) {
    process.stdout.write(`  cache  ${file}\n`);
    return readFileSync(cachePath, 'utf-8');
  }
  process.stdout.write(`  fetch  ${file} ... `);
  const text = await fetch(`${BASE_URL}${file}`).then((r) => r.text());
  writeFileSync(cachePath, text);
  process.stdout.write('ok\n');
  return text;
};

// ─── Data joining ─────────────────────────────────────────────────────────────

const buildIndex = (arr, key = 'id') => {
  const map = new Map();
  for (const item of arr) map.set(item[key], item);
  return map;
};

const buildMultiIndex = (arr, key) => {
  const map = new Map();
  for (const item of arr) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
};

const buildDatasheet = (ds, data) => {
  const id = ds.id;

  // ── Models (stat lines) ───────────────────────────────────────────────────
  const models = (data.modelsBySheet.get(id) ?? []).map((m) => ({
    name:    m.name,
    m:       m.m,
    t:       m.t,
    sv:      m.sv,
    invSv:   m.invSv || null,
    w:       m.w,
    ld:      m.ld,
    oc:      m.oc,
  }));

  // ── Weapons ───────────────────────────────────────────────────────────────
  const wargearRows = (data.wargearBySheet.get(id) ?? []);
  // Group by `line` (same line = same weapon, multiple profiles)
  const weaponMap = new Map();
  for (const row of wargearRows) {
    if (!weaponMap.has(row.line)) weaponMap.set(row.line, []);
    weaponMap.get(row.line).push({
      name:  row.name,
      range: row.range,
      type:  row.type,
      a:     row.a,
      bsWs:  row.bsWs,
      s:     row.s,
      ap:    row.ap,
      d:     row.d,
      desc:  row.description || null,
    });
  }
  const weapons = Array.from(weaponMap.values()).map((profiles) => ({
    name:     profiles[0].name,
    type:     profiles[0].type,   // 'Ranged' | 'Melee'
    profiles,
  }));

  // ── Abilities ─────────────────────────────────────────────────────────────
  const abilityRows = (data.abilitiesBySheet.get(id) ?? []);
  const abilities = abilityRows.map((a) => {
    if (a.abilityId) {
      const ref = data.abilitiesById.get(a.abilityId);
      if (!ref) return null;
      return { name: ref.name, description: ref.description, type: a.type };
    }
    if (a.name) {
      return { name: a.name, description: a.description, type: a.type };
    }
    return null;
  }).filter(Boolean);

  // ── Keywords ──────────────────────────────────────────────────────────────
  const kwRows = (data.keywordsBySheet.get(id) ?? []);
  const keywords        = kwRows.filter((k) => k.isFactionKeyword !== 'true').map((k) => k.keyword);
  const factionKeywords = kwRows.filter((k) => k.isFactionKeyword === 'true').map((k) => k.keyword);

  // ── Unit composition ──────────────────────────────────────────────────────
  const composition = (data.compositionBySheet.get(id) ?? []).map((c) => c.description);

  // ── Points ────────────────────────────────────────────────────────────────
  const points = (data.costsBySheet.get(id) ?? []).map((c) => ({
    models: c.description,
    cost:   c.cost,
  }));

  // ── Leaders ───────────────────────────────────────────────────────────────
  // Units this datasheet can lead (it is the leader)
  const canLead = (data.leadersByLeaderId.get(id) ?? []).map((l) => l.attachedId);
  // Units that can lead this datasheet (it is the follower)
  const ledBy   = (data.leadersByAttachedId.get(id) ?? []).map((l) => l.leaderId);

  return {
    id,
    name:               ds.name,
    role:               ds.role || null,
    loadout:            ds.loadout || null,
    transport:          ds.transport || null,
    damagedW:           ds.damagedW || null,
    damagedDescription: ds.damagedDescription || null,
    leaderFooter:       ds.leaderFooter || null,
    isForgeWorld:       false, // set by caller
    isLegends:          false, // set by caller
    models,
    weapons,
    abilities,
    keywords,
    factionKeywords,
    composition,
    points,
    canLead,
    ledBy,
  };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  const force = process.argv.includes('--force');

  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(OUT_DIR,   { recursive: true });

  console.log(`\nWahapedia Scraper — ${force ? 'force download' : 'using cache where available'}\n`);

  // 1. Download all CSVs
  console.log('── Downloading CSVs ──────────────────────────────────────────');
  const csvTexts = {};
  for (const file of CSV_FILES) {
    csvTexts[file] = await loadCSV(file, force);
  }

  // 2. Parse all CSVs
  console.log('\n── Parsing ───────────────────────────────────────────────────');
  const raw = {};
  for (const file of CSV_FILES) {
    const key = localName(file).replace('.csv', '').replace(/-/g, '_');
    raw[key] = parseCSV(csvTexts[file]);
    console.log(`  ${file.padEnd(45)} ${raw[key].length} rows`);
  }

  // 3. Build lookup indexes
  const data = {
    abilitiesById:      buildIndex(raw.abilities),
    sourcesById:        buildIndex(raw.source),
    modelsBySheet:      buildMultiIndex(raw.datasheets_models,               'datasheetId'),
    wargearBySheet:     buildMultiIndex(raw.datasheets_wargear,              'datasheetId'),
    abilitiesBySheet:   buildMultiIndex(raw.datasheets_abilities,            'datasheetId'),
    keywordsBySheet:    buildMultiIndex(raw.datasheets_keywords,             'datasheetId'),
    compositionBySheet: buildMultiIndex(raw.datasheets_unit_composition,     'datasheetId'),
    costsBySheet:       buildMultiIndex(raw.datasheets_models_cost,          'datasheetId'),
    leadersByLeaderId:  buildMultiIndex(raw.datasheets_leader,               'leaderId'),
    leadersByAttachedId:buildMultiIndex(raw.datasheets_leader,               'attachedId'),
    stratagemsByFaction:buildMultiIndex(raw.stratagems,                      'factionId'),
    enhancementsByFaction: buildMultiIndex(raw.enhancements,                 'factionId'),
    detachmentAbilitiesByFaction: buildMultiIndex(raw.detachment_abilities,  'factionId'),
  };

  // Source classification
  const forgeWorldIds = new Set();
  const legendsIds    = new Set();
  for (const src of raw.source) {
    if (src.name.endsWith('(Forge World)'))          forgeWorldIds.add(src.id);
    if (src.name.endsWith('(Warhammer Legends)') ||
        src.name.startsWith('Legends:'))             legendsIds.add(src.id);
  }

  // 4. Build detachments per faction
  const buildDetachments = (factionId) => {
    const map = new Map();
    const add = (detName, type, entry) => {
      if (!detName) return;
      if (!map.has(detName)) map.set(detName, { name: detName, rules: [], enhancements: [], stratagems: [] });
      map.get(detName)[type].push(entry);
    };
    for (const a of (data.detachmentAbilitiesByFaction.get(factionId) ?? []))
      add(a.detachment, 'rules', { name: a.name, description: a.description });
    for (const e of (data.enhancementsByFaction.get(factionId) ?? []))
      add(e.detachment, 'enhancements', { name: e.name, description: e.description, cost: e.cost });
    for (const s of (data.stratagemsByFaction.get(factionId) ?? []))
      add(s.detachment, 'stratagems', { name: s.name, type: s.type, cost: s.cpCost, when: s.turn ? `${s.turn} – ${s.phase}` : null, description: s.description });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Core stratagems (no faction)
  const coreStratagems = raw.stratagems
    .filter((s) => !s.factionId?.trim())
    .map((s) => ({ name: s.name, type: s.type, cost: s.cpCost, when: s.turn ? `${s.turn} – ${s.phase}` : null, description: s.description }));

  // 5. Generate per-faction output
  console.log('\n── Generating faction JSON files ─────────────────────────────');
  const index = [];
  const lastUpdate = raw.last_update[0]?.lastUpdate ?? null;

  for (const faction of raw.factions) {
    const factionDatasheets = raw.datasheets.filter(
      (ds) => ds.factionId === faction.id && ds.virtual === 'false',
    );
    if (factionDatasheets.length === 0) continue;

    const sheets = factionDatasheets.map((ds) => {
      const sheet = buildDatasheet(ds, data);
      sheet.isForgeWorld = forgeWorldIds.has(ds.sourceId);
      sheet.isLegends    = legendsIds.has(ds.sourceId);
      return sheet;
    }).sort((a, b) => a.name.localeCompare(b.name));

    const detachments = buildDetachments(faction.id);

    const output = {
      id:          faction.id,
      name:        faction.name,
      lastUpdate,
      detachments,
      datasheets:  sheets,
    };

    const outPath = join(OUT_DIR, `${faction.id}.json`);
    writeFileSync(outPath, JSON.stringify(output));
    console.log(`  ${faction.name.padEnd(40)} ${sheets.length} units, ${detachments.length} detachments → ${faction.id}.json`);

    index.push({ id: faction.id, name: faction.name, datasheetCount: sheets.length, detachmentCount: detachments.length });
  }

  // index.json + core-stratagems.json
  writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
  writeFileSync(join(OUT_DIR, 'core-stratagems.json'), JSON.stringify(coreStratagems, null, 2));

  console.log(`\n✓ Done. ${index.length} factions written to public/wahapedia/`);
  console.log(`  Last Wahapedia update: ${lastUpdate ?? 'unknown'}`);
};

main().catch((err) => { console.error(err); process.exit(1); });
