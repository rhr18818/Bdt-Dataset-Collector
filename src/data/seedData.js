// ============================================================
// SEED DATA — constants, targets, initial state
// ============================================================

export const DENOMINATIONS = [2, 5, 10, 20, 50, 100, 200, 500, 1000];

export const CONDITIONS = ['flat', 'folded', 'crumpled', 'worn', 'rolled'];
export const ENVIRONMENTS = ['desk', 'floor', 'wallet', 'pocket', 'hand', 'ATM tray', 'market'];
export const LIGHTING = ['daylight', 'fluorescent', 'dim', 'harsh shadow', 'glare'];
export const ARRANGEMENTS = ['side-by-side', 'overlapping 10%', 'overlapping 30%', 'fanned', 'stacked', 'hand-held'];
export const BG_TYPES = ['simple white', 'desk', 'hand', 'real environment'];

export const CATEGORY_LABELS = {
  A: 'Single Note Images',
  B: 'Multi-Note Scenes',
  C: 'Occlusion Images',
  D: 'Lighting & Environment',
};

export const CATEGORY_DESCRIPTIONS = {
  A: 'Individual banknote photos across conditions and environments',
  B: 'Multiple notes in one frame — the dataset novelty',
  C: 'Notes with various occlusion types',
  D: 'Environmental and lighting condition coverage matrix',
};

export const AVATAR_COLORS = [
  '#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#db2777','#65a30d'
];

// Pre-defined B combinations
export const B_COMBINATIONS = [
  // 2-note
  { key: '100+50', notes: 2, denoms: [100,50], sum: 150, target: 80 },
  { key: '500+100', notes: 2, denoms: [500,100], sum: 600, target: 80 },
  { key: '500+500', notes: 2, denoms: [500,500], sum: 1000, target: 80 },
  { key: '1000+500', notes: 2, denoms: [1000,500], sum: 1500, target: 80 },
  { key: '100+20', notes: 2, denoms: [100,20], sum: 120, target: 80 },
  { key: '200+100', notes: 2, denoms: [200,100], sum: 300, target: 60 },
  { key: '50+20', notes: 2, denoms: [50,20], sum: 70, target: 60 },
  { key: '100+100', notes: 2, denoms: [100,100], sum: 200, target: 60 },
  { key: '500+200', notes: 2, denoms: [500,200], sum: 700, target: 60 },
  { key: '1000+1000', notes: 2, denoms: [1000,1000], sum: 2000, target: 80 },
  { key: '10+20', notes: 2, denoms: [10,20], sum: 30, target: 60 },
  { key: '50+50', notes: 2, denoms: [50,50], sum: 100, target: 60 },
  { key: '5+2', notes: 2, denoms: [5,2], sum: 7, target: 60 },
  { key: '10+5', notes: 2, denoms: [10,5], sum: 15, target: 60 },
  // 3-note
  { key: '500+200+100', notes: 3, denoms: [500,200,100], sum: 800, target: 80 },
  { key: '1000+500+100', notes: 3, denoms: [1000,500,100], sum: 1600, target: 80 },
  { key: '100+50+20', notes: 3, denoms: [100,50,20], sum: 170, target: 80 },
  { key: '500+100+50', notes: 3, denoms: [500,100,50], sum: 650, target: 60 },
  { key: '200+100+100', notes: 3, denoms: [200,100,100], sum: 400, target: 60 },
  { key: '1000+200+50', notes: 3, denoms: [1000,200,50], sum: 1250, target: 60 },
  { key: '100+20+10', notes: 3, denoms: [100,20,10], sum: 130, target: 60 },
  { key: '10+5+2', notes: 3, denoms: [10,5,2], sum: 17, target: 40 },
  // 4-note
  { key: '500+200+100+50', notes: 4, denoms: [500,200,100,50], sum: 850, target: 50 },
  { key: '1000+500+200+100', notes: 4, denoms: [1000,500,200,100], sum: 1800, target: 50 },
  { key: '100+100+50+20', notes: 4, denoms: [100,100,50,20], sum: 270, target: 50 },
  { key: '500+100+100+50', notes: 4, denoms: [500,100,100,50], sum: 750, target: 50 },
  { key: '200+100+50+20', notes: 4, denoms: [200,100,50,20], sum: 370, target: 50 },
  { key: '1000+200+100+50', notes: 4, denoms: [1000,200,100,50], sum: 1350, target: 40 },
  { key: '100+50+20+10', notes: 4, denoms: [100,50,20,10], sum: 180, target: 50 },
  { key: '500+500+100+100', notes: 4, denoms: [500,500,100,100], sum: 1200, target: 40 },
  // 5-note
  { key: '500+200+100+50+20', notes: 5, denoms: [500,200,100,50,20], sum: 870, target: 40 },
  { key: '1000+500+200+100+50', notes: 5, denoms: [1000,500,200,100,50], sum: 1850, target: 40 },
  { key: '100+100+50+20+10', notes: 5, denoms: [100,100,50,20,10], sum: 280, target: 40 },
  { key: '500+100+100+50+50', notes: 5, denoms: [500,100,100,50,50], sum: 800, target: 35 },
  { key: '200+200+100+50+20', notes: 5, denoms: [200,200,100,50,20], sum: 570, target: 40 },
  // 6-note
  { key: '1000+500+200+100+50+20', notes: 6, denoms: [1000,500,200,100,50,20], sum: 1870, target: 35 },
  { key: '500+200+100+100+50+20', notes: 6, denoms: [500,200,100,100,50,20], sum: 970, target: 35 },
  { key: '100+100+50+50+20+10', notes: 6, denoms: [100,100,50,50,20,10], sum: 330, target: 35 },
  { key: '1000+1000+500+200+100+50', notes: 6, denoms: [1000,1000,500,200,100,50], sum: 2850, target: 30 },
  { key: '500+500+200+100+50+20', notes: 6, denoms: [500,500,200,100,50,20], sum: 1370, target: 30 },
];

