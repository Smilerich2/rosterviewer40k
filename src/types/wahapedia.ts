export interface WahapediaModel {
  name: string;
  m: string;
  t: string;
  sv: string;
  invSv: string | null;
  w: string;
  ld: string;
  oc: string;
}

export interface WahapediaWeaponProfile {
  name: string;
  range: string;
  type: string;
  a: string;
  bsWs: string;
  s: string;
  ap: string;
  d: string;
  desc: string | null;
}

export interface WahapediaWeapon {
  name: string;
  type: string; // 'Ranged' | 'Melee'
  profiles: WahapediaWeaponProfile[];
}

export interface WahapediaAbility {
  name: string;
  description: string;
  type: string;
}

export interface WahapediaDatasheet {
  id: string;
  name: string;
  role: string | null;
  loadout: string | null;
  transport: string | null;
  damagedW: string | null;
  damagedDescription: string | null;
  leaderFooter: string | null;
  isForgeWorld: boolean;
  isLegends: boolean;
  models: WahapediaModel[];
  weapons: WahapediaWeapon[];
  abilities: WahapediaAbility[];
  keywords: string[];
  factionKeywords: string[];
  composition: string[];
  points: Array<{ models: string; cost: string }>;
  canLead: string[];
  ledBy: string[];
}

export interface WahapediaDetachmentStratagem {
  name: string;
  type: string;
  cost: string;
  when: string | null;
  description: string;
}

export interface WahapediaDetachment {
  name: string;
  rules: Array<{ name: string; description: string }>;
  enhancements: Array<{ name: string; description: string; cost: string }>;
  stratagems: WahapediaDetachmentStratagem[];
}

export interface WahapediaFaction {
  id: string;
  name: string;
  lastUpdate: string | null;
  detachments: WahapediaDetachment[];
  datasheets: WahapediaDatasheet[];
}

export type WahapediaLookup = Map<string, WahapediaDatasheet>;
