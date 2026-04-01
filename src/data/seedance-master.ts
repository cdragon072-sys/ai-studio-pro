/**
 * Seedance 2.0 大师 AI 角色设定
 * 基于 Atlas Cloud 70+ 提示词库学习构建
 * 
 * 此模块定义了一个"视频生成提示词大师"AI 角色，
 * 用于辅助用户生成高质量的 Seedance 2.0 / 可灵 / Sora 兼容提示词
 */

// ========================================
// Seedance 2.0 大师 System Prompt
// ========================================

export const SEEDANCE_MASTER_SYSTEM_PROMPT = `你是"Seedance 大师"——一位顶级 AI 视频生成提示词专家。你深谙 Seedance 2.0、可灵(Kling)、Sora、Veo 等主流视频生成模型的提示词工程。

## 核心能力
1. **分镜剧本转化**: 将用户的故事概念或剧本文案，拆解为精确的分镜提示词序列
2. **专业运镜控制**: 精通 34 种运镜技法（推/拉/摇/移/降/升/跟/环/稳定器/无人机/手持...）
3. **多模态输入**: 支持 @图片/@视频/@音频 引用系统（Seedance 2.0 特有）
4. **角色一致性**: 通过首帧锁定、角色描述复用确保多镜头角色统一
5. **风格大师**: 能精准匹配 电影级/动漫/写实3D/水墨画/赛博朋克 等视觉风格

## 提示词结构公式
每个提示词应遵循:
**[镜头类型] + [主体描述] + [动作/事件] + [场景环境] + [运镜指令] + [光影/氛围] + [风格/质量标签]**

示例结构:
- "电影级特写, 一位穿着黑色风衣的年轻女性, 在雨中缓缓转身回望, 赛博朋克城市霓虹背景, 推镜头配合焦点切换, 逆光剪影效果搭配霓虹反射, 8K电影质感"

## 六大提示词类别 (基于70+验证案例)

### 1. 超逼真视频生成
核心技巧: 细节描写越具体越好。描述材质、光线反射、微小动作。
- 示例模式: "逼真的[材质]质感, [光照条件]下的[主体], [微动作描述], 8K超高清, 电影级色彩分级"

### 2. 角色与场景一致性
核心技巧: 使用@图片1锁定首帧角色外观,后续镜头保持描述统一。
- 多镜头模式: "@图片1 作为首帧, [角色名]保持相同外貌特征, [新动作/新场景]"
- 一镜到底模式: 将多个场景用逗号分隔,添加"一镜到底长镜头,无缝转场"

### 3. 高级运镜动作
- 推镜头(Push In): 增强紧张感和亲密感
- 拉镜头(Pull Out): 揭示全景,产生震撼感  
- 环绕(Orbit): 360度展示产品/角色
- 希区柯克变焦(Dolly Zoom): 制造不安和扭曲感
- 跟拍(Tracking Shot): 跟随运动主体
- 航拍(Drone Shot): 壮观的高空俯瞰

### 4. 创意视觉特效
核心技巧: 明确描述特效类型和过渡方式。
- 粒子特效: "金色粒子汇聚形成[目标物], 粒子在光线中闪烁"
- 风格融合: "[风格A]逐渐过渡到[风格B], 画面元素保持连贯"
- 变身/变形: "[起始状态]缓慢变化为[终态], 变化过程自然流畅"

### 5. 剧情发展与延伸
- 四镜头结构: 建立镜头→发展镜头→高潮镜头→结尾镜头
- 情绪曲线: 为每个镜头标注情绪(平静→紧张→爆发→释怀)

### 6. 音频与语音合成
- 音乐驱动: "@音频1 作为背景音乐, 视频节奏与音乐节拍同步"
- 对话驱动: 生成带有自然语音的角色对话场景

## 输出格式
用户提供概念后，你应输出:
1. **分镜序列**: 编号的镜头列表，每个包含完整提示词
2. **运镜建议**: 为每个镜头推荐最佳运镜
3. **时长估计**: 每个镜头建议时长(5-10秒)
4. **一致性标注**: 标注需要保持角色/场景一致的镜头组

## 特别注意
- 提示词必须用英文为主体(AI模型对英文理解更好),关键术语可附中文注释
- 避免模糊描述，每个元素都要具体化
- 善用"cinematic lighting" "8K" "film grain" "shallow depth of field"等质量标签
- 对于 Seedance 2.0: 善用 @引用系统 和 多模态输入`;

// ========================================
// 提示词模板库 (基于 Atlas Cloud 70+ 精选)
// ========================================

export interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  titleZh: string;
  prompt: string;
  tags: string[];
  difficulty: 'basic' | 'intermediate' | 'master';
  modalInputs?: string[]; // @图片, @视频, @音频
}

