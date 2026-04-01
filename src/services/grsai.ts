/**
 * GRS AI 全接口适配器
 * 
 * 支持:
 * - GPT-Image API (/v1/draw/completions)
 * - Nano Banana API (/v1/draw/nano-banana)
 * - Sora-2 Video API (/v1/video/sora-video) 
 * - Veo API (/v1/video/veo)
 * - ComfyUI API (ComfyUI-GrsAI plugin)
 * - OSS Storage
 * - 通用结果查询 (/v1/draw/result)
 */

import { apiRequest, pollTaskResult, type ApiClientConfig, type TaskPollResult } from './api-client';

// ========================================
// GRS AI 节点配置
// ========================================

export const GRSAI_NODES = {
  overseas: { label: '海外节点', url: import.meta.env.DEV ? '/proxy/grsai' : 'https://grsaiapi.com' },
  domestic: { label: '国内节点', url: import.meta.env.DEV ? '/proxy/grsai-cn' : 'https://grsai.dakka.com.cn' },
} as const;

export type GrsaiNode = keyof typeof GRSAI_NODES;

// ========================================
// GPT-Image API
// ========================================

export interface GptImageParams {
  model: string; // 'sora-image' | 'gpt-image-1'
  prompt: string;
  size?: string; // '1:1' | '2:3' | '3:2' | '1K' | '2K'
  variants?: number; // 生成数量
  urls?: string[]; // 参考/编辑图片 URLs
  webHook?: string;
}

export async function grsaiGenerateImage(
  config: ApiClientConfig,
  params: GptImageParams,
  onProgress?: (progress: number, status: string) => void
): Promise<TaskPollResult> {
  const result = await apiRequest(config, '/v1/draw/completions', {
    model: params.model,
    prompt: params.prompt,
    size: params.size || '1:1',
    variants: params.variants || 1,
    urls: params.urls,
    webHook: params.webHook,
  });

  if (!result.success || !result.data?.id) {
    return { status: 'failed', error: result.error || 'Failed to submit task' };
  }

  return pollTaskResult(config, result.data.id, onProgress);
}

// ========================================
// Nano Banana API
// ========================================

export interface NanoBananaParams {
  model: string; // 'nano-banana-fast' | 'nano-banana-pro'
  prompt: string;
  urls?: string[]; // 参考图片 URLs
  size?: string; // '1K'
  aspectRatio?: string; // 'auto' | '1:1' | '16:9' | '9:16'
}

export async function grsaiNanoBanana(
  config: ApiClientConfig,
  params: NanoBananaParams,
  onProgress?: (progress: number, status: string) => void
): Promise<TaskPollResult> {
  const result = await apiRequest(config, '/v1/draw/nano-banana', {
    model: params.model,
    prompt: params.prompt,
    urls: params.urls,
    size: params.size,
    aspectRatio: params.aspectRatio || 'auto',
  });

  if (!result.success || !result.data?.id) {
    return { status: 'failed', error: result.error || 'Failed to submit task' };
  }

  return pollTaskResult(config, result.data.id, onProgress);
}

// ========================================
// Sora-2 Video API
// ========================================

export interface Sora2Params {
  model: string; // 'sora-2'
  prompt: string;
  url?: string; // 参考图片/视频 URL (图生视频)
  aspectRatio?: string; // '9:16' | '16:9'
  duration?: number; // 10 | 15
  size?: string; // 'small' | 'large'
  webHook?: string;
}

export interface Sora2CharacterUpload {
  name: string;
  imageUrl: string;
}

export async function grsaiSora2Video(
  config: ApiClientConfig,
  params: Sora2Params,
  onProgress?: (progress: number, status: string) => void
): Promise<TaskPollResult> {
  const result = await apiRequest(config, '/v1/video/sora-video', {
    model: params.model || 'sora-2',
    prompt: params.prompt,
    url: params.url,
    aspectRatio: params.aspectRatio || '16:9',
    duration: params.duration || 10,
    size: params.size || 'small',
    webHook: params.webHook,
  });

  if (!result.success || !result.data?.id) {
    return { status: 'failed', error: result.error || 'Failed to submit task' };
  }

  return pollTaskResult(config, result.data.id, onProgress, 180, 5000); // 视频需要更长轮询
}

