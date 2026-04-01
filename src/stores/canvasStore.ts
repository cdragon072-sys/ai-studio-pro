import { create } from 'zustand';

// ============================================
// Types
// ============================================

export type NodeType = 'text' | 'image' | 'video' | 'storyboard' | 'upload';

export interface CanvasNodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  // Text node
  text?: string;
  textMode?: 'edit' | 'text2video' | 'img2prompt';
  // Image node
  imageUrl?: string;
  imageMode?: 'img2img' | 'img2video' | 'bg-replace' | 'first-frame';
  // Video node
  videoUrl?: string;
  videoMode?: 'text2video' | 'img-ref' | 'first-last-frame';
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  // Storyboard
  gridCols?: number;
  gridRows?: number;
  ratio?: string;
  gridImages?: (string | null)[];
  isEditingGrid?: boolean;
  // Generation
  prompt?: string;
  model?: string;
  status?: 'idle' | 'generating' | 'completed' | 'error';
  resultUrl?: string;
  error?: string;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromSide: 'left' | 'right';
  toSide: 'left' | 'right';
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  category: 'character' | 'scene' | 'object' | 'style' | 'other';
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  nodeId?: string;
}

export interface SavedWorkflow {
  id: string;
  name: string;
  nodes: CanvasNodeData[];
  connections: Connection[];
  createdAt: string;
}

// ============================================
// Store
// ============================================

interface CanvasState {
  // Viewport
  viewportX: number;
  viewportY: number;
  zoom: number;

  // Data
  nodes: CanvasNodeData[];
  connections: Connection[];
  selectedNodeId: string | null;
  connectingFrom: { nodeId: string; side: 'left' | 'right' } | null;

  // Panels
  showAddMenu: boolean;
  addMenuPosition: { x: number; y: number };
  showSettings: boolean;

  // Assets & History (persisted)
  assets: Asset[];
  history: HistoryItem[];
  workflows: SavedWorkflow[];

  // Viewport controls
  setViewport: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  panBy: (dx: number, dy: number) => void;
  zoomTo: (zoom: number, centerX: number, centerY: number) => void;
  fitToView: () => void;

  // Node operations
  addNode: (type: NodeType, x: number, y: number) => string;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<CanvasNodeData>) => void;
  moveNode: (id: string, x: number, y: number) => void;
  selectNode: (id: string | null) => void;
  duplicateNode: (id: string) => void;

  // Connection operations
  startConnection: (nodeId: string, side: 'left' | 'right') => void;
  endConnection: (nodeId: string, side: 'left' | 'right') => void;
  cancelConnection: () => void;
  removeConnection: (id: string) => void;
  getConnectedNodes: (nodeId: string, side: 'left' | 'right') => CanvasNodeData[];

  // Menu
  openAddMenu: (x: number, y: number) => void;
  closeAddMenu: () => void;
  setShowSettings: (show: boolean) => void;

  // Assets
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  removeAsset: (id: string) => void;

  // History
  addHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  clearHistory: (type?: 'image' | 'video') => void;

  // Workflows
  saveWorkflow: (name: string) => void;
  loadWorkflow: (id: string) => void;
  deleteWorkflow: (id: string) => void;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

function genId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const DEFAULT_SIZES: Record<NodeType, { w: number; h: number }> = {
  text: { w: 280, h: 180 },
  image: { w: 300, h: 240 },
  video: { w: 320, h: 260 },
  storyboard: { w: 520, h: 380 },
  upload: { w: 200, h: 160 },
};

const LABELS: Record<NodeType, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  storyboard: '分镜格子',
  upload: 'Upload',
};

