import { create } from 'zustand';
import type { Shot, SidebarView, PanelTab } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function createDefaultShot(number: number): Shot {
  return {
    id: generateId(),
    number,
    description: '',
    prompt: '',
    cameraMovements: [],
    transition: 'continue',
    duration: 5,
    imageUrl: null,
    mood: '',
    lighting: '',
    subject: '',
    action: '',
    scene: '',
    audioNote: '',
  };
}

interface StoryboardState {
  shots: Shot[];
  selectedShotId: string | null;
  activeView: SidebarView;
  activePanelTab: PanelTab;
  showSettings: boolean;

  // Shot actions
  addShot: () => void;
  removeShot: (id: string) => void;
  duplicateShot: (id: string) => void;
  updateShot: (id: string, updates: Partial<Shot>) => void;
  selectShot: (id: string | null) => void;
  reorderShots: (fromIndex: number, toIndex: number) => void;

  // Camera movements
  toggleCameraMovement: (shotId: string, movementId: string) => void;

  // UI actions
  setActiveView: (view: SidebarView) => void;
  setActivePanelTab: (tab: PanelTab) => void;
  setShowSettings: (show: boolean) => void;

  // Getters
  getSelectedShot: () => Shot | undefined;
}

export const useStoryboardStore = create<StoryboardState>((set, get) => ({
  shots: [
    { ...createDefaultShot(1), description: '城市夜景全景', subject: '一座繁华的城市', action: '灯火通明', scene: '雨后的城市街道', mood: '赛博朋克', lighting: 'neon lights reflecting on wet streets', cameraMovements: ['crane-down', 'push-in'] },
    { ...createDefaultShot(2), description: '主角登场', subject: '一位穿着黑色风衣的年轻女性', action: '缓步走过街道', scene: '霓虹灯闪烁的小巷', mood: '神秘', lighting: 'dramatic side lighting from neon signs', cameraMovements: ['follow'] },
    { ...createDefaultShot(3), description: '特写转身', subject: '她的面部特写', action: '猛然转身回望', scene: '雨中', mood: '紧张', lighting: 'backlit by a single streetlight, rain drops visible', cameraMovements: ['push-in', 'tilt-up'] },
  ],
  selectedShotId: null,
  activeView: 'concept',
  activePanelTab: 'prompt',
  showSettings: false,

  addShot: () => set(state => {
    const newShot = createDefaultShot(state.shots.length + 1);
    return { shots: [...state.shots, newShot], selectedShotId: newShot.id };
  }),

  removeShot: (id) => set(state => {
    const filtered = state.shots.filter(s => s.id !== id);
    const renumbered = filtered.map((s, i) => ({ ...s, number: i + 1 }));
    return {
      shots: renumbered,
      selectedShotId: state.selectedShotId === id ? null : state.selectedShotId,
    };
  }),

  duplicateShot: (id) => set(state => {
    const idx = state.shots.findIndex(s => s.id === id);
    if (idx === -1) return state;
    const original = state.shots[idx];
    const copy: Shot = {
      ...original,
      id: generateId(),
      number: state.shots.length + 1,
      imageUrl: null,
    };
    const newShots = [...state.shots];
    newShots.splice(idx + 1, 0, copy);
    const renumbered = newShots.map((s, i) => ({ ...s, number: i + 1 }));
    return { shots: renumbered, selectedShotId: copy.id };
  }),

  updateShot: (id, updates) => set(state => ({
    shots: state.shots.map(s => s.id === id ? { ...s, ...updates } : s),
  })),

  selectShot: (id) => set({ selectedShotId: id }),

  reorderShots: (fromIndex, toIndex) => set(state => {
    const newShots = [...state.shots];
    const [removed] = newShots.splice(fromIndex, 1);
    newShots.splice(toIndex, 0, removed);
    const renumbered = newShots.map((s, i) => ({ ...s, number: i + 1 }));
    return { shots: renumbered };
  }),

  toggleCameraMovement: (shotId, movementId) => set(state => ({
    shots: state.shots.map(s => {
      if (s.id !== shotId) return s;
      const has = s.cameraMovements.includes(movementId);
      return {
        ...s,
        cameraMovements: has
          ? s.cameraMovements.filter(m => m !== movementId)
          : [...s.cameraMovements, movementId],
      };
    }),
  })),

  setActiveView: (view) => set({ activeView: view }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
  setShowSettings: (show) => set({ showSettings: show }),

  getSelectedShot: () => {
    const state = get();
    return state.shots.find(s => s.id === state.selectedShotId);
  },
}));
