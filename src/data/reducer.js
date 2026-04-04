import { INITIAL_STATE } from './seedData.js';

const STORAGE_KEY = 'bdtcollect_v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const loaded = JSON.parse(raw);
    
    // Inject accessIds for older states
    if (loaded && loaded.team) {
      loaded.team = loaded.team.map(m => {
        if (!m.accessId) {
          const initMatch = INITIAL_STATE.team.find(t => t.id === m.id);
          if (initMatch) m.accessId = initMatch.accessId;
          else m.accessId = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
        return m;
      });
    }
    return loaded;
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function reducer(state, action) {
  let next = state;

  switch (action.type) {
    case 'ADD_SESSION': {
      const session = {
        id: uid(),
        timestamp: new Date().toISOString(),
        memberId: action.payload.memberId,
        category: action.payload.category,
        subcategory: action.payload.subcategory,
        denominations: action.payload.denominations || [],
        groundTruthSum: action.payload.groundTruthSum || 0,
        conditions: action.payload.conditions || [],
        environments: action.payload.environments || [],
        lighting: action.payload.lighting || [],
        arrangements: action.payload.arrangements || [],
        imageCount: action.payload.imageCount,
        status: 'collected',
        annotatedBy: null,
        reviewedBy: null,
        notes: action.payload.notes || '',
        background: action.payload.background || '',
      };
      next = { ...state, sessions: [...state.sessions, session] };
      break;
    }

    case 'UPDATE_SESSION_STATUS': {
      next = {
        ...state,
        sessions: state.sessions.map(s =>
          s.id === action.payload.id
            ? {
                ...s,
                status: action.payload.status,
                annotatedBy: action.payload.annotatedBy ?? s.annotatedBy,
                reviewedBy: action.payload.reviewedBy ?? s.reviewedBy,
              }
            : s
        ),
      };
      break;
    }

    case 'ADD_QC_CHECK': {
      const check = {
        id: uid(),
        timestamp: new Date().toISOString(),
        reviewerId: action.payload.reviewerId,
        annotatorId: action.payload.annotatorId,
        batchSize: action.payload.batchSize,
        errorsFound: action.payload.errorsFound,
        errorTypes: action.payload.errorTypes || [],
        agreementPct: ((action.payload.batchSize - action.payload.errorsFound) / action.payload.batchSize) * 100,
        action: action.payload.action,
        notes: action.payload.notes || '',
      };
      next = { ...state, qcChecks: [...state.qcChecks, check] };
      break;
    }

    case 'ADD_TEAM_MEMBER': {
      const member = {
        id: uid(),
        name: action.payload.name,
        initials: action.payload.initials,
        role: action.payload.role,
        color: action.payload.color,
        accessId: action.payload.accessId,
        createdAt: new Date().toISOString(),
      };
      next = { ...state, team: [...state.team, member] };
      break;
    }

    case 'REMOVE_TEAM_MEMBER': {
      next = { ...state, team: state.team.filter(m => m.id !== action.payload.id) };
      break;
    }

    case 'SET_DEADLINE': {
      next = { ...state, meta: { ...state.meta, deadline: action.payload.deadline } };
      break;
    }

    case 'SET_TARGET': {
      next = {
        ...state,
        targets: { ...state.targets, [action.payload.key]: action.payload.value },
      };
      break;
    }

    case 'SET_TASK_ASSIGNMENT': {
      next = {
        ...state,
        taskAssignments: {
          ...state.taskAssignments,
          [action.payload.taskKey]: {
            primaryId: action.payload.primaryId,
            backupId: action.payload.backupId,
            deadline: action.payload.deadline || null,
          },
        },
      };
      break;
    }

    case 'DISMISS_ONBOARDING': {
      next = { ...state, meta: { ...state.meta, onboardingDismissed: true } };
      break;
    }

    case 'RESET_ALL': {
      next = INITIAL_STATE;
      break;
    }

    default:
      return state;
  }

  saveState(next);
  return next;
}
