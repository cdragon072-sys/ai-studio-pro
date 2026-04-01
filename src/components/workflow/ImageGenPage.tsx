import { useState } from 'react';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { useGenerationStore } from '../../stores/generationStore';
import { SEEDANCE_PROMPT_LIBRARY, SEEDANCE_CATEGORIES, STYLE_PRESETS, SHOT_TYPES } from '../../data/seedance-master';

const IMAGE_MODELS = [
  // KIE AI
  { id: 'seedream', name: 'Seedream 5.0', provider: 'KIE AI', type: '文生图', badge: '推荐', color: '#8b5cf6', group: 'kie' },
  { id: 'flux-2', name: 'Flux-2 Pro', provider: 'KIE AI', type: '文生图', badge: '高质量', color: '#3b82f6', group: 'kie' },
  { id: 'ideogram', name: 'Ideogram V3', provider: 'KIE AI', type: '文生图', badge: '文字强', color: '#06b6d4', group: 'kie' },
  { id: 'gpt-img-kie', name: 'GPT Image 1.5', provider: 'KIE AI', type: '文生图', badge: '全能', color: '#10b981', group: 'kie' },
  // GRS AI - GPT Image
  { id: 'sora-image', name: 'Sora Image', provider: 'GRS AI', type: '文生图', badge: 'OpenAI', color: '#f43f5e', group: 'grsai' },
  { id: 'gpt-image-1', name: 'GPT Image 1', provider: 'GRS AI', type: '文/图生图', badge: 'GPT', color: '#ef4444', group: 'grsai' },
  // GRS AI - Nano Banana
  { id: 'nano-banana-fast', name: 'Nano Banana Fast', provider: 'GRS AI', type: '快速生图', badge: '⚡快速', color: '#fbbf24', group: 'grsai' },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'GRS AI', type: '高质量', badge: '★ Pro', color: '#f59e0b', group: 'grsai' },
  // RunningHub
  { id: 'rh-seedream', name: 'Seedream', provider: 'RunningHub', type: '文生图', badge: '', color: '#10b981', group: 'rh' },
  { id: 'comfyui', name: 'ComfyUI 工作流', provider: 'RunningHub', type: '自定义', badge: '高级', color: '#f59e0b', group: 'rh' },
];

const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'];

