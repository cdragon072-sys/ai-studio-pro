# 🎬 AI 影视工坊 | AI Studio Pro

> 基于无限画布的 AI 影视制作工作流平台，集成多模型 AI 生成能力，覆盖从编剧到成片的全流程创作。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)

## ✨ 核心特性

### 🖼️ 无限画布工作流
- **节点式创作**：文本、图片、视频三种节点类型，自由连接构建创作工作流
- **节点附属生成面板**：选中节点即展开专属 AI 生成控制面板（参考 LibLib.tv 交互模式）
- **数据自动传递**：连接节点后，文本→图片→视频的数据自动流转

### 🤖 多模型 AI 集成
| 供应商 | 能力 | 模型示例 |
|--------|------|----------|
| **KIE AI** | 文生图 / 图生视频 | Seedream 5.0, GPT Image 1.5, Flux-2 Pro |
| **GRS AI** | 文生图 / 文生视频 / Chat | Sora 2, Veo 3.1, Gemini 3.1 Pro |
| **DeepSeek** | Chat / 编剧辅助 | DeepSeek V3.2, Reasoner |
| **RunningHub** | ComfyUI 工作流 | Seedance, 可灵 |
| **T8 Star** | 文生图 | Midjourney, DALL-E 3 |

### 🎬 山音超级编剧大师
集成 [@山音](https://github.com/Shanyin-ai/shanyin-screenwriting-master) 设计的全格式影视编剧 Agent Skill：
- ⚡ **概念超短片** (1-3分钟) — What-If / How-to-Tell
- 🎬 **叙事短片** (5-10分钟) — 完整起承转合
- 🎥 **90分钟长片** — 商业片 & 文艺片双轨创作
- 📺 **多集剧集** — 季播/单元剧架构

核心方法论：戏剧动作、Want vs Need、人物弧光、Show Don't Tell、潜台词、双轨节奏系统

### 🎨 Seedance 2.0 提示词模板引擎
内置万能提示词大师，支持：
- 角色设计提示词模板
- 场景描述模板
- 风格化提示词组合

### 📦 其他功能
- 🖱️ 双击画布添加节点
- 🔗 节点间连线传递数据
- 📋 分镜格子节点（拖拽排序）
- 💬 AI Agent 聊天助手
- 📁 资产库 / 工作流 / 历史记录面板
- ⚙️ 设置面板（API Key 管理）

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装

```bash
git clone https://github.com/YOUR_USERNAME/ai-studio-pro.git
cd ai-studio-pro
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173/

### 构建

```bash
npm run build
```

## ⚙️ 配置 API Key

启动应用后，点击右上角 ⚙️ 设置按钮，在对应的供应商标签页中输入 API Key：

| 供应商 | 获取地址 |
|--------|----------|
| KIE AI | https://api.kie.ai |
| GRS AI | https://grsaiapi.com |
| DeepSeek | https://platform.deepseek.com |
| RunningHub | https://www.runninghub.cn |

> ⚠️ API Key 存储在浏览器 IndexedDB 中，不会上传到任何服务器。

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **状态管理**: Zustand
- **样式**: Vanilla CSS (Glassmorphism 设计)
- **存储**: IndexedDB (Dexie.js)
- **API 通信**: Fetch + SSE Stream

## 📁 项目结构

```
src/
├── components/
│   ├── canvas/           # 画布核心组件
│   │   ├── InfiniteCanvas.tsx    # 无限画布容器
│   │   ├── CanvasNode.tsx        # 节点渲染器
│   │   ├── NodeGenerationPanel.tsx # 节点附属生成面板
│   │   ├── AddNodeMenu.tsx       # 添加节点菜单
│   │   └── nodes/                # 节点类型实现
│   │       ├── TextNode.tsx
│   │       ├── ImageNode.tsx
│   │       └── VideoNode.tsx
│   ├── panels/           # 侧边面板
│   ├── storyboard/       # 分镜相关
│   └── settings/         # 设置模态框
├── data/
│   ├── prompt-templates.ts       # Seedance 提示词模板
│   ├── screenwriting-skills.ts   # 编剧大师技能数据
│   └── screenwriting-master.md   # 编剧大师完整技能原文
├── services/
│   ├── api-client.ts     # API 请求 / 轮询 / SSE
│   └── grsai.ts          # GRS AI 节点配置
├── stores/
│   ├── canvasStore.ts    # 画布状态管理
│   └── generationStore.ts # AI 供应商 & 任务管理
├── styles/
│   └── index.css         # 全局样式
└── types/
    └── index.ts          # TypeScript 类型定义
```

## 🙏 致谢

- **山音超级编剧大师** — [@山音](https://github.com/Shanyin-ai/shanyin-screenwriting-master) (MIT License)
- **LibLib.tv** — 交互设计参考

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE)
