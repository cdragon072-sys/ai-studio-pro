import { useState } from 'react';
import { useStoryboardStore } from '../../stores/storyboardStore';

const VIDEO_MODELS = [
  // KIE AI
  { id: 'seedance', name: 'Seedance 2.0', provider: 'KIE / RunningHub', type: '图生视频', badge: '推荐', desc: '字节跳动最新版, 支持多模态输入+运镜控制', group: 'kie' },
  { id: 'kling', name: '可灵 (Kling)', provider: 'KIE / RunningHub', type: '图/文生视频', badge: '热门', desc: '国产旗舰视频生成模型, 高动态范围', group: 'kie' },
  { id: 'wan', name: 'Wan 2.1', provider: 'KIE', type: '图/文生视频', badge: '开源', desc: '阿里万相开源视频模型', group: 'kie' },
  { id: 'hailuo', name: '海螺 (Hailuo)', provider: 'KIE', type: '文生视频', badge: '', desc: 'MiniMax 海螺AI视频生成', group: 'kie' },
  // GRS AI - Sora-2
  { id: 'sora-2', name: 'Sora 2', provider: 'GRS AI', type: '文/图生视频', badge: 'OpenAI', desc: 'OpenAI Sora 2, 支持角色上传/创建, 10-15秒', group: 'grsai' },
  { id: 'sora-2-char', name: 'Sora 2 角色版', provider: 'GRS AI', type: '角色驱动', badge: '角色上传', desc: '上传角色图片生成一致性角色视频', group: 'grsai' },
  // GRS AI - Veo
  { id: 'veo31-fast', name: 'Veo 3.1 Fast', provider: 'GRS AI', type: '文/图生视频', badge: '⚡ 快速', desc: 'Google Veo 快速版, 支持首帧/尾帧引导', group: 'grsai' },
  { id: 'veo31-pro', name: 'Veo 3.1 Pro', provider: 'GRS AI', type: '文/图生视频', badge: '★ 高质量', desc: 'Google Veo 专业版, 最高质量输出', group: 'grsai' },
  // Other
  { id: 'runway', name: 'Runway Gen-4', provider: '自定义', type: '图/文生视频', badge: '专业', desc: '专业级视频生成工具', group: 'other' },
  { id: 't8-sora', name: 'Sora 2', provider: 'T8 Star', type: '文生视频', badge: 'T8', desc: 'T8 Star 代理的 Sora 2 视频', group: 'other' },
];

