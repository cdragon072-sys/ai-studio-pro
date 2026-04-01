import { useState } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../../stores/canvasStore';

interface Props { node: CanvasNodeData; }

export default function ImageNode({ node }: Props) {
  const { updateNode, connections, nodes } = useCanvasStore();
  const [imgError, setImgError] = useState(false);

  // Check if has connected reference image
  const inputConns = connections.filter(c => c.toNodeId === node.id);
  const hasRef = inputConns.some(c => {
    const from = nodes.find(n => n.id === c.fromNodeId);
    return from?.imageUrl || from?.resultUrl;
  });

  const imgSrc = node.resultUrl || node.imageUrl;

  // Show image if available
  if (imgSrc && !imgError) {
    return (
      <div className="image-node-content">
        <div className="image-node-preview">
          <img
            src={imgSrc}
            alt=""
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
          <label className="image-upload-overlay" onMouseDown={e => e.stopPropagation()}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setImgError(false);
                  updateNode(node.id, { imageUrl: URL.createObjectURL(file), resultUrl: undefined });
                }
              }}
            />
            ↑ 上传
          </label>
        </div>
        {node.status === 'completed' && node.resultUrl && (
          <div className="image-node-result-badge">✅ 已生成</div>
        )}
      </div>
    );
  }

  // Error state
  if (imgError && imgSrc) {
    return (
      <div className="image-node-empty">
        <div className="node-placeholder-icon">⚠️</div>
        <div className="node-placeholder-text">图片加载失败</div>
        <button className="node-mode-btn" onClick={() => window.open(imgSrc, '_blank')}>🔗 在新窗口打开</button>
        <label className="node-mode-btn" onMouseDown={e => e.stopPropagation()}>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setImgError(false);
                updateNode(node.id, { imageUrl: URL.createObjectURL(file), resultUrl: undefined });
              }
            }}
          />
          ↑ 上传替换
        </label>
      </div>
    );
  }

  // Empty state: show icon + mode hints (like LibLib.tv)
  return (
    <div className="image-node-empty">
      <div className="node-placeholder-icon">⛰</div>
      {hasRef ? (
        <div className="node-placeholder-text">已连接参考图片</div>
      ) : (
        <>
          <div className="node-hint">尝试：</div>
          <button className="node-mode-btn" onMouseDown={e => e.stopPropagation()}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) updateNode(node.id, { imageUrl: URL.createObjectURL(file) });
                }}
              />
              <span className="node-mode-icon">📤</span>
              <span>图生图</span>
            </label>
          </button>
          <button className="node-mode-btn" onMouseDown={e => e.stopPropagation()}>
            <span className="node-mode-icon">🔍</span>
            <span>图片高清</span>
          </button>
        </>
      )}
      <div className="node-placeholder-sub">选中节点后在下方配置并生成</div>
    </div>
  );
}