export const SEEDANCE_CATEGORIES = [
  { id: 'realistic', label: '超逼真视频', icon: '🎬', color: '#3b82f6' },
  { id: 'consistency', label: '角色一致性', icon: '👤', color: '#8b5cf6' },
  { id: 'camera', label: '高级运镜', icon: '🎥', color: '#06b6d4' },
  { id: 'vfx', label: '创意视觉特效', icon: '✨', color: '#f59e0b' },
  { id: 'narrative', label: '剧情发展', icon: '📖', color: '#10b981' },
  { id: 'audio', label: '音频驱动', icon: '🎵', color: '#f43f5e' },
];

export const SEEDANCE_PROMPT_LIBRARY: PromptTemplate[] = [
  // === 超逼真视频 ===
  {
    id: 'realistic-001',
    category: 'realistic',
    title: 'Elegant Laundry Scene',
    titleZh: '优雅的洗衣场景',
    prompt: 'A woman elegantly hanging clothes on a line, reaching into a basket to grab another garment, shaking it out naturally. Soft morning sunlight streaming through, creating warm shadows. Cinematic wide shot, shallow depth of field, 8K quality.',
    tags: ['日常场景', '自然光', '电影质感'],
    difficulty: 'basic',
  },
  {
    id: 'realistic-002',
    category: 'realistic',
    title: 'Burning Military Vehicle Aerial',
    titleZh: '燃烧军车城市航拍',
    prompt: 'Cinematic drone shot capturing the aftermath of urban combat. A burning military vehicle in a destroyed city street, smoke rising into an orange-tinted sky. Debris scattered across the road. Slow descending drone movement, IMAX quality, film grain, volumetric lighting.',
    tags: ['战争', '航拍', 'IMAX'],
    difficulty: 'master',
  },
  {
    id: 'realistic-003',
    category: 'realistic',
    title: 'Victorian Street Scene',
    titleZh: '维多利亚时代街景',
    prompt: 'A scene set in 19th century London. Horse-drawn carriages on cobblestone streets, gas lamps flickering, gentlemen in top hats walking past storefronts. Overcast sky, authentic period details. Steadicam tracking shot following a newspaper boy, cinematic color grading, 8K.',
    tags: ['古装', '历史', '跟拍'],
    difficulty: 'intermediate',
  },
  {
    id: 'realistic-004',
    category: 'realistic',
    title: 'IMAX Desert Sandstorm',
    titleZh: 'IMAX沙漠沙尘暴',
    prompt: 'IMAX format desert sandstorm scene, Denis Villeneuve aesthetic. Massive wall of sand approaching a lone figure. Multiple shot structure with timestamps. Wide establishing shot, then close-up of sand particles, extreme long shot of the figure consumed by the storm. Anamorphic lens flare, desaturated color palette.',
    tags: ['IMAX', '沙漠', '大师风格'],
    difficulty: 'master',
  },
  // === 角色一致性 ===
  {
    id: 'consistency-001',
    category: 'consistency',
    title: 'Multi-Scene Character Journey',
    titleZh: '下班回家路上',
    prompt: '@Image1 as first frame. A coherent narrative from office corridor to home. The same character maintains consistent appearance throughout - same jacket, hairstyle, and accessories. Emotional transition from tired to relaxed. Office hallway → subway → apartment entrance → living room. One continuous tracking shot.',
    tags: ['角色一致', '一镜到底', '情感转换'],
    difficulty: 'master',
    modalInputs: ['@图片1'],
  },
  {
    id: 'consistency-002',
    category: 'consistency',
    title: 'Luxury Handbag Ad',
    titleZh: '奢侈手袋广告',
    prompt: 'Product showcase maintaining detail consistency across multiple reference images. A luxury leather handbag rotated on a marble pedestal, golden stitching catching studio lights. Push-in revealing texture detail, orbit shot showing all angles. Brand-consistent color temperature, high-end commercial style.',
    tags: ['产品广告', '细节一致', '环绕镜头'],
    difficulty: 'intermediate',
  },
  {
    id: 'consistency-003',
    category: 'consistency',
    title: 'Multi-Shot Fight Scene',
    titleZh: '多镜头打斗场景',
    prompt: 'Intense martial arts fight between two women in a modern city environment. Using 3 reference images for character consistency. Shot 1: Wide establishing shot of both fighters facing off. Shot 2: Close-up of first punch exchanged. Shot 3: Dramatic slow-motion kick. Shot 4: Aftermath, both standing, breathing heavily. Maintain same costumes and face features throughout.',
    tags: ['动作', '角色一致', '多镜头'],
    difficulty: 'master',
    modalInputs: ['@图片1', '@图片2', '@图片3'],
  },
  // === 高级运镜 ===
  {
    id: 'camera-001',
    category: 'camera',
    title: 'Hitchcock Zoom in Elevator',
    titleZh: '电梯希区柯克变焦',
    prompt: 'Hitchcock dolly zoom effect in an elevator scene. A man standing alone as walls seem to stretch. Camera dollies in while simultaneously zooming out, creating classic vertigo disorientation. Fluorescent lighting flickering, tension building. Suspenseful atmosphere, psychological thriller aesthetic.',
    tags: ['希区柯克', 'Dolly Zoom', '悬疑'],
    difficulty: 'master',
  },
  {
    id: 'camera-002',
    category: 'camera',
    title: 'One-Take Seamless Transition',
    titleZh: '一镜到底无缝切换',
    prompt: 'Complex long take with multiple scene transitions maintaining visual coherence. Starting in a coffee shop, camera moves through a doorway into a forest, then seamlessly into an underwater scene, finally emerging in a galaxy. No cuts, continuous camera motion, creative transition effects between each environment.',
    tags: ['一镜到底', '转场', '创意'],
    difficulty: 'master',
  },
  {
    id: 'camera-003',
    category: 'camera',
    title: 'Car Commercial Cinematography',
    titleZh: '汽车广告运镜',
    prompt: 'Professional automotive commercial cinematography. A sleek sports car driving along coastal highway at golden hour. Low-angle tracking shot alongside the car, then drone rises to reveal the winding coastline. Lens flare from setting sun, paint reflections, motion blur on wheels. Premium commercial grade, 8K.',
    tags: ['汽车广告', '航拍', '黄金时刻'],
    difficulty: 'intermediate',
  },
  {
    id: 'camera-004',
    category: 'camera',
    title: 'Parkour Chase Long Take',
    titleZh: '跑酷追逐长镜头',
    prompt: 'First-person one-take parkour chase through urban environments. Running through narrow alleyways, vaulting over obstacles, sliding under barriers, leaping between rooftops. Handheld camera shake for realism, motion blur, heavy breathing audio. Transitioning between indoor and outdoor seamlessly.',
    tags: ['跑酷', '第一人称', '一镜到底'],
    difficulty: 'master',
    modalInputs: ['@音频1'],
  },
  // === 创意视觉特效 ===
  {
    id: 'vfx-001',
    category: 'vfx',
    title: 'Golden Particle Title Reveal',
    titleZh: '金色粒子标题揭示',
    prompt: 'Golden particles swirling and converging to form title text in mid-air. Particles catch light as they move, creating sparkling trails. Dark background for contrast. Camera slowly pushes in as the text materializes. Cinematic depth of field, volumetric lighting through particles.',
    tags: ['粒子特效', '标题', '品牌'],
    difficulty: 'intermediate',
  },
  {
    id: 'vfx-002',
    category: 'vfx',
    title: 'Magic Transformation Sequence',
    titleZh: '魔法变身序列',
    prompt: 'A character undergoing magical transformation. Starting as ordinary teenage girl in school uniform, progressively transforming with swirling magical energy. Clothes morphing into elaborate fantasy warrior armor, hair changing color, eyes glowing. 360-degree orbit shot during peak transformation. Particle effects, energy waves, lens flares.',
    tags: ['变身', '特效', '奇幻'],
    difficulty: 'master',
  },
  {
    id: 'vfx-003',
    category: 'vfx',
    title: 'Ink Wash Tai Chi',
    titleZh: '水墨风太极',
    prompt: 'Traditional Chinese ink wash painting style. A tai chi master performing fluid movements, body dissolving into ink strokes that flow across the frame. Black ink on white rice paper aesthetic. Slow, meditative pace. Camera slowly panning. Each movement leaves trailing ink marks in the air. Eastern philosophy mood.',
    tags: ['水墨画', '太极', '东方美学'],
    difficulty: 'master',
  },
  // === 剧情发展 ===
  {
    id: 'narrative-001',
    category: 'narrative',
    title: '4-Shot War Film Structure',
    titleZh: '4镜头战争电影',
    prompt: 'Shot 1 [0:00-0:15]: Wide establishing - Middle Eastern desert village, dust settling from recent battle. Shot 2 [0:15-0:30]: Medium shot - A squad of soldiers cautiously advancing through rubble, scanning for threats. Shot 3 [0:30-0:45]: Close-up - Team leader hand-signaling commands, sweat dripping. Shot 4 [0:45-1:00]: Epic wide - The squad silhouetted against smoke and sunset, taking defensive positions. Saving Private Ryan color grading.',
    tags: ['多镜头', '战争', '电影结构'],
    difficulty: 'master',
  },
  {
    id: 'narrative-002',
    category: 'narrative',
    title: 'Emotional Journey Video',
    titleZh: '情感旅程视频',
    prompt: 'Multi-scene emotional narrative. Scene 1: A young woman sits alone in a dimly lit room, melancholy expression, rain on window. Scene 2: She steps outside, rain stops, golden light breaking through clouds. Scene 3: Walking through a vibrant garden, slowly smiling. Scene 4: Reuniting with loved ones, warm embrace. Emotion curve: melancholy → hope → joy → love. Consistent character throughout.',
    tags: ['情感', '叙事', '情绪曲线'],
    difficulty: 'intermediate',
  },
  // === 音频驱动 ===
  {
    id: 'audio-001',
    category: 'audio',
    title: 'Fashion Beat Sync',
    titleZh: '时尚节拍卡点',
    prompt: '@Audio1 as background music. Fashion model outfit changes synced to beat drops. Each beat triggers a new outfit with flash transition effect. Urban street backdrop, confident walk. Dynamic push-pull camera moves matching rhythm. High contrast color grading, editorial fashion style.',
    tags: ['卡点', '时尚', '节拍同步'],
    difficulty: 'intermediate',
    modalInputs: ['@音频1'],
  },
  {
    id: 'audio-002',
    category: 'audio',
    title: 'Cinematic Road Trip MV',
    titleZh: '电影感公路旅行MV',
    prompt: '@Audio1 as soundtrack. Cinematic road trip music video. Sun-drenched landscapes, vintage car on empty highway, wind in hair. Camera mounted on car hood, sweeping drone shots of desert highways, golden hour reflections. Each verse transitions to new landscape. Film-like widescreen ratio, warm color grade.',
    tags: ['MV', '公路', '电影感'],
    difficulty: 'intermediate',
    modalInputs: ['@音频1'],
  },
];

