// ========================================
// Storyboard Types
// ========================================

export interface Shot {
  id: string;
  number: number;
  description: string;
  prompt: string;
  cameraMovements: string[];
  transition: TransitionType;
  duration: number; // seconds
  imageUrl: string | null;
  mood: string;
  lighting: string;
  subject: string;
  action: string;
  scene: string;
  audioNote: string;
}

export type TransitionType = 
  | 'continue'      // 接着拍
  | 'last-frame'    // 尾帧接力
  | 'hard-cut'      // 硬切
  | 'soft-cut'      // 软切
  | 'fade'          // 淡入淡出
  | 'dissolve';     // 溶解

export interface Scene {
  id: string;
  name: string;
  shots: string[]; // shot IDs
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  scenes: Scene[];
}

// ========================================
// Camera Movement Types
// ========================================

export interface CameraMovement {
  id: string;
  name: string;
  nameEN: string;
  description: string;
  category: CameraCategory;
  level: 1 | 2 | 3;
  prompt: string;
}

export type CameraCategory = 
  | 'push'       // 推
  | 'pull'       // 拉
  | 'pan'        // 摇
  | 'tilt'       // 俯仰
  | 'dolly'      // 移
  | 'crane'      // 升降
  | 'rotate'     // 旋转
  | 'zoom'       // 变焦
  | 'track'      // 跟踪
  | 'handheld'   // 手持
  | 'steadicam'  // 稳定器
  | 'aerial'     // 航拍
  | 'combined'   // 组合
  | 'master';    // 大师

// ========================================
// AI Provider Types
// ========================================

export interface AIProvider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  apiKey: string;
  models: AIModel[];
  enabled: boolean;
  icon: string;
  color: string;
}

export type ProviderType = 
  | 'kie'
  | 'grsai'
  | 'deepseek'
  | 'runninghub'
  | 't8star'
  | 'openai-compatible'
  | 'custom';

export interface AIModel {
  id: string;
  name: string;
  type: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'chat';
  providerId: string;
}

// ========================================
// Generation Types
// ========================================

export interface GenerationTask {
  id: string;
  shotId: string;
  prompt: string;
  provider: string;
  model: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  resultUrl: string | null;
  error: string | null;
  createdAt: string;
}

// ========================================
// Panel Types
// ========================================

export type PanelTab = 'prompt' | 'generate' | 'settings';
export type SidebarView = 
  | 'concept'      // Step 1: 构思主题
  | 'script'       // Step 2: 写剧本
  | 'materials'    // Step 3: 生成素材
  | 'imageGen'     // Step 4: 生图 (文生图)
  | 'storyboard'   // Step 5: 写分镜
  | 'videoGen'     // Step 6: 生成视频
  | 'settings';

// Workflow step metadata
export interface WorkflowStep {
  id: SidebarView;
  number: number;
  label: string;
  labelEN: string;
  icon: string;
  description: string;
  tools: string;
  color: string;
}