export default function ImageGenPage() {
  const { setActiveView } = useStoryboardStore();
  const { tasks } = useGenerationStore();
  const [prompt, setPrompt] = useState('A cyberpunk city at night after rain, neon lights reflecting on wet streets, towering skyscrapers with holographic advertisements, cinematic lighting, ultra detailed, 8K');
  const [negPrompt, setNegPrompt] = useState('blurry, low quality, distorted, watermark');
  const [selectedModel, setSelectedModel] = useState('seedream');
  const [ratio, setRatio] = useState('16:9');
  const [count, setCount] = useState(4);
  const [showPromptLib, setShowPromptLib] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('realistic');

  const imageTasks = tasks.filter(t => t.status === 'completed' && t.resultUrl);

  const filteredTemplates = SEEDANCE_PROMPT_LIBRARY.filter(t => t.category === selectedCategory);

  return (
    <div className="page-container">
      <div className="page-content-wide">
        <div className="script-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              <span style={{ marginRight: '8px' }}>🖼️</span>AI 生图
            </h1>
            <p className="page-subtitle">第四步：根据剧本和提示词，AI 生成静态图像与场景</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setActiveView('materials')}>← 生成素材</button>
            <button className="btn btn-primary" onClick={() => setActiveView('storyboard')}>写分镜 →</button>
          </div>
        </div>

        <div className="imagegen-layout">
          {/* Left: Controls */}
          <div className="imagegen-controls">
            {/* Model Selection with Groups */}
            <div className="panel-section">
              <div className="panel-section-title">🤖 选择模型</div>
              
              {/* KIE Group */}
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>KIE AI</div>
              <div className="imagegen-model-grid" style={{ marginBottom: '12px' }}>
                {IMAGE_MODELS.filter(m => m.group === 'kie').map(model => (
                  <button
                    key={model.id}
                    className={`imagegen-model-card ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                    style={{ '--model-color': model.color } as React.CSSProperties}
                  >
                    <div className="imagegen-model-name">{model.name}</div>
                    <div className="imagegen-model-provider">{model.provider}</div>
                    {model.badge && <span className="imagegen-model-badge">{model.badge}</span>}
                  </button>
                ))}
              </div>
              
              {/* GRS AI Group */}
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>GRS AI · 全接口</div>
              <div className="imagegen-model-grid" style={{ marginBottom: '12px' }}>
                {IMAGE_MODELS.filter(m => m.group === 'grsai').map(model => (
                  <button
                    key={model.id}
                    className={`imagegen-model-card ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                    style={{ '--model-color': model.color } as React.CSSProperties}
                  >
                    <div className="imagegen-model-name">{model.name}</div>
                    <div className="imagegen-model-provider">{model.provider}</div>
                    {model.badge && <span className="imagegen-model-badge">{model.badge}</span>}
                  </button>
                ))}
              </div>

              {/* RunningHub Group */}
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>RunningHub</div>
              <div className="imagegen-model-grid">
                {IMAGE_MODELS.filter(m => m.group === 'rh').map(model => (
                  <button
                    key={model.id}
                    className={`imagegen-model-card ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                    style={{ '--model-color': model.color } as React.CSSProperties}
                  >
                    <div className="imagegen-model-name">{model.name}</div>
                    <div className="imagegen-model-provider">{model.provider}</div>
                    {model.badge && <span className="imagegen-model-badge">{model.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt with Seedance Master */}
            <div className="panel-section">
              <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✏️ 提示词</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowPromptLib(!showPromptLib)}
                  style={{ fontSize: '10px' }}
                >
                  {showPromptLib ? '收起模板库' : '📚 Seedance 大师模板'}
                </button>
              </div>

              {/* Seedance Prompt Library */}
              {showPromptLib && (
                <div className="seedance-lib">
                  <div className="seedance-categories">
                    {SEEDANCE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className={`seedance-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="seedance-templates">
                    {filteredTemplates.map(tmpl => (
                      <div
                        key={tmpl.id}
                        className="seedance-template-card"
                        onClick={() => { setPrompt(tmpl.prompt); setShowPromptLib(false); }}
                      >
                        <div className="seedance-tmpl-title">{tmpl.titleZh}</div>
                        <div className="seedance-tmpl-prompt">{tmpl.prompt.slice(0, 80)}...</div>
                        <div className="seedance-tmpl-tags">
                          {tmpl.tags.map(tag => (
                            <span key={tag} className="seedance-tag">{tag}</span>
                          ))}
                          <span className={`seedance-difficulty seedance-diff-${tmpl.difficulty}`}>
                            {tmpl.difficulty === 'basic' ? '入门' : tmpl.difficulty === 'intermediate' ? '中级' : '大师'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Style Presets */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {STYLE_PRESETS.slice(0, 6).map(style => (
                  <button
                    key={style.id}
                    className="agent-quick-btn"
                    onClick={() => setPrompt(prev => `${prev}, ${style.en}`)}
                    title={style.en}
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              {/* Quick Shot Types */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {SHOT_TYPES.slice(0, 6).map(shot => (
                  <button
                    key={shot.id}
                    className="agent-quick-btn"
                    onClick={() => setPrompt(prev => `${shot.en}, ${prev}`)}
                    title={shot.en}
                  >
                    {shot.label}
                  </button>
                ))}
              </div>

              <textarea
                className="input"
                placeholder="描述你想生成的图像..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="panel-section">
              <div className="panel-section-title">🚫 反向提示词</div>
              <input
                className="input"
                placeholder="不想出现的元素..."
                value={negPrompt}
                onChange={e => setNegPrompt(e.target.value)}
              />
            </div>

            {/* Settings */}
            <div className="panel-section">
              <div className="panel-section-title">⚙️ 参数</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">画面比例</label>
                  <div className="chip-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {RATIOS.map(r => (
                      <button
                        key={r}
                        className={`chip ${ratio === r ? 'selected' : ''}`}
                        onClick={() => setRatio(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">生成数量</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      className="input"
                      type="range"
                      min={1}
                      max={8}
                      value={count}
                      onChange={e => setCount(parseInt(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-purple)', minWidth: '24px', textAlign: 'center' }}>{count}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              🎨 生成 {count} 张图片
            </button>
          </div>

          {/* Right: Gallery */}
          <div className="imagegen-gallery">
            <div className="panel-section-title">📸 生成结果</div>
            {imageTasks.length === 0 ? (
              <div className="imagegen-gallery-empty">
                <div style={{ fontSize: '48px', opacity: 0.3 }}>🖼️</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px' }}>
                  生成的图片将显示在这里
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                  填写提示词并选择模型后点击生成
                </p>
              </div>
            ) : (
              <div className="imagegen-results-grid">
                {imageTasks.map(task => (
                  <div key={task.id} className="imagegen-result-card">
                    <img src={task.resultUrl!} alt="Generated" />
                    <div className="imagegen-result-overlay">
                      <button className="btn btn-sm btn-primary">用于分镜</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Demo placeholders */}
            <div className="imagegen-results-grid" style={{ marginTop: '12px' }}>
              {[1170, 1171, 1172, 1173].map(seed => (
                <div key={seed} className="imagegen-result-card">
                  <img src={`https://picsum.photos/seed/${seed}/400/300`} alt="Demo" />
                  <div className="imagegen-result-overlay">
                    <button className="btn btn-sm btn-primary">用于分镜</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
