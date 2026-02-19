// ─── Raw JSON shapes (BattleScribe / NewRecruit) ─────────────────────────────

export interface Characteristic {
  name: string;
  $text: string;
}

export interface RawProfile {
  name: string;
  typeName: string;
  characteristics: Characteristic[];
}

export interface Rule {
  name: string;
  description: string;
}

export interface RawCategory {
  name: string;
}

export interface RawCost {
  name: string;
  value: number;
}

export interface RawSelection {
  id: string;
  name: string;
  customName?: string;
  categories?: RawCategory[];
  costs?: RawCost[];
  profiles?: RawProfile[];
  selections?: RawSelection[];
  rules?: Rule[];
  forces?: RawForce[];
}

export interface RawForce {
  catalogueName: string;
  selections: RawSelection[];
  rules?: Rule[];
}

export interface RawRoster {
  costs?: RawCost[];
  costLimits?: Array<{ value: number }>;
  forces: RawForce[];
}

export interface RawJSON {
  roster: RawRoster;
}

// ─── Parsed / app-level shapes ───────────────────────────────────────────────

export interface Profile {
  name: string;
  typeName: string;
  characteristics: Characteristic[];
}

export interface ParsedUnit {
  id: string;
  name: string;
  customName?: string;
  cost: number;
  stats: Profile[];
  ranged: Profile[];
  melee: Profile[];
  abilities: Profile[];
  keywords: string[];
  maxWounds: number;
  isCharacter: boolean;
  originalIndex: number;
  attachedLeaders?: ParsedUnit[];
}

export interface ParsedRoster {
  armyName: string;
  catalogueName: string;
  detachmentName: string | null;
  totalPoints: number;
  units: ParsedUnit[];
  rules: Record<string, string>;
  armyRules: Rule[];
}

export interface FactionTheme {
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  icon: string;
}

export type ViewMode = 'cards' | 'table';
