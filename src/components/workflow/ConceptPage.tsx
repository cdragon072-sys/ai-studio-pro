import { useState } from 'react';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { useGenerationStore } from '../../stores/generationStore';
import { STYLE_PRESETS } from '../../data/seedance-master';

const GENRES = ['科幻', '奇幻', '现实主义', '赛博朋克', '黑色电影', '动作', '悬疑', '喜剧', '恐怖', '纪录片', '广告', 'MV'];
const AUDIENCES = ['大众', '年轻人', 'B站', '抖音', '小红书', '专业影视', '品牌商业'];
const STYLES = ['电影级', '动漫风', '写实3D', '水彩画风', '像素艺术', '极简主义', '复古胶片', '蒸汽波'];

export default function ConceptPage() {
  const { setActiveView } = useStoryboardStore();
  const { providers } = useGenerationStore();
  const [theme, setTheme] = useState('');
  const [concept, setConcept] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['赛博朋克']);
  const [selectedAudience, setSelectedAudience] = useState('大众');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['电影级']);
  const [keywords, setKeywords] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };
  const toggleStyle = (s: string) => {
    setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleAiExpand = async () => {
    setAiLoading(true);
    setAiResult('');

    const chatProvider = providers.find(p => p.apiKey && p.models.some(m => m.type === 'chat'));

    if (!chatProvider) {
      // Demo mode
      let demoText = '';
      const fullDemo = `## 🎬 AI 创意扩展

### 概念深化
基于你的主题「${theme || '赛博朋克追逐战'}」和 ${selectedGenres.join('/')} 风格，我为你扩展了以下创意方向：

**核心冲突**: 一位拥有义眼的前企业黑客在废弃的城市地下层发现了AI觉醒的秘密。企业派出追踪者追杀她，她必须在逃亡中揭露真相。

**视觉关键词**: ${selectedStyles.map(s => {
  const preset = STYLE_PRESETS.find(p => p.label === s);
  return preset ? preset.en.split(',')[0] : s;
}).join(', ')}

### 建议分镜结构 (4镜头)
1. **建立镜头** — 城市全景，霓虹雨夜，无人机下降
2. **角色镜头** — 主角穿行人群，手持跟拍
3. **冲突镜头** — 发现追踪者，推镜特写
4. **追逐镜头** — 跑酷穿越街巷，第一人称POV

### 推荐模型
- **生图**: Seedream 5.0 (KIE) / Sora Image (GRS)
- **视频**: Seedance 2.0 (支持多模态) / Sora 2 (角色一致性)

### 关键词标签
\`cyberpunk\` \`neon rain\` \`corporate conspiracy\` \`bionic eye\` \`urban chase\` \`night city\``;

      for (let i = 0; i < fullDemo.length; i++) {
        demoText += fullDemo[i];
        if (i % 3 === 0) {
          setAiResult(demoText);
          await new Promise(r => setTimeout(r, 8));
        }
      }
      setAiResult(fullDemo);
      setAiLoading(false);
      return;
    }

    // Real API
    try {
      const { streamChatRequest } = await import('../../services/api-client');
      const chatModel = chatProvider.models.find(m => m.type === 'chat');
      let accumulated = '';

      await streamChatRequest(
        { baseUrl: chatProvider.baseUrl, apiKey: chatProvider.apiKey },
        [
          { role: 'system', content: '你是一位专业的AI视频创意总监。用户提供主题和风格后，你要生成：1.概念深化 2.视觉关键词 3.建议分镜结构 4.推荐模型 5.英文关键词标签。保持简洁专业。' },
          { role: 'user', content: `主题: ${theme || '未设定'}\n概念: ${concept || '未设定'}\n风格: ${selectedGenres.join(', ')}\n视觉: ${selectedStyles.join(', ')}\n受众: ${selectedAudience}\n关键词: ${keywords || '无'}\n\n请帮我扩展创意概念。` },
        ],
        chatModel?.id || 'deepseek-chat',
        (chunk) => { accumulated += chunk; setAiResult(accumulated); },
        () => setAiLoading(false),
        (error) => { setAiResult(`❌ 错误: ${error}`); setAiLoading(false); }
      );
    } catch (err: any) {
      setAiResult(`❌ 连接失败: ${err.message}`);
      setAiLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-content-centered">
        {/* Hero Section */}
        <div className="concept-hero">
          <div className="concept-hero-icon">💡</div>
          <h1 className="page-title">构思主题</h1>
          <p className="page-subtitle">第一步：确定你的核心创意、目标受众与视觉风格</p>
        </div>

        <div className="concept-grid">
          {/* Left Column */}
          <div className="concept-card">
            <div className="concept-card-header">
              <span className="concept-card-icon">🎯</span>
              <h2 className="concept-card-title">主题与概念</h2>
            </div>

            <div className="input-group">
              <label className="input-label">主题名称</label>
              <input
                className="input"
                placeholder="例：赛博朋克城市中的追逐战..."
                value={theme}
                onChange={e => setTheme(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">核心概念</label>
              <textarea
                className="input"
                placeholder={"描述你的视频核心概念和故事灵感...\n\n例：一位流浪的机器人在废弃的未来城市中寻找自己的创造者，途中经历了各种危险与感动的故事。"}
                value={concept}
                onChange={e => setConcept(e.target.value)}
                rows={5}
              />
            </div>

            <div className="input-group">
              <label className="input-label">关键词</label>
              <input
                className="input"
                placeholder="用逗号分隔关键词：赛博, 机器人, 追逐, 雨夜..."
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="concept-card">
            <div className="concept-card-header">
              <span className="concept-card-icon">🎨</span>
              <h2 className="concept-card-title">风格定义</h2>
            </div>

            <div className="input-group">
              <label className="input-label">类型 (可多选)</label>
              <div className="chip-grid">
                {GENRES.map(g => (
                  <button
                    key={g}
                    className={`chip ${selectedGenres.includes(g) ? 'selected' : ''}`}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">目标受众</label>
              <div className="chip-grid">
                {AUDIENCES.map(a => (
                  <button
                    key={a}
                    className={`chip ${selectedAudience === a ? 'selected' : ''}`}
                    onClick={() => setSelectedAudience(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">视觉风格 (可多选)</label>
              <div className="chip-grid">
                {STYLES.map(s => (
                  <button
                    key={s}
                    className={`chip style ${selectedStyles.includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Assist Bar */}
        <div className="concept-ai-bar">
          <div className="concept-ai-bar-left">
            <span style={{ fontSize: '20px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>AI 创意助手</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                基于你的主题和风格，AI 帮你扩展概念、推荐分镜结构和模型
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAiExpand}
            disabled={aiLoading}
          >
            {aiLoading ? '⏳ 生成中...' : '✨ AI 扩展概念'}
          </button>
        </div>

        {/* AI Result */}
        {aiResult && (
          <div className="concept-ai-result">
            <div className="concept-ai-result-header">
              <span>🎬 AI 创意扩展结果</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setAiResult('')}>✕</button>
            </div>
            <div className="concept-ai-result-content">{aiResult}</div>
          </div>
        )}

        {/* Next Step */}
        <div className="page-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setActiveView('script')}
          >
            下一步：写剧本 →
          </button>
        </div>
      </div>
    </div>
  );
}
