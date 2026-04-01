import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { getMovementById } from '../../data/camera-movements';
import { useGenerationStore } from '../../stores/generationStore';
import { buildPromptFromShot } from '../../data/prompt-templates';
import type { Shot } from '../../types';

function ShotNodeInner({ data, selected }: NodeProps & { data: Shot }) {
  const { selectShot, removeShot, duplicateShot } = useStoryboardStore();
  const { generateImage } = useGenerationStore();
  const shot = data as Shot;

  const handleSelect = useCallback(() => {
    selectShot(shot.id);
  }, [shot.id, selectShot]);

  const handleGenerate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = buildPromptFromShot(shot);
    generateImage(shot.id, prompt);
  }, [shot, generateImage]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateShot(shot.id);
  }, [shot.id, duplicateShot]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeShot(shot.id);
  }, [shot.id, removeShot]);

  // Check for generated images in tasks
  const tasks = useGenerationStore(s => s.tasks);
  const completedTask = tasks.find(t => t.shotId === shot.id && t.status === 'completed');
  const runningTask = tasks.find(t => t.shotId === shot.id && t.status === 'running');
  const displayImage = shot.imageUrl || completedTask?.resultUrl;

  return (
    <div className={`shot-node ${selected ? 'selected' : ''}`} onClick={handleSelect}>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--accent-purple)', border: 'none', width: 8, height: 8 }} />

      <div className="shot-node-header">
        <span className="shot-node-number">S{String(shot.number).padStart(2, '0')}</span>
        <span className="shot-node-duration">{shot.duration}s</span>
      </div>

      <div className="shot-node-preview">
        {displayImage ? (
          <img src={displayImage} alt={`Shot ${shot.number}`} />
        ) : runningTask ? (
          <div className="shot-node-preview-placeholder">
            <span className="animate-pulse" style={{ fontSize: '24px' }}>⏳</span>
            <span>生成中 {runningTask.progress}%</span>
          </div>
        ) : (
          <div className="shot-node-preview-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>点击生成</span>
          </div>
        )}
      </div>

      <div className="shot-node-body">
        <div className="shot-node-description">
          {shot.description || shot.subject || '未添加描述...'}
        </div>
        <div className="shot-node-tags">
          {shot.cameraMovements.slice(0, 2).map(id => {
            const m = getMovementById(id);
            return m ? (
              <span key={id} className="shot-tag camera">{m.name}</span>
            ) : null;
          })}
          {shot.mood && <span className="shot-tag mood">{shot.mood}</span>}
          {shot.cameraMovements.length > 2 && (
            <span className="shot-tag camera">+{shot.cameraMovements.length - 2}</span>
          )}
        </div>
      </div>

      <div className="shot-node-footer">
        <button className="btn btn-primary btn-sm" onClick={handleGenerate}>🎨 生图</button>
        <button className="btn btn-secondary btn-sm" onClick={handleDuplicate}>📋</button>
        <button className="btn btn-secondary btn-sm" onClick={handleDelete}>🗑️</button>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: 'var(--accent-purple)', border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

export default memo(ShotNodeInner);
