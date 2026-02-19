import type {
  RawJSON,
  RawSelection,
  Profile,
  ParsedUnit,
  ParsedRoster,
  Rule,
} from '@/types/roster';

// ─── Recursive collectors ─────────────────────────────────────────────────────

interface CollectedProfiles {
  unit: Profile[];
  ranged: Profile[];
  melee: Profile[];
  abilities: Profile[];
}

export function gatherProfiles(
  selection: RawSelection,
  collected: CollectedProfiles = { unit: [], ranged: [], melee: [], abilities: [] },
): CollectedProfiles {
  if (selection.profiles) {
    for (const profile of selection.profiles) {
      const isDuplicate = (list: Profile[]) => list.some(p => p.name === profile.name);
      if      (profile.typeName === 'Unit'          && !isDuplicate(collected.unit))      collected.unit.push(profile);
      else if (profile.typeName === 'Ranged Weapons' && !isDuplicate(collected.ranged))   collected.ranged.push(profile);
      else if (profile.typeName === 'Melee Weapons'  && !isDuplicate(collected.melee))    collected.melee.push(profile);
      else if (profile.typeName === 'Abilities'      && !isDuplicate(collected.abilities))collected.abilities.push(profile);
    }
  }
  if (selection.selections) {
    for (const child of selection.selections) gatherProfiles(child, collected);
  }
  return collected;
}

export function gatherKeywords(selection: RawSelection): string[] {
  const keywords = new Set<string>();
  if (selection.categories) {
    for (const cat of selection.categories) keywords.add(cat.name);
  }
  return Array.from(keywords).filter(k => k !== 'Configuration' && k !== 'Uncategorized');
}

export function gatherRules(
  selection: RawSelection,
  collected: Record<string, string> = {},
): Record<string, string> {
  if (selection.rules) {
    for (const rule of selection.rules) {
      collected[rule.name.toLowerCase()] = rule.description;
    }
  }
  if (selection.selections) {
    for (const child of selection.selections) gatherRules(child, collected);
  }
  if (selection.forces) {
    for (const force of selection.forces) gatherRules(force as unknown as RawSelection, collected);
  }
  return collected;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseRoster(json: RawJSON): ParsedRoster | null {
  if (!json?.roster?.forces) return null;

  const force = json.roster.forces[0];
  const catalogueName = force.catalogueName ?? 'Unknown';
  const pointLimit = json.roster.costLimits?.[0]?.value ?? '???';
  const armyName = `${pointLimit}pts ${catalogueName}`;

  const globalRules = gatherRules(force as unknown as RawSelection);
  const armyRules: Rule[] = force.rules ?? [];

  // BattleScribe stores the detachment name as the first sub-selection of the "Detachment" config entry.
  // e.g. selections: [{ name: "Detachment", selections: [{ name: "Reclamation Force" }] }]
  const detachmentName =
    force.selections.find(s => s.name === 'Detachment')?.selections?.[0]?.name ?? null;

  const units: ParsedUnit[] = force.selections
    .filter(sel => {
      const profiles = gatherProfiles(sel);
      const isConfig = sel.categories?.some(c => c.name === 'Configuration');
      return !isConfig && (profiles.unit.length > 0 || profiles.ranged.length > 0 || profiles.melee.length > 0);
    })
    .map((sel, idx): ParsedUnit => {
      const profiles  = gatherProfiles(sel);
      const keywords  = gatherKeywords(sel);
      const cost      = sel.costs?.find(c => c.name === 'pts')?.value ?? 0;
      const woundStat = profiles.unit[0]?.characteristics.find(c => c.name === 'W');
      const maxWounds = woundStat ? parseInt(woundStat.$text, 10) : 1;

      return {
        id: sel.id,
        name: sel.name,
        customName: sel.customName,
        cost,
        stats: profiles.unit,
        ranged: profiles.ranged,
        melee: profiles.melee,
        abilities: profiles.abilities,
        keywords,
        maxWounds,
        isCharacter: keywords.includes('Character'),
        originalIndex: idx,
      };
    });

  return {
    armyName,
    catalogueName,
    detachmentName,
    totalPoints: json.roster.costs?.[0]?.value ?? 0,
    units,
    rules: globalRules,
    armyRules,
  };
}
