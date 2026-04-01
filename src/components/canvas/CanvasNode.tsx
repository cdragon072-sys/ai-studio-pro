import { useRef, useCallback } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../stores/canvasStore';
import UnifiedNodeContent from './nodes/UnifiedNodeContent';
import StoryboardGridNode from './nodes/StoryboardGridNode';
import NodeGenerationPanel from './NodeGenerationPanel';

interface Props {
  node: CanvasNodeData;
}

export default function CanvasNode({ node }: Props) {
  const { selectedNodeId, selectNode, moveNode, startConnection, endConnection, connectingFrom, saveToStorage, removeNode } = useCanvasStore();
  const isSelected = selectedNodeId === node.id;
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectNode(node.id);
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };

    const zoom = useCanvasStore.getState().zoom;
    const handleMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = (ev.clientX - dragStart.current.x) / zoom;
      const dy = (ev.clientY - dragStart.current.y) / zoom;
      moveNode(node.id, dragStart.current.nodeX + dx, dragStart.current.nodeY + dy);
    };
    const handleUp = () => {
      isDragging.current = false;
      saveToStorage();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [node.id, node.x, node.y, selectNode, moveNode, saveToStorage]);

  // Port click handlers
  const handlePortClick = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectingFrom) {
      endConnection(node.id, side);
    } else {
      startConnection(node.id, side);
    }
  };

  // Render inner content by type
  const renderContent = () => {
    switch (node.type) {
      case 'text':
      case 'image':
      case 'video':
        return <UnifiedNodeContent node={node} />;
      case 'storyboard': return <StoryboardGridNode node={node} />;
      case 'upload': return (
        <div className="canvas-node-upload">
          <input type="file" id={`upload-${node.id}`} style={{ display: 'none' }} accept="image/*,video/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              const isVideo = file.type.startsWith('video');
              useCanvasStore.getState().updateNode(node.id, {
                type: isVideo ? 'video' : 'image',
                label: isVideo ? 'Video' : 'Image',
                imageUrl: isVideo ? undefined : url,
                videoUrl: isVideo ? url : undefined,
              });
            }
          }} />
          <label htmlFor={`upload-${node.id}`} className="canvas-upload-label">
            <span style={{ fontSize: '24px' }}>📤</span>
            <span>点击上传</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>图片或视频</span>
          </label>
        </div>
      );
      default: return null;
    }
  };

  // Should show generation panel?
  const showGenPanel = isSelected && node.type !== 'upload' && node.type !== 'storyboard';

  return (
    <div
      className={`canvas-node ${isSelected ? 'selected' : ''} canvas-node-${node.type}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: node.width,
        minHeight: node.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Node Label + Delete button */}
      <div className="canvas-node-label">
        {node.label}
        {isSelected && (
          <button
            className="canvas-node-delete"
            onClick={(e) => { e.stopPropagation(); removeNode(node.id); saveToStorage(); }}
            onMouseDown={(e) => e.stopPropagation()}
            title="删除节点"
          >✕</button>
        )}
      </div>

      {/* Left Port */}
      <button
        className={`canvas-port canvas-port-left ${connectingFrom ? 'connectable' : ''}`}
        onClick={handlePortClick('left')}
        onMouseDown={e => e.stopPropagation()}
      >
        ⊕
      </button>

      {/* Content */}
      <div className="canvas-node-body">
        {renderContent()}
      </div>

      {/* Right Port */}
      <button
        className={`canvas-port canvas-port-right ${connectingFrom ? 'connectable' : ''}`}
        onClick={handlePortClick('right')}
        onMouseDown={e => e.stopPropagation()}
      >
        ⊕
      </button>

      {/* Status indicator */}
      {node.status === 'generating' && (
        <div className="canvas-node-status generating">生成中...</div>
      )}
      {node.status === 'error' && (
        <div
          className="canvas-node-status error"
          onClick={(e) => { e.stopPropagation(); useCanvasStore.getState().updateNode(node.id, { status: 'idle', error: undefined }); }}
          title="点击清除错误"
          style={{ cursor: 'pointer' }}
        >
          {node.error || '错误'} ✕
        </div>
      )}

      {/* Node-attached generation panel (shows when selected) */}
      {showGenPanel && (
        <NodeGenerationPanel node={node} />
      )}
    </div>
  );
}
