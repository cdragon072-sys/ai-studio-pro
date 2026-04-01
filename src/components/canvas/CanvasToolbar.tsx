import { useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';

type Panel = null | 'assets' | 'workflows' | 'history';

export default function CanvasToolbar() {
  const { openAddMenu, assets, history, workflows, removeAsset, clearHistory, loadWorkflow, deleteWorkflow, saveWorkflow } = useCanvasStore();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [assetFilter, setAssetFilter] = useState('全部');
  const [historyTab, setHistoryTab] = useState<'image' | 'video'>('image');
  const [workflowName, setWorkflowName] = useState('');

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const handleAdd = () => {
    // Stagger position based on existing node count to prevent overlap
    const { nodes, viewportX, viewportY, zoom } = useCanvasStore.getState();
    const offset = nodes.length * 50;
    const cx = (-viewportX + 400 + offset) / zoom;
    const cy = (-viewportY + 300 + (offset % 200)) / zoom;
    openAddMenu(cx, cy);
  };

  const assetCategories = ['全部', '人物', '场景', '物品', '风格', '其他'];
  const filteredAssets = assetFilter === '全部'
    ? assets
    : assets.filter(a => {
        const catMap: Record<string, string> = { '人物': 'character', '场景': 'scene', '物品': 'object', '风格': 'style', '其他': 'other' };
        return a.category === catMap[assetFilter];
      });

  const filteredHistory = history.filter(h => h.type === historyTab);

  return (
    <>
      <div className="canvas-toolbar">
        <button className={`toolbar-icon-btn ${activePanel ? '' : 'primary'}`} onClick={handleAdd} title="添加节点">
          {activePanel ? '✕' : '+'}
        </button>
        <button className={`toolbar-icon-btn ${activePanel === 'assets' ? 'active' : ''}`} onClick={() => togglePanel('assets')} title="资产">
          <span className="toolbar-icon">📦</span>
          <span className="toolbar-label">资产</span>
        </button>
        <button className={`toolbar-icon-btn ${activePanel === 'workflows' ? 'active' : ''}`} onClick={() => togglePanel('workflows')} title="工作流">
          <span className="toolbar-icon">🔗</span>
          <span className="toolbar-label">工作流</span>
        </button>
        <button className={`toolbar-icon-btn ${activePanel === 'history' ? 'active' : ''}`} onClick={() => togglePanel('history')} title="历史">
          <span className="toolbar-icon">🕐</span>
          <span className="toolbar-label">历史</span>
        </button>
      </div>

      {/* Panels */}
      {activePanel && (
        <div className="canvas-side-panel" onMouseDown={e => e.stopPropagation()}>
          {/* Assets Panel */}
          {activePanel === 'assets' && (
            <div className="side-panel-content">
              <div className="side-panel-title">
                我的资产
                <div className="side-panel-title-bar" />
              </div>
              <div className="asset-categories">
                {assetCategories.map(cat => (
                  <button
                    key={cat}
                    className={`asset-cat-btn ${assetFilter === cat ? 'active' : ''}`}
                    onClick={() => setAssetFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {filteredAssets.length === 0 ? (
                <div className="side-panel-empty">暂无资产</div>
              ) : (
                <div className="asset-grid">
                  {filteredAssets.map(a => (
                    <div key={a.id} className="asset-item">
                      <img src={a.url} alt={a.name} />
                      <button className="asset-remove" onClick={() => removeAsset(a.id)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workflows Panel */}
          {activePanel === 'workflows' && (
            <div className="side-panel-content">
              <div className="side-panel-title">
                我的工作流
                <div className="side-panel-title-bar" />
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  className="input"
                  placeholder="工作流名称"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  style={{ flex: 1, fontSize: '12px' }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => {
                  if (workflowName.trim()) { saveWorkflow(workflowName.trim()); setWorkflowName(''); }
                }}>保存</button>
              </div>
              {workflows.length === 0 ? (
                <div className="side-panel-empty">暂无工作流</div>
              ) : (
                <div className="workflow-list">
                  {workflows.map(wf => (
                    <div key={wf.id} className="workflow-item">
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{wf.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {wf.nodes.length} 节点 · {new Date(wf.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => loadWorkflow(wf.id)}>加载</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => deleteWorkflow(wf.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Panel */}
          {activePanel === 'history' && (
            <div className="side-panel-content">
              <div className="side-panel-title">
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    className={`history-tab ${historyTab === 'image' ? 'active' : ''}`}
                    onClick={() => setHistoryTab('image')}
                  >图片历史</button>
                  <button
                    className={`history-tab ${historyTab === 'video' ? 'active' : ''}`}
                    onClick={() => setHistoryTab('video')}
                  >视频历史</button>
                </div>
                <div className="side-panel-title-bar" />
              </div>
              {filteredHistory.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => clearHistory(historyTab)} style={{ marginBottom: '8px' }}>
                  清空 {historyTab === 'image' ? '图片' : '视频'} 历史
                </button>
              )}
              {filteredHistory.length === 0 ? (
                <div className="side-panel-empty">暂无历史记录</div>
              ) : (
                <div className="history-grid">
                  {filteredHistory.map(item => (
                    <div key={item.id} className="history-item">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="" />
                      ) : (
                        <video src={item.url} muted />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
