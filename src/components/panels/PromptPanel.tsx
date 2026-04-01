import { useState } from 'react';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { L1_MOVEMENTS, L2_MOVEMENTS, L3_MOVEMENTS, getMovementById } from '../../data/camera-movements';
import { TRANSITIONS } from '../../data/transitions';
import { buildPromptFromShot } from '../../data/prompt-templates';
import type { TransitionType } from '../../types';

export default function PromptPanel() {
  const { shots, selectedShotId, updateShot, toggleCameraMovement } = useStoryboardStore();
  const shot = shots.find(s => s.id === selectedShotId);
  const [cameraLevel, setCameraLevel] = useState<1 | 2 | 3>(1);

  if (!shot) {
    return (
      <div className="empty-state" style={{ height: '100%' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <div className="empty-state-title">选择一个镜头</div>
        <div className="empty-state-desc">
          在画布上点击一个镜头节点，即可在此编辑提示词和运镜参数
        </div>
      </div>
    );
  }

  const generatedPrompt = buildPromptFromShot(shot);

  const levelMovements = cameraLevel === 1 ? L1_MOVEMENTS : cameraLevel === 2 ? L2_MOVEMENTS : L3_MOVEMENTS;

  return (
    <div className="panel-content">
      {/* 主体信息 */}
      <div className="panel-section">
        <div className="panel-section-title">🎬 镜头信息 · S{String(shot.number).padStart(2, '0')}</div>

        <div className="input-group">
          <label className="input-label">描述</label>
          <input
            className="input"
            placeholder="简短描述这个镜头..."
            value={shot.description}
            onChange={e => updateShot(shot.id, { description: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="input-group">
            <label className="input-label">主体</label>
            <input
              className="input"
              placeholder="谁/什么"
              value={shot.subject}
              onChange={e => updateShot(shot.id, { subject: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">动作</label>
            <input
              className="input"
              placeholder="在做什么"
              value={shot.action}
              onChange={e => updateShot(shot.id, { action: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">场景</label>
          <input
            className="input"
            placeholder="在哪里"
            value={shot.scene}
            onChange={e => updateShot(shot.id, { scene: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="input-group">
            <label className="input-label">情绪氛围</label>
            <input
              className="input"
              placeholder="紧张、浪漫..."
              value={shot.mood}
              onChange={e => updateShot(shot.id, { mood: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">时长 (秒)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={60}
              value={shot.duration}
              onChange={e => updateShot(shot.id, { duration: parseInt(e.target.value) || 5 })}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">光影</label>
          <input
            className="input"
            placeholder="例：neon backlighting, golden hour..."
            value={shot.lighting}
            onChange={e => updateShot(shot.id, { lighting: e.target.value })}
          />
        </div>
      </div>

      {/* 运镜选择器 */}
      <div className="panel-section">
        <div className="panel-section-title">🎥 运镜组合器</div>
        <div className="camera-picker">
          <div className="camera-level-tabs">
            <button className={`camera-level-tab ${cameraLevel === 1 ? 'active' : ''}`} onClick={() => setCameraLevel(1)}>
              L1 基础
            </button>
            <button className={`camera-level-tab ${cameraLevel === 2 ? 'active' : ''}`} onClick={() => setCameraLevel(2)}>
              L2 组合
            </button>
            <button className={`camera-level-tab ${cameraLevel === 3 ? 'active' : ''}`} onClick={() => setCameraLevel(3)}>
              L3 大师
            </button>
          </div>

          <div className="camera-grid">
            {levelMovements.map(m => (
              <button
                key={m.id}
                className={`camera-chip ${shot.cameraMovements.includes(m.id) ? 'selected' : ''}`}
                onClick={() => toggleCameraMovement(shot.id, m.id)}
                title={`${m.nameEN}: ${m.description}`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {shot.cameraMovements.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {shot.cameraMovements.map(id => {
                const m = getMovementById(id);
                return m ? (
                  <span key={id} className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => toggleCameraMovement(shot.id, id)}>
                    {m.name} ✕
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* 转场 */}
      <div className="panel-section">
        <div className="panel-section-title">🔀 转场方式</div>
        <select
          className="select"
          value={shot.transition}
          onChange={e => updateShot(shot.id, { transition: e.target.value as TransitionType })}
        >
          {TRANSITIONS.map(t => (
            <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
          ))}
        </select>
      </div>

      {/* 音效提示 */}
      <div className="panel-section">
        <div className="panel-section-title">🔊 音效提示</div>
        <input
          className="input"
          placeholder="描述声音环境..."
          value={shot.audioNote}
          onChange={e => updateShot(shot.id, { audioNote: e.target.value })}
        />
      </div>

      {/* 生成的提示词预览 */}
      <div className="panel-section">
        <div className="panel-section-title">✨ 生成提示词预览</div>
        <div className="prompt-builder">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge badge-purple">Seedance 模板</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
            >
              📋 复制
            </button>
          </div>
          <div className="prompt-preview">
            {generatedPrompt || <span style={{ opacity: 0.5 }}>填写上方字段后自动生成...</span>}
          </div>
        </div>
      </div>

      {/* 自定义提示词 */}
      <div className="panel-section">
        <div className="panel-section-title">📝 自定义提示词 (可选)</div>
        <textarea
          className="input"
          placeholder="覆写自动生成的提示词，直接输入自定义内容..."
          value={shot.prompt}
          onChange={e => updateShot(shot.id, { prompt: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
