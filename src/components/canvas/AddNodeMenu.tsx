import { useCanvasStore, type NodeType } from '../../stores/canvasStore';

interface Props {
  canvasX: number;
  canvasY: number;
}

const NODE_OPTIONS: { type: NodeType; icon: string; label: string; desc?: string; group: string }[] = [
  { type: 'text', icon: 'T', label: '文本', desc: '脚本、广告词、品牌文案', group: '添加节点' },
  { type: 'image', icon: '🖼️', label: '图片', desc: '宣传图、海报、封面', group: '添加节点' },
  { type: 'video', icon: '🎬', label: '视频', desc: '宣传视频、动画、电影', group: '添加节点' },
  { type: 'storyboard', icon: '⊞', label: '分镜格子', desc: '创建可拖拽排序的图片网格', group: '功能节点' },
  { type: 'upload', icon: '📤', label: '上传', group: '添加资源' },
];

export default function AddNodeMenu({ canvasX, canvasY }: Props) {
  const { addNode, closeAddMenu, selectNode } = useCanvasStore();
  const zoom = useCanvasStore(s => s.zoom);
  const vx = useCanvasStore(s => s.viewportX);
  const vy = useCanvasStore(s => s.viewportY);

  const handleAdd = (type: NodeType) => {
    const id = addNode(type, canvasX, canvasY);
    selectNode(id);
    closeAddMenu();
  };

  // Position in screen coords
  const screenX = canvasX * zoom + vx;
  const screenY = canvasY * zoom + vy;

  const groups = NODE_OPTIONS.reduce((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = [];
    acc[opt.group].push(opt);
    return acc;
  }, {} as Record<string, typeof NODE_OPTIONS>);

  return (
    <div
      className="add-node-menu"
      style={{ left: screenX, top: screenY }}
      onMouseDown={e => e.stopPropagation()}
    >
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="add-menu-group">
          <div className="add-menu-group-label">{group}</div>
          {items.map(opt => (
            <button
              key={opt.type}
              className="add-menu-item"
              onClick={() => handleAdd(opt.type)}
            >
              <span className="add-menu-icon">{opt.icon}</span>
              <div className="add-menu-text">
                <span className="add-menu-label">{opt.label}</span>
                {opt.desc && <span className="add-menu-desc">{opt.desc}</span>}
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