// IndexedDB helpers
const DB_NAME = 'ai-studio-canvas';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveState(key: string, value: any) {
  try {
    const db = await openDB();
    const tx = db.transaction('state', 'readwrite');
    tx.objectStore('state').put(value, key);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch (e) { console.warn('IndexedDB save failed:', e); }
}

async function loadState(key: string): Promise<any> {
  try {
    const db = await openDB();
    const tx = db.transaction('state', 'readonly');
    const req = tx.objectStore('state').get(key);
    return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
  } catch (e) { console.warn('IndexedDB load failed:', e); return undefined; }
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  viewportX: 0,
  viewportY: 0,
  zoom: 1,
  nodes: [],
  connections: [],
  selectedNodeId: null,
  connectingFrom: null,
  showAddMenu: false,
  addMenuPosition: { x: 0, y: 0 },
  showSettings: false,
  assets: [],
  history: [],
  workflows: [],

  // Viewport
  setViewport: (x, y) => set({ viewportX: x, viewportY: y }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  panBy: (dx, dy) => set(s => ({ viewportX: s.viewportX + dx, viewportY: s.viewportY + dy })),
  zoomTo: (newZoom, cx, cy) => {
    const z = Math.max(0.1, Math.min(3, newZoom));
    const s = get();
    const scale = z / s.zoom;
    set({
      zoom: z,
      viewportX: cx - (cx - s.viewportX) * scale,
      viewportY: cy - (cy - s.viewportY) * scale,
    });
  },
  fitToView: () => {
    const { nodes } = get();
    if (nodes.length === 0) { set({ viewportX: 0, viewportY: 0, zoom: 1 }); return; }
    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));
    const w = maxX - minX + 200;
    const h = maxY - minY + 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const zoom = Math.min(vw / w, vh / h, 1.5);
    set({
      zoom,
      viewportX: (vw - w * zoom) / 2 - minX * zoom + 100 * zoom,
      viewportY: (vh - h * zoom) / 2 - minY * zoom + 100 * zoom,
    });
  },

  // Nodes
  addNode: (type, x, y) => {
    const id = genId();
    const size = DEFAULT_SIZES[type];
    const node: CanvasNodeData = {
      id,
      type,
      x, y,
      width: size.w,
      height: size.h,
      label: LABELS[type],
      ...(type === 'storyboard' ? { gridCols: 3, gridRows: 3, ratio: '16:9', gridImages: Array(9).fill(null) } : {}),
    };
    set(s => ({ nodes: [...s.nodes, node] }));
    get().saveToStorage();
    return id;
  },

  removeNode: (id) => set(s => ({
    nodes: s.nodes.filter(n => n.id !== id),
    connections: s.connections.filter(c => c.fromNodeId !== id && c.toNodeId !== id),
    selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
  })),

  updateNode: (id, updates) => {
    set(s => ({
      nodes: s.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
    }));
    get().saveToStorage();
  },

  moveNode: (id, x, y) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, x, y } : n),
  })),

  selectNode: (id) => set({ selectedNodeId: id }),

  duplicateNode: (id) => {
    const node = get().nodes.find(n => n.id === id);
    if (!node) return;
    const newId = genId();
    set(s => ({
      nodes: [...s.nodes, { ...node, id: newId, x: node.x + 40, y: node.y + 40 }],
    }));
  },

  // Connections
  startConnection: (nodeId, side) => set({ connectingFrom: { nodeId, side } }),

  endConnection: (nodeId, side) => {
    const { connectingFrom } = get();
    if (!connectingFrom || connectingFrom.nodeId === nodeId) {
      set({ connectingFrom: null });
      return;
    }
    const id = genId();
    const conn: Connection = {
      id,
      fromNodeId: connectingFrom.nodeId,
      toNodeId: nodeId,
      fromSide: connectingFrom.side,
      toSide: side,
    };
    // Avoid duplicate
    const exists = get().connections.some(
      c => c.fromNodeId === conn.fromNodeId && c.toNodeId === conn.toNodeId
    );
    if (!exists) {
      set(s => ({ connections: [...s.connections, conn], connectingFrom: null }));
      get().saveToStorage();
    } else {
      set({ connectingFrom: null });
    }
  },

  cancelConnection: () => set({ connectingFrom: null }),

  removeConnection: (id) => set(s => ({
    connections: s.connections.filter(c => c.id !== id),
  })),

  getConnectedNodes: (nodeId, side) => {
    const s = get();
    const connIds = s.connections
      .filter(c => (side === 'right' ? c.fromNodeId === nodeId : c.toNodeId === nodeId))
      .map(c => side === 'right' ? c.toNodeId : c.fromNodeId);
    return s.nodes.filter(n => connIds.includes(n.id));
  },

  // Menu
  openAddMenu: (x, y) => set({ showAddMenu: true, addMenuPosition: { x, y } }),
  closeAddMenu: () => set({ showAddMenu: false }),
  setShowSettings: (show) => set({ showSettings: show }),

  // Assets
  addAsset: (asset) => {
    set(s => ({
      assets: [{ ...asset, id: genId(), createdAt: new Date().toISOString() }, ...s.assets],
    }));
    get().saveToStorage();
  },
  removeAsset: (id) => {
    set(s => ({ assets: s.assets.filter(a => a.id !== id) }));
    get().saveToStorage();
  },

  // History
  addHistory: (item) => {
    set(s => ({
      history: [{ ...item, id: genId(), createdAt: new Date().toISOString() }, ...s.history].slice(0, 100),
    }));
    get().saveToStorage();
  },
  clearHistory: (type) => {
    set(s => ({
      history: type ? s.history.filter(h => h.type !== type) : [],
    }));
    get().saveToStorage();
  },

  // Workflows
  saveWorkflow: (name) => {
    const s = get();
    const wf: SavedWorkflow = {
      id: genId(),
      name,
      nodes: s.nodes,
      connections: s.connections,
      createdAt: new Date().toISOString(),
    };
    set(prev => ({ workflows: [wf, ...prev.workflows] }));
    get().saveToStorage();
  },

  loadWorkflow: (id) => {
    const wf = get().workflows.find(w => w.id === id);
    if (wf) {
      set({ nodes: wf.nodes, connections: wf.connections, selectedNodeId: null });
      get().fitToView();
      get().saveToStorage();
    }
  },

  deleteWorkflow: (id) => {
    set(s => ({ workflows: s.workflows.filter(w => w.id !== id) }));
    get().saveToStorage();
  },

  // Persistence
  saveToStorage: () => {
    const s = get();
    const data = {
      nodes: s.nodes,
      connections: s.connections,
      assets: s.assets,
      history: s.history,
      workflows: s.workflows,
    };
    saveState('canvas', data);
  },

  loadFromStorage: async () => {
    const data = await loadState('canvas');
    if (data) {
      set({
        nodes: data.nodes || [],
        connections: data.connections || [],
        assets: data.assets || [],
        history: data.history || [],
        workflows: data.workflows || [],
      });
    }
  },
}));
