const STORAGE_KEY_PREFIX = 'aura_';
const MIGRATION_FLAG = 'aura_branding_migrated';

const REPLACEMENTS: [string, string][] = [
  ['Aura Luxe Flagship Store', 'STEROSE'],
  ['STEROSE Flagship Store', 'STEROSE'],
  ['Aura Luxe', 'STEROSE'],
  ['auraluxe.store', 'sterose.store'],
  ['AURASPRING20', 'STEROSE20'],
  ['LUXE50', 'STEROSE50'],
  ['Aura Pulse', 'STEROSE Pulse'],
  ['aura-pulse', 'sterose-pulse'],
  ['orders over $150', 'orders over {freeShipping}'],
];

// Browsers that visited before the rebrand hold the old name in saved store data
export const migrateStoredBranding = () => {
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(STORAGE_KEY_PREFIX)) continue;
      const value = localStorage.getItem(key) ?? '';
      const updated = REPLACEMENTS.reduce((text, [from, to]) => text.split(from).join(to), value);
      if (updated !== value) localStorage.setItem(key, updated);
    }

    localStorage.setItem(MIGRATION_FLAG, 'true');
  } catch (error) {
    console.warn('Could not update saved store data', error);
  }
};
