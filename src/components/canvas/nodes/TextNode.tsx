import { useState, useRef, useEffect } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../../stores/canvasStore';

interface Props { node: CanvasNodeData; }

export default function TextNode({ node }: Props) {
  const { updateNode } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modes = [
    { id: 'edit', icon: '✏️', label: '自己编写内容' },
    { id: 'text2video', icon: '🎬', label: '文字生视频' },
    { id: 'img2prompt', icon: '🔤', label: '图片反推提示词' },
  ];

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Handle entering edit mode via double click
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    updateNode(node.id, { textMode: 'edit' });
  };

  // Show editor if editing or has text content
  if (node.text || isEditing) {
    return (
      <div className="text-node-content" onDoubleClick={handleDoubleClick}>
        <textarea
          ref={textareaRef}
          className="text-node-editor"
          value={node.text || ''}
          placeholder="写下你想讲的故事、场景或角色设定。例如：一个来自未来的机器人，在城市屋顶看星星。"
          onChange={e => updateNode(node.id, { text: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        />
        {node.textMode && node.textMode !== 'edit' && (
          <div className="text-node-mode-badge">
            {modes.find(m => m.id === node.textMode)?.icon} {modes.find(m => m.id === node.textMode)?.label}
          </div>
        )}
      </div>
    );
  }

  // Empty state: show mode selection options
  return (
    <div className="text-node-modes" onDoubleClick={handleDoubleClick}>
      <div className="node-placeholder-icon">☰</div>
      <div className="node-hint">尝试：</div>
      {modes.map(mode => (
        <button
          key={mode.id}
          className="node-mode-btn"
          onClick={(e) => {
            e.stopPropagation();
            updateNode(node.id, { textMode: mode.id as any });
            if (mode.id === 'edit') setIsEditing(true);
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          <span className="node-mode-icon">{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
