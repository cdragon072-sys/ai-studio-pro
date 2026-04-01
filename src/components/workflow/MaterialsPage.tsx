import { useStoryboardStore } from '../../stores/storyboardStore';

const MATERIAL_CATEGORIES = [
  {
    icon: '🎙️',
    title: '旁白/语音',
    description: '利用 TTS 模型将剧本文案转化为专业旁白',
    models: ['ChatTTS', 'Fish Audio', 'Eleven Labs'],
    status: 'ready',
  },
  {
    icon: '🎵',
    title: '背景音乐',
    description: 'AI 生成与主题和情绪匹配的原创背景音乐',
    models: ['Suno AI', 'Udio', 'MusicGen'],
    status: 'ready',
  },
  {
    icon: '🔊',
    title: '音效',
    description: '自动匹配场景的环境音效和动作音效',
    models: ['AudioGen', 'Make-An-Audio'],
    status: 'ready',
  },
  {
    icon: '✍️',
    title: '字幕/文案',
    description: '生成视频字幕、标题和描述文案',
    models: ['DeepSeek', 'Claude', 'GPT'],
    status: 'ready',
  },
  {
    icon: '🎭',
    title: '角色设计',
    description: '根据剧本描述生成一致性角色参考图',
    models: ['Seedream', 'Flux', 'SDXL'],
    status: 'ready',
  },
  {
    icon: '🏙️',
    title: '场景设计',
    description: '根据场景描述生成环境概念图和氛围参考',
    models: ['Seedream', 'MidJourney', 'DALL·E'],
    status: 'ready',
  },
];

export default function MaterialsPage() {
  const { setActiveView } = useStoryboardStore();

  return (
    <div className="page-container">
      <div className="page-content-centered">
        <div className="script-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              <span style={{ marginRight: '8px' }}>🎨</span>生成素材
            </h1>
            <p className="page-subtitle">第三步：利用 AI 生成核心素材 — 提示词、声音、音乐</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setActiveView('script')}>← 写剧本</button>
            <button className="btn btn-primary" onClick={() => setActiveView('imageGen')}>生图 →</button>
          </div>
        </div>

        <div className="materials-grid">
          {MATERIAL_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="material-card">
              <div className="material-card-icon">{cat.icon}</div>
              <div className="material-card-body">
                <h3 className="material-card-title">{cat.title}</h3>
                <p className="material-card-desc">{cat.description}</p>
                <div className="material-card-models">
                  {cat.models.map(m => (
                    <span key={m} className="badge badge-purple">{m}</span>
                  ))}
                </div>
              </div>
              <div className="material-card-actions">
                <button className="btn btn-primary btn-sm">✨ 生成</button>
              </div>
            </div>
          ))}
        </div>

        {/* Batch Generate */}
        <div className="concept-ai-bar" style={{ marginTop: '24px' }}>
          <div className="concept-ai-bar-left">
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>批量生成</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                根据剧本内容自动识别所需素材并一键生成
              </div>
            </div>
          </div>
          <button className="btn btn-primary">🚀 一键生成全部素材</button>
        </div>
      </div>
    </div>
  );
}
