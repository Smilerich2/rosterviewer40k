import type { WahapediaFaction, WahapediaDatasheet, WahapediaLookup } from '@/types/wahapedia';

interface FactionIndex {
  id: string;
  name: string;
  datasheetCount: number;
  detachmentCount: number;
}

const normalize = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * BattleScribe catalogue names don't always match Wahapedia faction names.
 * Maps normalized BattleScribe keywords → normalized Wahapedia faction name.
 */
const CATALOGUE_ALIASES: Array<[string, string]> = [
  ['adeptusastartes',    'spacemarines'],
  ['hereticsastartes',   'chaosspacemarines'],
  ['craftworld',         'aeldari'],
  ['drukhari',           'drukhari'],
  ['genestealercults',   'genestealercults'],
  ['adeptusmechanicus',  'adeptusmechanicus'],
  ['adeptuscustodes',    'adeptuscustodes'],
  ['adeptasororitas',    'adeptasororitas'],
  ['astramilitarum',     'astramilitarum'],
  ['greyknight',         'greyknights'],
  ['deathguard',         'deathguard'],
  ['thousandsons',       'thousandsons'],
  ['worldeaters',        'worldeaters'],
  ['emperorschildren',   'emperorschildren'],
  ['chaosknights',       'chaosknights'],
  ['imperialknights',    'imperialknights'],
  ['chaosdaemons',       'chaosdaemons'],
  ['leaguesofvotann',    'leaguesofvotann'],
  ['tauempire',          'tauempire'],
  ['tyranids',           'tyranids'],
  ['necrons',            'necrons'],
  ['orks',               'orks'],
];

/**
 * Fetches the index, finds the best-matching faction for the given
 * BattleScribe catalogueName, then fetches and returns that faction's data.
 */
export async function loadWahapediaFaction(
  catalogueName: string,
): Promise<WahapediaFaction | null> {
  try {
    const indexRes = await fetch('/wahapedia/index.json');
    if (!indexRes.ok) return null;
    const index: FactionIndex[] = await indexRes.json();

    const normCat = normalize(catalogueName);

    // 1. Direct containment match (e.g. "Space Marines" inside catalogue name)
    const sorted = [...index].sort((a, b) => b.name.length - a.name.length);
    let match = sorted.find(f => normCat.includes(normalize(f.name)));

    // 2. Alias fallback (e.g. "adeptusastartes" → "spacemarines")
    if (!match) {
      for (const [keyword, wahapediaName] of CATALOGUE_ALIASES) {
        if (normCat.includes(keyword)) {
          match = index.find(f => normalize(f.name) === wahapediaName);
          if (match) break;
        }
      }
    }

    if (!match) return null;

    const factionRes = await fetch(`/wahapedia/${match.id}.json`);
    if (!factionRes.ok) return null;
    return await factionRes.json();
  } catch {
    return null;
  }
}

/**
 * Builds a name-keyed lookup map from a WahapediaFaction.
 */
export function buildLookup(faction: WahapediaFaction): WahapediaLookup {
  const map = new Map<string, WahapediaDatasheet>();
  for (const ds of faction.datasheets) {
    map.set(normalize(ds.name), ds);
  }
  return map;
}

/**
 * Finds the Wahapedia datasheet matching a BattleScribe unit name.
 * Falls back to null if not found.
 */
export function lookupUnit(
  lookup: WahapediaLookup,
  unitName: string,
): WahapediaDatasheet | null {
  return lookup.get(normalize(unitName)) ?? null;
}

/**
 * Finds the Wahapedia detachment matching a BattleScribe detachment name.
 * Accepts partial matches in both directions (e.g. "Gladius Task Force" ↔ "Gladius").
 */
export function lookupDetachment(
  faction: WahapediaFaction,
  detachmentName: string,
): import('@/types/wahapedia').WahapediaDetachment | null {
  const norm = normalize(detachmentName);
  // Exact match first, then partial
  return (
    faction.detachments.find(d => normalize(d.name) === norm) ??
    faction.detachments.find(d => normalize(d.name).includes(norm) || norm.includes(normalize(d.name))) ??
    null
  );
}
