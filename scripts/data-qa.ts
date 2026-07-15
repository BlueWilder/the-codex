/**
 * Data QA check — diff Codex's game-data.ts against the official botc.app data.
 *
 * Sources (canonical, machine-readable):
 *   roles.json      https://release.botc.app/resources/data/roles.json
 *   jinxes.json     https://release.botc.app/resources/data/jinxes.json
 *   nightsheet.json https://release.botc.app/resources/data/nightsheet.json
 *
 * Checks (read-only, never mutates data):
 *   - team, setup flag, ability text, first/other night order (per character)
 *   - jinx pairs: missing, extra, reason wording
 * Cosmetic differences (US/UK spelling, & vs and, ordinals, punctuation,
 * traveller/traveler) are normalized out so only substantive drift surfaces.
 *
 * Run:  npm run data-qa        (exits 1 if any substantive mismatch)
 */
import { ALL_CHARACTERS, JINXES } from '../client/src/lib/game-data';

const ROLES = 'https://release.botc.app/resources/data/roles.json';
const JINX = 'https://release.botc.app/resources/data/jinxes.json';
const NIGHT = 'https://release.botc.app/resources/data/nightsheet.json';

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const normTeam = (t: string) => (t === 'traveller' ? 'traveler' : t);
const META = new Set(['dusk', 'minioninfo', 'demoninfo', 'dawn']);

const UK: [RegExp, string][] = [
  [/neighbours/g, 'neighbors'], [/neighbour/g, 'neighbor'],
  [/travellers/g, 'travelers'], [/traveller/g, 'traveler'],
  [/colour/g, 'color'], [/favour/g, 'favor'], [/\bcancelled\b/g, 'canceled'],
];
const ORD: [RegExp, string][] = [
  [/\b1st\b/g, 'first'], [/\b2nd\b/g, 'second'], [/\b3rd\b/g, 'third'],
  [/\b4th\b/g, 'fourth'], [/\b5th\b/g, 'fifth'],
];
function normText(s: string): string {
  let t = (s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  for (const [a, b] of UK) t = t.replace(a, b);
  for (const [a, b] of ORD) t = t.replace(a, b);
  t = t.replace(/&/g, ' and ')
       .replace(/[^a-z0-9' ]/g, ' ')
       .replace(/\bnot in play\b/g, 'notinplay')
       .replace(/\s+/g, ' ').trim();
  return t;
}

type Role = { id: string; name: string; team?: string; ability?: string; setup?: boolean };
type NightSheet = { firstNight: string[]; otherNight: string[] };
type JinxGroup = { id: string; jinx: { id: string; reason: string }[] };

async function main() {
  const [roles, jinxes, night] = await Promise.all([
    fetch(ROLES).then(r => r.json() as Promise<Role[]>),
    fetch(JINX).then(r => r.json() as Promise<JinxGroup[]>),
    fetch(NIGHT).then(r => r.json() as Promise<NightSheet>),
  ]);

  const roleByNorm = new Map(roles.map(r => [norm(r.id), r]));
  const codexIds = new Set(ALL_CHARACTERS.map(c => norm(c.id)));
  const firstRank = new Map<string, number>();
  night.firstNight.filter(x => !META.has(x)).forEach((id, i) => firstRank.set(norm(id), i + 1));
  const otherRank = new Map<string, number>();
  night.otherNight.filter(x => !META.has(x)).forEach((id, i) => otherRank.set(norm(id), i + 1));

  const team: string[] = [], setup: string[] = [], ability: string[] = [];
  const firstN: string[] = [], otherN: string[] = [], notFound: string[] = [];

  for (const c of ALL_CHARACTERS) {
    const n = norm(c.id);
    const o = roleByNorm.get(n);
    if (!o) { notFound.push(c.id); continue; }
    if (o.team && o.team !== 'loric' && normTeam(c.team) !== normTeam(o.team))
      team.push(`${c.id}: codex=${c.team} official=${o.team}`);
    if (typeof o.setup === 'boolean' && c.setup !== o.setup)
      setup.push(`${c.id}: codex=${c.setup} official=${o.setup}`);
    if (o.ability && normText(c.ability) !== normText(o.ability))
      ability.push(`${c.id}\n    codex:    ${c.ability}\n    official: ${o.ability}`);
    const ef = firstRank.has(n) ? firstRank.get(n)! : null;
    const eo = otherRank.has(n) ? otherRank.get(n)! : null;
    if (c.firstNightOrder !== ef) firstN.push(`${c.id}: codex=${c.firstNightOrder} expected=${ef}`);
    if (c.otherNightOrder !== eo) otherN.push(`${c.id}: codex=${c.otherNightOrder} expected=${eo}`);
  }

  const offPairs = new Map<string, { a: string; b: string; reason: string }>();
  for (const g of jinxes) for (const j of g.jinx)
    offPairs.set([norm(g.id), norm(j.id)].sort().join('|'), { a: g.id, b: j.id, reason: j.reason });
  const codexIdByNorm = new Map(ALL_CHARACTERS.map(c => [norm(c.id), c.id]));
  const straight = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const esc = (s: string) => straight(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const codexPairs = new Map<string, typeof JINXES[number]>();
  for (const p of JINXES) codexPairs.set([norm(p.character1), norm(p.character2)].sort().join('|'), p);

  const jMiss: string[] = [], jExtra: string[] = [], jReason: string[] = [];
  for (const [k, v] of offPairs) {
    const cp = codexPairs.get(k);
    const [x, y] = k.split('|');
    if (!cp) {
      if (codexIds.has(x) && codexIds.has(y)) {
        const c1 = codexIdByNorm.get(x)!, c2 = codexIdByNorm.get(y)!;
        jMiss.push(`{ character1: '${c1}', character2: '${c2}', reason: '${esc(v.reason)}' },`);
      }
      continue;
    }
    if (normText(cp.reason) !== normText(v.reason))
      jReason.push(`${v.a}+${v.b}\n    codex:    ${cp.reason}\n    official: ${v.reason}`);
  }
  for (const [k, v] of codexPairs) if (!offPairs.has(k)) jExtra.push(`${v.character1} + ${v.character2}`);

  const box = (t: string, arr: string[]) => {
    console.log(`\n### ${t} (${arr.length})`);
    arr.forEach(x => console.log('  - ' + x));
  };
  console.log(`Codex: ${ALL_CHARACTERS.length} chars, ${JINXES.length} jinxes | ` +
              `Official: ${roles.length} roles, ${offPairs.size} jinx pairs`);
  box('TEAM MISMATCH', team);
  box('SETUP FLAG MISMATCH', setup);
  box('FIRST-NIGHT ORDER MISMATCH', firstN);
  box('OTHER-NIGHT ORDER MISMATCH', otherN);
  box('ABILITY TEXT MISMATCH', ability);
  box('JINX MISSING — paste these literals into the JINXES array', jMiss);
  box('JINX EXTRA (in Codex, not official)', jExtra);
  box('JINX REASON WORDING DIFF', jReason);
  box('INFO: Codex id not found in official (naming or intentional omission)', notFound);

  const problems = team.length + setup.length + firstN.length + otherN.length +
                   ability.length + jMiss.length + jExtra.length + jReason.length;
  console.log(`\n${problems === 0 ? 'PASS — Codex data aligned with official.' : `FAIL — ${problems} substantive mismatch(es).`}`);
  process.exit(problems === 0 ? 0 : 1);
}
main().catch(e => { console.error('data-qa error:', e); process.exit(2); });