// ========================================
// 快速提示词生成器
// ========================================

export interface PromptConfig {
  shotType: string;
  subject: string;
  action: string;
  scene: string;
  cameraMove: string;
  lighting: string;
  mood: string;
  style: string;
  quality: string;
}

export function generateMasterPrompt(config: PromptConfig): string {
  const parts: string[] = [];

  if (config.style) parts.push(config.style);
  if (config.shotType) parts.push(config.shotType);
  if (config.subject) parts.push(config.subject);
  if (config.action) parts.push(config.action);
  if (config.scene) parts.push(config.scene);
  if (config.cameraMove) parts.push(config.cameraMove);
  if (config.lighting) parts.push(config.lighting);
  if (config.mood) parts.push(`${config.mood} atmosphere`);
  if (config.quality) parts.push(config.quality);

  return parts.filter(Boolean).join(', ') + '.';
}

// 预设风格模板
export const STYLE_PRESETS = [
  { id: 'cinematic', label: '电影级', en: 'Cinematic film style, 8K, shallow depth of field, film grain' },
  { id: 'anime', label: '动漫风', en: 'Anime style, vibrant colors, cel shading, Studio Ghibli aesthetic' },
  { id: 'realistic-3d', label: '写实3D', en: 'Photorealistic 3D rendering, ray tracing, ultra detailed' },
  { id: 'ink-wash', label: '水墨画', en: 'Chinese ink wash painting, flowing brushstrokes, minimalist' },
  { id: 'cyberpunk', label: '赛博朋克', en: 'Cyberpunk aesthetic, neon lights, rain-slicked streets, high contrast' },
  { id: 'vintage-film', label: '复古胶片', en: 'Vintage 35mm film, warm tones, soft focus, nostalgic' },
  { id: 'noir', label: '黑色电影', en: 'Film noir, high contrast black and white, dramatic shadows, venetian blinds' },
  { id: 'commercial', label: '商业广告', en: 'Premium commercial grade, clean lighting, brand-consistent, high-end production value' },
];

// 镜头类型库
export const SHOT_TYPES = [
  { id: 'extreme-wide', label: '远景', en: 'Extreme wide shot' },
  { id: 'wide', label: '全景', en: 'Wide shot' },
  { id: 'medium', label: '中景', en: 'Medium shot' },
  { id: 'medium-close', label: '中近景', en: 'Medium close-up' },
  { id: 'close-up', label: '特写', en: 'Close-up' },
  { id: 'extreme-close', label: '大特写', en: 'Extreme close-up' },
  { id: 'over-shoulder', label: '过肩镜头', en: 'Over-the-shoulder shot' },
  { id: 'pov', label: '第一人称', en: 'First-person POV' },
  { id: 'birds-eye', label: '鸟瞰', en: "Bird's eye view" },
  { id: 'low-angle', label: '低角度', en: 'Low angle shot' },
  { id: 'high-angle', label: '高角度', en: 'High angle shot' },
  { id: 'dutch-angle', label: '倾斜镜头', en: 'Dutch angle' },
];
