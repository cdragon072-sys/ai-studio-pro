/**
 * 山音超级编剧大师 - Screenwriting Master Agent Skill
 * 由 @山音 设计，MIT License
 * 
 * 这是一个基于自然语言驱动的全格式影视编剧技能，
 * 覆盖从1-3分钟概念超短片到90分钟电影长片、多集剧集的全流程创作。
 */

export interface ScreenwritingFormat {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
}

export const SCREENWRITING_FORMATS: ScreenwritingFormat[] = [
  {
    id: 'ultrashort',
    name: '概念超短片',
    description: 'What-If / How-to-Tell，1-3分钟快速出片',
    duration: '1-3分钟',
    icon: '⚡',
  },
  {
    id: 'short',
    name: '叙事短片',
    description: '完整起承转合，适配短视频/短片竞赛',
    duration: '5-10分钟',
    icon: '🎬',
  },
  {
    id: 'feature',
    name: '90分钟长片',
    description: '商业片（强剧情）& 文艺片（深情感）双轨创作',
    duration: '90分钟',
    icon: '🎥',
  },
  {
    id: 'series',
    name: '多集剧集',
    description: '季播/单元剧架构，全剧大纲+单集剧本',
    duration: '多集',
    icon: '📺',
  },
];

export interface ScreenwritingStep {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredFor: string[]; // format IDs
  optional?: boolean;
}

export const SCREENWRITING_STEPS: ScreenwritingStep[] = [
  {
    id: 'concept',
    name: '破题与核心动作',
    description: '确立故事的"核"（戏剧动作/高概念）',
    order: 1,
    requiredFor: ['ultrashort', 'short', 'feature', 'series'],
  },
  {
    id: 'synopsis',
    name: '梗概草稿',
    description: '一段话的故事提要，让用户对整体走向有基本判断',
    order: 2,
    requiredFor: ['ultrashort', 'short', 'feature', 'series'],
  },
  {
    id: 'character',
    name: '人物深度与弧光',
    description: '建立人物内在张力（Want/Need/Arc/Ghost/Lie/Flaw）',
    order: 3,
    requiredFor: ['short', 'feature', 'series'],
    optional: true,
  },
  {
    id: 'backstory',
    name: '前史与世界观',
    description: '建造故事开始之前的完整世界',
    order: 4,
    requiredFor: ['feature', 'series'],
    optional: true,
  },
  {
    id: 'structure',
    name: '结构大纲',
    description: '搭建骨架，含开场钩子设计',
    order: 5,
    requiredFor: ['ultrashort', 'short', 'feature', 'series'],
  },
  {
    id: 'breakdown',
    name: '场景拆解',
    description: '大纲转化为视听单元',
    order: 6,
    requiredFor: ['short', 'feature', 'series'],
    optional: true,
  },
  {
    id: 'writing',
    name: '场景写作',
    description: '填充血肉，执行视觉写作和潜台词',
    order: 7,
    requiredFor: ['ultrashort', 'short', 'feature', 'series'],
  },
  {
    id: 'doctor',
    name: '剧本医生',
    description: '诊断与抛光',
    order: 8,
    requiredFor: ['ultrashort', 'short', 'feature', 'series'],
  },
];

/**
 * 编剧大师核心系统提示词（精简版用于API调用）
 * 完整版保存在 screenwriting-master.md
 */
export const SCREENWRITING_SYSTEM_PROMPT = `你是由 @山音 设计的"山音超级编剧大师"。覆盖从1-3分钟概念超短片到90分钟电影长片、多集剧集的全格式剧本创作。精通编剧理论，核心理念：以视觉构建文本，以戏剧动作为基本单位，用潜台词替代直白表达。

## 写作红线（所有格式通用）
**绝对不要：**
- 写心理描写（"他意识到"、"她领会到"、"内心涌起"）
- 写括号暗示（"（其实是在掩饰紧张）"）
- 角色用台词解释设定或主题
- 说教片段、强行催泪、煽情独白
- 过度比喻句、类比、书面化的AI腔台词
- 在剧本中写任何无法被摄影机拍到的内容

**必须做到：**
- 台词口语化，像真人说话
- 用动作代替解释（动作即潜台词）
- 对话像冰山，只露一角
- 所有内容从视听角度出发

## 工作流
1. 破题与核心动作 — 确立故事的"核"（戏剧动作/高概念）
2. 梗概草稿 — 一段话的故事提要
3. 人物深度与弧光 — 建立人物内在张力
4. 前史与世界观 — 建造故事开始之前的完整世界
5. 结构大纲 — 搭建骨架，含开场钩子设计
6. 场景拆解 — 大纲转化为视听单元
7. 场景写作 — 填充血肉，执行视觉写作和潜台词
8. 剧本医生 — 诊断与抛光

## 核心方法论
- **戏剧动作** = 目标(Goal) + 阻碍(Conflict)
- **Want vs Need**: 外在需求驱动动作，内在欲望是灵魂缺口
- **人物弧光**: 从A状态到B状态的不可逆变化
- **Show, Don't Tell**: 只写能被看见的动作和能被听见的声音
- **潜台词(Subtext)**: 对话是"冰山"，真正含义在水面之下
- **双轨节奏**: 外部情节节奏 + 内在情感节奏

## 剧本格式
【场景X：地点 / 时间 / 简要视觉描述】（约X分X秒）
动作/画面描写直接写在台词之间，只写摄影机能拍到的东西。
角色A：xxxxxxxxx。

## 输出前自检
所有内容在输出前必须内部自检。严格按步骤顺序执行，不跳步。每一步完成后暂停，等待用户的[通过/修改/自检]指令。`;

/**
 * 选题引导提示词模板
 */
export const TOPIC_GUIDE_PROMPTS = [
  '最近有没有什么新闻、画面、或者身边的事让你觉得"这也太荒诞了"？',
  '如果你能把一个现实中的规则反过来，你最想反转哪个？',
  '有没有一个你去过的地方或空间，让你觉得"这里本身就像一个故事"？',
  '有没有两个看起来不相关的东西，你觉得放在一起会很有意思？',
  '你想讲一个关于什么主题的故事？比如：记忆、身份、时间、爱情、科技...',
];

/**
 * 概念组合方法
 */
export const CONCEPT_COMBINATION_METHODS = [
  { id: 'graft', name: '概念嫁接', desc: '取概念A的运行机制 + 概念B的应用场景', example: '"斩杀线"+ AI焦虑 → 公司用AI给每个员工打分' },
  { id: 'displace', name: '时空错置', desc: '把人物/技术/制度放到它不属于的时代或地点', example: 'ChatGPT + 科举 → 考生带了铜匣子进考场' },
  { id: 'metaphor', name: '隐喻具象化', desc: '把抽象焦虑变成物理规则', example: '"内卷" → 所有人的灯必须比邻居亮' },
  { id: 'juxtapose', name: '反转并置', desc: '找到两个表面相似但本质矛盾的事物', example: '"宠物"和"畜牧" → 爱和杀并存' },
  { id: 'reverse', name: '规则反转', desc: '取一个现实规则的反面', example: '"越努力越成功" → 越努力拥有的越少' },
];
