import { useState } from 'react';
import { useGenerationStore } from '../../stores/generationStore';
import { GRSAI_NODES } from '../../services/grsai';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { providers, updateProvider, grsaiNode, setGrsaiNode } = useGenerationStore();
  const [activeTab, setActiveTab] = useState(providers[0]?.id || '');
  const activeProvider = providers.find(p => p.id === activeTab);

  // Group model types for display
  const modelsByType = activeProvider?.models.reduce((acc, m) => {
    const type = m.type === 'chat' ? '💬 Chat' :
                 m.type === 'text-to-image' ? '🖼️ 文生图' :
                 m.type === 'image-to-video' ? '🎥 图生视频' :
                 m.type === 'text-to-video' ? '📹 文生视频' : '🔧 其他';
    if (!acc[type]) acc[type] = [];
    acc[type].push(m);
    return acc;
  }, {} as Record<string, typeof activeProvider.models>) || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <span className="modal-title">⚙️ API 设置</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Provider Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto', flexWrap: 'wrap' }}>
            {providers.map(p => (
              <button
                key={p.id}
                className={`btn ${activeTab === p.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setActiveTab(p.id)}
                style={{ gap: '4px' }}
              >
                <span style={{ 
                  width: '18px', height: '18px', borderRadius: '4px', 
                  background: p.color, display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '10px', fontWeight: 700
                }}>{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>

          {activeProvider && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div className="gen-provider-icon" style={{ background: activeProvider.color }}>
                  {activeProvider.icon}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{activeProvider.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {activeProvider.models.length} 个模型 · {activeProvider.type}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    className={`btn ${activeProvider.enabled ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => updateProvider(activeProvider.id, { enabled: !activeProvider.enabled })}
                  >
                    {activeProvider.enabled ? '✅ 已启用' : '⏸️ 已禁用'}
                  </button>
                </div>
              </div>

              {/* GRS AI Node Selection */}
              {activeProvider.type === 'grsai' && (
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label className="input-label">🌐 节点选择</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(Object.entries(GRSAI_NODES) as [string, { label: string; url: string }][]).map(([key, node]) => (
                      <button
                        key={key}
                        className={`chip ${grsaiNode === key ? 'selected' : ''}`}
                        onClick={() => setGrsaiNode(key as 'overseas' | 'domestic')}
                        style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}
                      >
                        {key === 'overseas' ? '🌍' : '🇨🇳'} {node.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    当前节点: {GRSAI_NODES[grsaiNode].url}
                  </div>
                </div>
              )}

              {/* GRS AI Capabilities */}
              {activeProvider.type === 'grsai' && (
                <div style={{ 
                  padding: '10px 12px', 
                  background: 'rgba(59, 130, 246, 0.05)', 
                  border: '1px solid rgba(59, 130, 246, 0.15)', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '12px',
                  fontSize: '11px',
                  lineHeight: 1.8,
                }}>
                  <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>🚀 GRS AI 全接口支持</div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Chat · GPT-Image · Nano Banana · Sora-2 视频 · Veo 3.1 视频 · ComfyUI · OSS 存储
                  </span>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Base URL</label>
                <input
                  className="input"
                  value={activeProvider.baseUrl}
                  onChange={e => updateProvider(activeProvider.id, { baseUrl: e.target.value })}
                  disabled={activeProvider.type === 'grsai'}
                />
                {activeProvider.type === 'grsai' && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    GRS AI URL 由上方节点选择自动设定
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">API Key</label>
                <input
                  className="input"
                  type="password"
                  placeholder="输入 API Key..."
                  value={activeProvider.apiKey}
                  onChange={e => updateProvider(activeProvider.id, { apiKey: e.target.value })}
                />
              </div>

              {/* Model list grouped by type */}
              <div style={{ marginTop: '16px' }}>
                <div className="panel-section-title">📦 模型列表</div>
                {Object.entries(modelsByType).map(([type, models]) => (
                  <div key={type} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {type} ({models.length})
                    </div>
                    {models.map(model => (
                      <div key={model.id} style={{
                        padding: '6px 10px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '3px',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{ fontWeight: 500 }}>{model.name}</span>
                        <span style={{ 
                          color: 'var(--text-muted)', 
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          background: 'var(--bg-secondary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}>{model.id}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
          <button className="btn btn-primary" onClick={onClose}>保存</button>
        </div>
      </div>
    </div>
  );
}
