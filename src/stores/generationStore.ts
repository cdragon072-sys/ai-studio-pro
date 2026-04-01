import { create } from 'zustand';
import type { AIProvider, GenerationTask } from '../types';
import { GRSAI_NODES } from '../services/grsai';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

interface GenerationState {
  providers: AIProvider[];
  activeProviderId: string | null;
  tasks: GenerationTask[];
  grsaiNode: 'overseas' | 'domestic'; // GRS AI 节点选择

  addProvider: (provider: Omit<AIProvider, 'id'>) => void;
  updateProvider: (id: string, updates: Partial<AIProvider>) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string | null) => void;
  setGrsaiNode: (node: 'overseas' | 'domestic') => void;
  getGrsaiBaseUrl: () => string;

  addTask: (task: Omit<GenerationTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<GenerationTask>) => void;
  removeTask: (id: string) => void;

  generateImage: (shotId: string, prompt: string) => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  providers: [
    {
      id: 'kie-default',
      name: 'KIE AI',
      type: 'kie',
      baseUrl: 'https://api.kie.ai',
      apiKey: '',
      models: [
        { id: 'seedream-5-lite', name: 'Seedream 5.0 Lite', type: 'text-to-image', providerId: 'kie-default' },
        { id: 'seedream-4.5', name: 'Seedream 4.5', type: 'text-to-image', providerId: 'kie-default' },
        { id: 'gpt-image-1.5', name: 'GPT Image 1.5', type: 'text-to-image', providerId: 'kie-default' },
        { id: 'flux-2-pro', name: 'Flux-2 Pro', type: 'text-to-image', providerId: 'kie-default' },
        { id: 'ideogram-v3', name: 'Ideogram V3', type: 'text-to-image', providerId: 'kie-default' },
        { id: 'kie-seedance-i2v', name: 'Seedance 图生视频', type: 'image-to-video', providerId: 'kie-default' },
        { id: 'kie-kling-i2v', name: '可灵 图生视频', type: 'image-to-video', providerId: 'kie-default' },
        { id: 'kie-wan-2.1', name: 'Wan 2.1 视频', type: 'text-to-video', providerId: 'kie-default' },
        { id: 'kie-hailuo', name: '海螺视频', type: 'text-to-video', providerId: 'kie-default' },
      ],
      enabled: true,
      icon: 'K',
      color: '#8b5cf6',
    },
    {
      id: 'grsai-default',
      name: 'GRS AI',
      type: 'grsai',
      baseUrl: GRSAI_NODES.overseas.url,
      apiKey: '',
      models: [
        // Chat (Gemini)
        { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', type: 'chat', providerId: 'grsai-default' },
        { id: 'gemini-3-pro', name: 'Gemini 3 Pro', type: 'chat', providerId: 'grsai-default' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'chat', providerId: 'grsai-default' },
        // 生图 - GPT Image API
        { id: 'sora-image', name: 'Sora Image', type: 'text-to-image', providerId: 'grsai-default' },
        { id: 'gpt-image-1.5', name: 'GPT Image 1.5', type: 'text-to-image', providerId: 'grsai-default' },
        // 生图 - Nano Banana API
        { id: 'nano-banana-fast', name: 'Nano Banana Fast', type: 'text-to-image', providerId: 'grsai-default' },
        { id: 'nano-banana-pro', name: 'Nano Banana Pro', type: 'text-to-image', providerId: 'grsai-default' },
        { id: 'nano-banana-2', name: 'Nano Banana 2', type: 'text-to-image', providerId: 'grsai-default' },
        { id: 'nano-banana-pro-vt', name: 'Nano Banana Pro VT', type: 'text-to-image', providerId: 'grsai-default' },
        // 视频 - Sora-2 API
        { id: 'sora-2', name: 'Sora 2 视频', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'sora-2', name: 'Sora 2 图生视频', type: 'image-to-video', providerId: 'grsai-default' },
        // 视频 - Veo API
        { id: 'veo3.1-fast', name: 'Veo 3.1 Fast', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'veo3.1-pro', name: 'Veo 3.1 Pro', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'veo3.1-fast-1080p', name: 'Veo 3.1 Fast 1080p', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'veo3.1-pro-1080p', name: 'Veo 3.1 Pro 1080p', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'veo3.1-fast-4k', name: 'Veo 3.1 Fast 4K', type: 'text-to-video', providerId: 'grsai-default' },
        { id: 'veo3.1-pro-4k', name: 'Veo 3.1 Pro 4K', type: 'text-to-video', providerId: 'grsai-default' },
      ],
      enabled: true,
      icon: 'G',
      color: '#3b82f6',
    },
    {
      id: 'deepseek-default',
      name: 'DeepSeek',
      type: 'deepseek',
      baseUrl: 'https://api.deepseek.com',
      apiKey: '',
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat (V3.2)', type: 'chat', providerId: 'deepseek-default' },
        { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', type: 'chat', providerId: 'deepseek-default' },
      ],
      enabled: true,
      icon: 'D',
      color: '#06b6d4',
    },
    {
      id: 'runninghub-default',
      name: 'RunningHub',
      type: 'runninghub',
      baseUrl: 'https://www.runninghub.cn',
      apiKey: '',
      models: [
        { id: 'rh-seedance-i2v', name: 'Seedance 图生视频', type: 'image-to-video', providerId: 'runninghub-default' },
        { id: 'rh-kling-i2v', name: '可灵 图生视频', type: 'image-to-video', providerId: 'runninghub-default' },
        { id: 'rh-seedream-t2i', name: 'Seedream 文生图', type: 'text-to-image', providerId: 'runninghub-default' },
        { id: 'rh-comfyui', name: 'ComfyUI 工作流', type: 'text-to-image', providerId: 'runninghub-default' },
      ],
      enabled: true,
      icon: 'R',
      color: '#10b981',
    },
    {
      id: 't8star-default',
      name: 'T8 Star',
      type: 't8star',
      baseUrl: 'https://ai.t8star.cn/v1',
      apiKey: '',
      models: [
        { id: 't8-chat', name: 'Chat (多模型)', type: 'chat', providerId: 't8star-default' },
        { id: 't8-image', name: '图片生成', type: 'text-to-image', providerId: 't8star-default' },
        { id: 't8-sora-2', name: 'Sora 2 视频', type: 'text-to-video', providerId: 't8star-default' },
      ],
      enabled: true,
      icon: 'T',
      color: '#f59e0b',
    },
  ],
  activeProviderId: 'grsai-default',
  tasks: [],
  grsaiNode: 'overseas',

  addProvider: (provider) => set(state => ({
    providers: [...state.providers, { ...provider, id: generateId() }],
  })),

  updateProvider: (id, updates) => set(state => ({
    providers: state.providers.map(p => p.id === id ? { ...p, ...updates } : p),
  })),

  removeProvider: (id) => set(state => ({
    providers: state.providers.filter(p => p.id !== id),
    activeProviderId: state.activeProviderId === id ? null : state.activeProviderId,
  })),

  setActiveProvider: (id) => set({ activeProviderId: id }),

  setGrsaiNode: (node) => set(state => ({
    grsaiNode: node,
    providers: state.providers.map(p =>
      p.type === 'grsai' ? { ...p, baseUrl: GRSAI_NODES[node].url } : p
    ),
  })),

  getGrsaiBaseUrl: () => {
    const state = get();
    return GRSAI_NODES[state.grsaiNode].url;
  },

  addTask: (task) => set(state => ({
    tasks: [{ ...task, id: generateId(), createdAt: new Date().toISOString() }, ...state.tasks],
  })),

  updateTask: (id, updates) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
  })),

  removeTask: (id) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== id),
  })),

  generateImage: async (shotId: string, prompt: string) => {
    const state = get();
    const provider = state.providers.find(p => p.id === state.activeProviderId);
    if (!provider) return;

    const taskId = generateId();
    set(s => ({
      tasks: [{
        id: taskId,
        shotId,
        prompt,
        provider: provider.name,
        model: provider.models.find(m => m.type === 'text-to-image')?.name || 'default',
        status: 'queued',
        progress: 0,
        resultUrl: null,
        error: null,
        createdAt: new Date().toISOString(),
      }, ...s.tasks],
    }));

    // Check if API key is configured
    if (!provider.apiKey) {
      // Demo mode - simulate generation
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: 'running' as const, progress: 10 } : t),
      }));

      for (let p = 20; p <= 90; p += 20) {
        await new Promise(r => setTimeout(r, 600));
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, progress: p } : t),
        }));
      }

      await new Promise(r => setTimeout(r, 800));
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? {
          ...t,
          status: 'completed' as const,
          progress: 100,
          resultUrl: `https://picsum.photos/seed/${shotId}/520/280`,
        } : t),
      }));
      return;
    }

    // Real API call
    try {
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: 'running' as const, progress: 5 } : t),
      }));

      // Use dynamic import to select correct API adapter
      const { apiRequest, pollTaskResult } = await import('../services/api-client');
      const config = { baseUrl: provider.baseUrl, apiKey: provider.apiKey };

      let endpoint = '/v1/draw/completions';
      const body: any = { model: provider.models[0]?.id, prompt };

      // GRS AI specific routing
      if (provider.type === 'grsai') {
        const imageModel = provider.models.find(m => m.type === 'text-to-image');
        if (imageModel?.id.startsWith('nano-banana')) {
          endpoint = '/v1/draw/nano-banana';
          body.model = imageModel.id;
          body.aspectRatio = 'auto';
        } else {
          body.model = imageModel?.id || 'sora-image';
          body.size = '1:1';
          body.variants = 1;
        }
      }

      const submitResult = await apiRequest(config, endpoint, body);
      if (!submitResult.success || !submitResult.data?.id) {
        throw new Error(submitResult.error || 'Failed to submit');
      }

      const pollResult = await pollTaskResult(
        config,
        submitResult.data.id,
        (progress, _status) => {
          set(s => ({
            tasks: s.tasks.map(t => t.id === taskId ? { ...t, progress, status: 'running' as const } : t),
          }));
        }
      );

      if (pollResult.status === 'completed') {
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? {
            ...t, status: 'completed' as const, progress: 100, resultUrl: pollResult.resultUrl || null,
          } : t),
        }));
      } else {
        throw new Error(pollResult.error || 'Generation failed');
      }
    } catch (err: any) {
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? {
          ...t, status: 'failed' as const, error: err.message,
        } : t),
      }));
    }
  },
}));