export async function grsaiUploadCharacter(
  config: ApiClientConfig,
  character: Sora2CharacterUpload
): Promise<{ success: boolean; characterId?: string; error?: string }> {
  const result = await apiRequest(config, '/v1/video/sora-upload-character', {
    name: character.name,
    imageUrl: character.imageUrl,
  });

  if (!result.success) return { success: false, error: result.error };
  return { success: true, characterId: result.data?.characterId || result.data?.id };
}

// ========================================
// Veo API
// ========================================

export interface VeoParams {
  model: string; // 'veo3.1-fast' | 'veo3.1-pro'
  prompt: string;
  firstFrameUrl?: string; // 首帧参考
  lastFrameUrl?: string; // 尾帧参考
  aspectRatio?: string; // '16:9' | '9:16'
}

export async function grsaiVeoVideo(
  config: ApiClientConfig,
  params: VeoParams,
  onProgress?: (progress: number, status: string) => void
): Promise<TaskPollResult> {
  const result = await apiRequest(config, '/v1/video/veo', {
    model: params.model || 'veo3.1-fast',
    prompt: params.prompt,
    firstFrameUrl: params.firstFrameUrl,
    lastFrameUrl: params.lastFrameUrl,
    aspectRatio: params.aspectRatio || '16:9',
  });

  if (!result.success || !result.data?.id) {
    return { status: 'failed', error: result.error || 'Failed to submit task' };
  }

  return pollTaskResult(config, result.data.id, onProgress, 180, 5000);
}

// ========================================
// ComfyUI API (通过 GRS AI 代理)
// ========================================

export interface ComfyUIParams {
  workflow: Record<string, any>; // ComfyUI 工作流 JSON
  inputs?: Record<string, any>; // 动态输入参数
}

export async function grsaiComfyUI(
  config: ApiClientConfig,
  params: ComfyUIParams,
  onProgress?: (progress: number, status: string) => void
): Promise<TaskPollResult> {
  const result = await apiRequest(config, '/v1/comfyui/run', {
    workflow: params.workflow,
    inputs: params.inputs,
  });

  if (!result.success || !result.data?.id) {
    return { status: 'failed', error: result.error || 'Failed to submit ComfyUI task' };
  }

  return pollTaskResult(config, result.data.id, onProgress, 300, 5000);
}

// ========================================
// GRS AI 所有模型定义
// ========================================

export const GRSAI_MODELS = {
  image: [
    { id: 'sora-image', name: 'Sora Image', desc: 'OpenAI Sora 图片生成', badge: 'OpenAI' },
    { id: 'gpt-image-1.5', name: 'GPT Image 1.5', desc: 'GPT 图片生成 v1.5', badge: 'GPT' },
    { id: 'nano-banana-fast', name: 'Nano Banana Fast', desc: '快速图片生成', badge: '快速' },
    { id: 'nano-banana-pro', name: 'Nano Banana Pro', desc: '高质量图片生成', badge: '高质量' },
    { id: 'nano-banana-2', name: 'Nano Banana 2', desc: '新一代图片生成', badge: 'NEW' },
    { id: 'nano-banana-pro-vt', name: 'Nano Banana Pro VT', desc: 'VT增强版', badge: 'VT' },
  ],
  video: [
    { id: 'sora-2', name: 'Sora 2', desc: 'OpenAI Sora 2 视频, 支持角色上传', badge: 'OpenAI' },
    { id: 'veo3.1-fast', name: 'Veo 3.1 Fast', desc: 'Google Veo 快速版', badge: '快速' },
    { id: 'veo3.1-pro', name: 'Veo 3.1 Pro', desc: 'Google Veo 专业版', badge: '高质量' },
    { id: 'veo3.1-fast-1080p', name: 'Veo 3.1 Fast 1080p', desc: '1080p 高清', badge: '1080p' },
    { id: 'veo3.1-pro-1080p', name: 'Veo 3.1 Pro 1080p', desc: '1080p 专业版', badge: '1080p' },
    { id: 'veo3.1-fast-4k', name: 'Veo 3.1 Fast 4K', desc: '4K 超高清', badge: '4K' },
    { id: 'veo3.1-pro-4k', name: 'Veo 3.1 Pro 4K', desc: '4K 专业版', badge: '4K' },
  ],
  chat: [
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', desc: '最新 Gemini', badge: 'NEW' },
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro', desc: 'Gemini 3', badge: 'Google' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Gemini 2.5', badge: 'Google' },
  ],
} as const;