export default function VideoGenPage() {
  const { setActiveView, shots } = useStoryboardStore();
  const [selectedModel, setSelectedModel] = useState('seedance');
  const [showVeoOptions, setShowVeoOptions] = useState(false);

  const model = VIDEO_MODELS.find(m => m.id === selectedModel);
  const isVeo = selectedModel.startsWith('veo');
  const isSora2 = selectedModel.startsWith('sora-2');

  return (
    <div className="page-container">
      <div className="page-content-centered">
        <div className="script-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              <span style={{ marginRight: '8px' }}>🎥</span>生成视频
            </h1>
            <p className="page-subtitle">第六步：将图像与分镜转化为动态视频 — 图生视频 / 文生视频</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setActiveView('storyboard')}>← 写分镜</button>
          </div>
        </div>

        {/* Video Models */}
        <div className="panel-section">
          <div className="panel-section-title">🤖 视频生成模型</div>
          
          {/* KIE & RunningHub */}
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>KIE AI / RunningHub</div>
          <div className="video-model-grid">
            {VIDEO_MODELS.filter(m => m.group === 'kie').map(m => (
              <div
                key={m.id}
                className={`video-model-card ${selectedModel === m.id ? 'video-model-selected' : ''}`}
                onClick={() => setSelectedModel(m.id)}
              >
                <div className="video-model-header">
                  <h3 className="video-model-name">{m.name}</h3>
                  {m.badge && <span className="badge badge-purple">{m.badge}</span>}
                </div>
                <p className="video-model-desc">{m.desc}</p>
                <div className="video-model-footer">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.provider}</span>
                  <span className="badge badge-cyan">{m.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* GRS AI */}
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            GRS AI · Sora 2 + Veo 3.1
          </div>
          <div className="video-model-grid">
            {VIDEO_MODELS.filter(m => m.group === 'grsai').map(m => (
              <div
                key={m.id}
                className={`video-model-card ${selectedModel === m.id ? 'video-model-selected' : ''}`}
                onClick={() => setSelectedModel(m.id)}
              >
                <div className="video-model-header">
                  <h3 className="video-model-name">{m.name}</h3>
                  {m.badge && <span className="badge badge-purple">{m.badge}</span>}
                </div>
                <p className="video-model-desc">{m.desc}</p>
                <div className="video-model-footer">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.provider}</span>
                  <span className="badge badge-cyan">{m.type}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Other */}
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>其他供应商</div>
          <div className="video-model-grid">
            {VIDEO_MODELS.filter(m => m.group === 'other').map(m => (
              <div
                key={m.id}
                className={`video-model-card ${selectedModel === m.id ? 'video-model-selected' : ''}`}
                onClick={() => setSelectedModel(m.id)}
              >
                <div className="video-model-header">
                  <h3 className="video-model-name">{m.name}</h3>
                  {m.badge && <span className="badge badge-purple">{m.badge}</span>}
                </div>
                <p className="video-model-desc">{m.desc}</p>
                <div className="video-model-footer">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.provider}</span>
                  <span className="badge badge-cyan">{m.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model-specific Options */}
        {(isVeo || isSora2) && (
          <div className="panel-section" style={{ marginTop: '16px' }}>
            <div className="panel-section-title">
              ⚡ {model?.name} 专属参数
            </div>

            {isSora2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">视频时长</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="chip selected">10秒</button>
                    <button className="chip">15秒</button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">画面尺寸</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="chip selected">16:9</button>
                    <button className="chip">9:16</button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">画质</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="chip selected">Small</button>
                    <button className="chip">Large</button>
                  </div>
                </div>
              </div>
            )}

            {isSora2 && selectedModel === 'sora-2-char' && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-default)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>👤 角色上传</div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  上传角色参考图片，Sora 2 会在生成的视频中保持角色外观一致性
                </p>
                <button className="btn btn-secondary btn-sm">📤 上传角色图片</button>
              </div>
            )}

            {isVeo && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">画面比例</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="chip selected">16:9</button>
                    <button className="chip">9:16</button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">帧引导 (Veo 独有)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowVeoOptions(!showVeoOptions)}>
                      🖼️ 设置首帧/尾帧
                    </button>
                  </div>
                </div>
                {showVeoOptions && (
                  <>
                    <div className="input-group">
                      <label className="input-label">首帧参考图</label>
                      <div style={{ padding: '20px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>点击上传首帧图片</span>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">尾帧参考图</label>
                      <div style={{ padding: '20px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>点击上传尾帧图片</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Storyboard Queue */}
        <div className="panel-section" style={{ marginTop: '24px' }}>
          <div className="panel-section-title">📋 分镜队列 — 逐集生成</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
            从分镜画布导入镜头序列，使用 <strong style={{ color: 'var(--accent-purple)' }}>{model?.name || '选定模型'}</strong> 逐个生成视频片段
          </p>

          <div className="video-queue">
            {shots.map(shot => (
              <div key={shot.id} className="video-queue-item">
                <div className="video-queue-thumb">
                  {shot.imageUrl ? (
                    <img src={shot.imageUrl} alt={`Shot ${shot.number}`} />
                  ) : (
                    <span style={{ fontSize: '16px' }}>🖼️</span>
                  )}
                </div>
                <div className="video-queue-info">
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    S{String(shot.number).padStart(2, '0')} · {shot.description || '未命名镜头'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {shot.duration}s · {shot.cameraMovements.length} 运镜 · {shot.mood || '无情绪标签'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary btn-sm">预览</button>
                  <button className="btn btn-primary btn-sm">生成</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Batch Generate */}
        <div className="concept-ai-bar" style={{ marginTop: '24px' }}>
          <div className="concept-ai-bar-left">
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>批量生成视频</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                将所有分镜按顺序自动生成视频片段，最终合成完整视频
              </div>
            </div>
          </div>
          <button className="btn btn-primary">🎬 一键生成全部视频</button>
        </div>
      </div>
    </div>
  );
}
