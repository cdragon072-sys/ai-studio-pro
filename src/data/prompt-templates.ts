import type { Shot } from '../types';
import { getMovementById } from './camera-movements';
import { getTransition } from './transitions';

/**
 * Seedance 2.0 万能提示词模板引擎
 * 
 * 模板结构: [主体] + [动作] + [场景环境] + [运镜] + [光影] + [情绪氛围] + [音效提示]
 */

interface PromptParts {
  subject: string;
  action: string;
  scene: string;
  camera: string;
  lighting: string;
  mood: string;
  audio: string;
  transition: string;
}

export function buildPromptFromShot(shot: Shot): string {
  const parts: PromptParts = {
    subject: shot.subject || '',
    action: shot.action || '',
    scene: shot.scene || '',
    camera: buildCameraPrompt(shot.cameraMovements),
    lighting: shot.lighting || '',
    mood: shot.mood || '',
    audio: shot.audioNote || '',
    transition: buildTransitionPrompt(shot.transition),
  };

  return assemblePrompt(parts);
}

function buildCameraPrompt(movementIds: string[]): string {
  if (movementIds.length === 0) return '';

  const movements = movementIds
    .map(id => getMovementById(id))
    .filter(Boolean)
    .map(m => m!.prompt);

  if (movements.length === 0) return '';
  if (movements.length === 1) return movements[0];
  return movements.join(', transitioning to ');
}

function buildTransitionPrompt(transition: string): string {
  const t = getTransition(transition as any);
  return t ? t.prompt : '';
}

function assemblePrompt(parts: PromptParts): string {
  const segments: string[] = [];

  // 主体 + 动作
  if (parts.subject) {
    const subAndAction = parts.action 
      ? `${parts.subject} ${parts.action}`
      : parts.subject;
    segments.push(subAndAction);
  }

  // 场景
  if (parts.scene) {
    segments.push(`in ${parts.scene}`);
  }

  // 运镜
  if (parts.camera) {
    segments.push(parts.camera);
  }

  // 光影
  if (parts.lighting) {
    segments.push(parts.lighting);
  }

  // 情绪
  if (parts.mood) {
    segments.push(`${parts.mood} atmosphere`);
  }

  // 音效提示（作为补充描述）
  if (parts.audio) {
    segments.push(`with ${parts.audio}`);
  }

  return segments.join(', ') + '.';
}

// 预设提示词模板（按场景分类）
export const PROMPT_TEMPLATES = {
  dialogue: {
    name: '对话场景',
    template: '{character_a} talks to {character_b}, {emotion} expression, {scene}, medium shot, natural lighting, {mood} atmosphere',
  },
  action: {
    name: '动作场景',
    template: '{subject} {action}, dynamic pose, {scene}, {camera_movement}, dramatic lighting, intense atmosphere',
  },
  establishing: {
    name: '建立镜头',
    template: 'wide establishing shot of {scene}, {time_of_day}, {weather}, {mood} atmosphere, cinematic',
  },
  closeup: {
    name: '特写镜头',
    template: 'extreme close-up of {subject}, {detail}, shallow depth of field, {lighting}, {mood}',
  },
  transition_scene: {
    name: '过渡场景',
    template: '{scene} transitioning to {next_scene}, {time_lapse}, smooth {camera_movement}, ambient lighting',
  },
};