export const C_SUBTASKS = [
  { key: 'note-overlap', label: 'Note-on-note overlap', target: 950, icon: '⊙' },
  { key: 'fingers', label: 'Fingers covering note', target: 650, icon: '✋' },
  { key: 'folded', label: 'Folded notes', target: 1000, icon: '📄' },
  { key: 'frame-edge', label: 'Half-visible at frame edge', target: 800, icon: '▣' },
];

export const ROLE_LABELS = { lead: 'Team Lead', collector: 'Collector', annotator: 'Annotator', both: 'Collector & Annotator' };

// ---- Build initial D-matrix targets ----
function buildDTargets() {
  const obj = {};
  for (const env of ENVIRONMENTS) {
    for (const light of LIGHTING) {
      obj[`${env}||${light}`] = 40;
    }
  }
  return obj;
}

// ---- Build combination targets ----
function buildBTargets() {
  const obj = {};
  for (const combo of B_COMBINATIONS) {
    obj[combo.key] = combo.target;
  }
  return obj;
}

const today = new Date();
const deadline = new Date(today);
deadline.setDate(deadline.getDate() + 60);

export const INITIAL_STATE = {
  meta: {
    created: today.toISOString(),
    version: '1.0',
    deadline: deadline.toISOString(),
    projectName: 'BDT-MultiScene Dataset',
    onboardingDismissed: false,
  },
  team: [
    { id: 'member-tl', name: 'Team Lead', initials: 'TL', role: 'lead', color: '#2563eb', accessId: 'admin', createdAt: today.toISOString() },
    { id: 'member-ja', name: 'Junior A', initials: 'JA', role: 'collector', color: '#16a34a', accessId: 'junior_a', createdAt: today.toISOString() },
    { id: 'member-jb', name: 'Junior B', initials: 'JB', role: 'collector', color: '#d97706', accessId: 'junior_b', createdAt: today.toISOString() },
  ],
  sessions: [],
  qcChecks: [],
  taskAssignments: {},
  targets: {
    A: 10000,
    B: 8000,
    C: 4000,
    D: 4000,
    B_combinations: buildBTargets(),
    D_matrix: buildDTargets(),
    C_subtasks: { 'note-overlap': 950, 'fingers': 650, 'folded': 1000, 'frame-edge': 800 },
    A_denominations: Object.fromEntries(DENOMINATIONS.map(d => [d, Math.round(10000/9)])),
  },
};
