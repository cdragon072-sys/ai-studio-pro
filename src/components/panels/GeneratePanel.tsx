import { useState } from 'react';
import { useGenerationStore } from '../../stores/generationStore';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { buildPromptFromShot } from '../../data/prompt-templates';
import { STYLE_PRESETS, SHOT_TYPES, generateMasterPrompt } from '../../data/seedance-master';

export default function GeneratePanel() {
  const { providers, activeProviderId, setActiveProvider, tasks, generateImage } = useGenerationStore();
  const { shots, selectedShotId, updateShot } = useStoryboardStore();
  const [showPromptHelper, setShowPromptHelper] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');

  const selectedShot = shots.find(s => s.id === selectedShotId);
  const activeProvider = providers.find(p => p.id === activeProviderId);
  const imageModels = activeProvider?.models.filter(m => m.type === 'text-to-image') || [];

  const handleGenerate = () => {
    if (!selectedShot) return;
    const prompt = selectedShot.prompt || buildPromptFromShot(selectedShot);
    generateImage(selectedShot.id, prompt);
  };

  const handleBatchGenerate = () => {
    shots.forEach((shot, i) => {
      const prompt = shot.prompt || buildPromptFromShot(shot);
      setTimeout(() => generateImage(shot.id, prompt), i * 500);
    });
  };

  const handleSeedanceEnhance = () => {
    if (!selectedShot) return;
    const enhanced = generateMasterPrompt({
      subject: selectedShot.description || 'unknown scene',
      shot: selectedShot.cameraMovements[0] || 'medium shot',
      movement: selectedShot.cameraMovements.join(', ') || 'static',
      style: 'cinematic',
      mood: selectedShot.mood || 'dramatic',
      quality: '8K, ultra detailed, cinematic lighting',
    });
    updateShot(selectedShot.id, { prompt: enhanced });
  };

  const handleAddStyle = (styleEn: string) => {
    if (!selectedShot) return;
    const currentPrompt = selectedShot.prompt || buildPromptFromShot(selectedShot);
    updateShot(selectedShot.id, { prompt: `${currentPrompt}, ${styleEn}` });
  };

  const handleSetShotType = (shotEn: string) => {
    if (!selectedShot) return;
    const currentPrompt = selectedShot.prompt || buildPromptFromShot(selectedShot);
    updateShot(selectedShot.id, { prompt: `${shotEn}, ${currentPrompt}` });
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="panel-content">
      {/* Provider Selection - Compact */}
      <div className="panel-section">
        <div className="panel-section-title">🤖 AI 供应商</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {providers.filter(p => p.models.some(m => m.type === 'text-to-image')).map(provider => (
            <button
              key={provider.id}
              className={`chip ${activeProviderId === provider.id ? 'selected' : ''}`}
              onClick={() => setActiveProvider(provider.id)}
              style={{ gap: '4px' }}
            >
              <span style={{
                width: '14px', height: '14px', borderRadius: '3px',
                background: provider.color, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', fontWeight: 700,
              }}>{provider.icon}</span>
              {provider.name}
              <span className={`gen-provider-status ${provider.apiKey ? '' : 'offline'}`}
                style={{ width: '6px', height: '6px', marginLeft: '2px' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {activeProvider && imageModels.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">📦 生图模型 · {activeProvider.name}</div>
          {imageModels.map(model => (
            <div
              key={model.id}
              className={`gen-model-item ${selectedModelId === model.id ? 'active' : ''}`}
              onClick={() => setSelectedModelId(model.id)}
              style={{
                padding: '6px 10px',
                background: selectedModelId === model.id ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '3px',
                border: `1px solid ${selectedModelId === model.id ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: selectedModelId === model.id ? 600 : 400 }}>{model.name}</span>
              <span className="badge badge-cyan" style={{ fontSize: '9px' }}>🖼️</span>
            </div>
          ))}
        </div>
      )}

      {/* Seedance Prompt Helper */}
      {selectedShot && (
        <div className="panel-section">
          <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✨ 提示词工具</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPromptHelper(!showPromptHelper)}
              style={{ fontSize: '10px' }}
            >
              {showPromptHelper ? '收起' : '展开'}
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '6px' }}
            onClick={handleSeedanceEnhance}
          >
            🎬 Seedance 大师增强
          </button>

          {showPromptHelper && (
            <>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>风格标签</div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {STYLE_PRESETS.map(s => (
                  <button
                    key={s.id}
                    className="agent-quick-btn"
                    onClick={() => handleAddStyle(s.en)}
                    title={s.en}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>镜头类型</div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {SHOT_TYPES.map(s => (
                  <button
                    key={s.id}
                    className="agent-quick-btn"
                    onClick={() => handleSetShotType(s.en)}
                    title={s.en}
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Current Prompt Preview */}
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
            lineHeight: 1.5,
            color: 'var(--text-muted)',
            maxHeight: '60px',
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)',
          }}>
            {selectedShot.prompt || buildPromptFromShot(selectedShot) || '(未设定提示词)'}
          </div>
        </div>
      )}

      {/* Generate Actions */}
      <div className="panel-section">
        <div className="panel-section-title">🚀 生成操作</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGenerate}
            disabled={!selectedShot}
          >
            🎨 生成当前镜头
          </button>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleBatchGenerate}
            disabled={shots.length === 0}
          >
            ⚡ 批量生成全部 ({shots.length} 镜头)
          </button>
        </div>
      </div>

      {/* Task Queue */}
      {recentTasks.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">📋 任务队列 ({tasks.length})</div>
          {recentTasks.map(task => (
            <div key={task.id} className="gen-queue-item">
              <div className="gen-queue-thumb">
                {task.status === 'completed' && task.resultUrl ? (
                  <img src={task.resultUrl} alt="result" />
                ) : task.status === 'running' ? (
                  <span className="animate-pulse">⏳</span>
                ) : task.status === 'failed' ? (
                  '❌'
                ) : (
                  '⏱️'
                )}
              </div>
              <div className="gen-queue-info">
                <div className="gen-queue-name">{task.provider} · {task.model}</div>
                <div className="gen-queue-status">
                  {task.status === 'queued' && '排队中'}
                  {task.status === 'running' && `生成中 ${task.progress}%`}
                  {task.status === 'completed' && '✅ 完成'}
                  {task.status === 'failed' && `❌ ${task.error || '失败'}`}
                </div>
                {task.status === 'running' && (
                  <div className="gen-queue-progress">
                    <div className="gen-queue-progress-bar" style={{ width: `${task.progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
