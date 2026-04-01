import { useCanvasStore, type CanvasNodeData } from '../../../stores/canvasStore';

interface Props { node: CanvasNodeData; }

export default function VideoNode({ node }: Props) {
  const { updateNode, connections, nodes } = useCanvasStore();

  // Check connected inputs
  const inputConns = connections.filter(c => c.toNodeId === node.id);
  const hasRefImage = inputConns.some(c => {
    const from = nodes.find(n => n.id === c.fromNodeId);
    return from?.imageUrl || from?.resultUrl;
  });

  // If video generated, show it
  if (node.videoUrl || node.resultUrl) {
    const src = node.resultUrl || node.videoUrl;
    return (
      <div className="video-node-content">
        <video
          src={src}
          className="video-node-player"
          controls
          muted
          loop
          onMouseDown={e => e.stopPropagation()}
        />
        {node.status === 'completed' && (
          <div className="video-node-badge">✅ 已生成</div>
        )}
      </div>
    );
  }

  // Empty: show placeholder with mode hints
  return (
    <div className="video-node-empty">
      <div className="node-placeholder-icon">📹</div>
      {hasRefImage ? (
        <div className="node-placeholder-text">已连接参考图片，可生成视频</div>
      ) : (
        <div className="node-placeholder-text">选中节点后在下方配置并生成</div>
      )}

      {/* First/Last frame uploads for advanced mode */}
      {node.videoMode === 'first-last-frame' && (
        <div className="video-node-frames">
          <div className="video-frame-slot">
            <div className="frame-label">首帧</div>
            {node.firstFrameUrl ? (
              <img src={node.firstFrameUrl} alt="首帧" />
            ) : (
              <label className="frame-upload" onMouseDown={e => e.stopPropagation()}>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) updateNode(node.id, { firstFrameUrl: URL.createObjectURL(f) });
                  }}
                />
                +
              </label>
            )}
          </div>
          <div className="video-frame-slot">
            <div className="frame-label">尾帧</div>
            {node.lastFrameUrl ? (
              <img src={node.lastFrameUrl} alt="尾帧" />
            ) : (
              <label className="frame-upload" onMouseDown={e => e.stopPropagation()}>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) updateNode(node.id, { lastFrameUrl: URL.createObjectURL(f) });
                  }}
                />
                +
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
