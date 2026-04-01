import type { WorkflowStep } from '../types';

/**
 * 完整的 6 步 AI 视频制作工作流
 * 参考：构思主题 → 写剧本 → 生成素材 → 生图 → 写分镜 → 生成视频
 */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'concept',
    number: 1,
    label: '构思主题',
    labelEN: 'Concept',
    icon: '💡',
    description: '主题与概念：确定核心想法、目标受众与风格',
    tools: 'AI 辅助头脑风暴',
    color: '#f59e0b',
  },
  {
    id: 'script',
    number: 2,
    label: '写剧本',
    labelEN: 'Script',
    icon: '📝',
    description: '剧本文案撰写：创作故事结构、对话与场景描述',
    tools: 'Claude Code / DeepSeek',
    color: '#3b82f6',
  },
  {
    id: 'materials',
    number: 3,
    label: '生成素材',
    labelEN: 'Materials',
    icon: '🎨',
    description: 'AI 生成核心素材：提示词、声音、音乐',
    tools: 'AI 素材生成器',
    color: '#10b981',
  },
  {
    id: 'imageGen',
    number: 4,
    label: '生图',
    labelEN: 'Text-to-Image',
    icon: '🖼️',
    description: 'AI 生成静态图像/场景：根据脚本生提示词，使用 AI 生图',
    tools: 'Seedream / Flux / MJ / SD',
    color: '#8b5cf6',
  },
  {
    id: 'storyboard',
    number: 5,
    label: '写分镜',
    labelEN: 'Storyboard',
    icon: '🎬',
    description: '视频分镜设计：规划画面序列、镜头语言、转场效果',
    tools: 'Seedance 分镜画布',
    color: '#06b6d4',
  },
  {
    id: 'videoGen',
    number: 6,
    label: '生成视频',
    labelEN: 'Video Gen',
    icon: '🎥',
    description: '图生视频/文生视频：将图像与文本转化为动态视频',
    tools: 'Seedance / 可灵 / Runway / Sora',
    color: '#f43f5e',
  },
];

export function getStepByView(view: string): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find(s => s.id === view);
}
