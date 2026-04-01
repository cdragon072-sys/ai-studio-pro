import type { TransitionType } from '../types';

export const TRANSITIONS: { value: TransitionType; label: string; description: string; prompt: string }[] = [
  { value: 'continue', label: '接着拍', description: '从上一帧自然延续', prompt: 'continuous shot from the previous scene' },
  { value: 'last-frame', label: '尾帧接力', description: '以上一镜头的最后一帧作为起始', prompt: 'starting from the last frame of the previous shot' },
  { value: 'hard-cut', label: '硬切', description: '直接切换到下一镜头', prompt: 'hard cut to a new scene' },
  { value: 'soft-cut', label: '软切', description: '柔和过渡到下一镜头', prompt: 'smooth transition to the next scene' },
  { value: 'fade', label: '淡入淡出', description: '通过黑场淡入淡出', prompt: 'fade to black then fade in' },
  { value: 'dissolve', label: '溶解', description: '两个画面叠化过渡', prompt: 'cross dissolve between scenes' },
];

export function getTransition(type: TransitionType) {
  return TRANSITIONS.find(t => t.value === type);
}
