import { useState } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../../stores/canvasStore';

interface Props { node: CanvasNodeData; }

export default function StoryboardGridNode({ node }: Props) {
  const { updateNode } = useCanvasStore();
  const cols = node.gridCols || 3;
  const rows = node.gridRows || 3;
  const ratio = node.ratio || '16:9';
  const images = node.gridImages || Array(cols * rows).fill(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const ratioOptions = ['16:9', '9:16', '1:1', '4:3'];
  const gridOptions = ['2×2', '3×3', '3×4', '4×4'];

  const handleCellUpload = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newImages = [...images];
    newImages[idx] = url;
    updateNode(node.id, { gridImages: newImages });
  };

  const handleClearCell = (idx: number) => {
    const newImages = [...images];
    newImages[idx] = null;
    updateNode(node.id, { gridImages: newImages });
  };

  const handleGridChange = (grid: string) => {
    const [c, r] = grid.split('×').map(Number);
    const newImages = Array(c * r).fill(null);
    // Copy over existing
    images.forEach((img, i) => { if (i < newImages.length) newImages[i] = img; });
    updateNode(node.id, { gridCols: c, gridRows: r, gridImages: newImages });
  };

  // Drag & drop reorder in edit mode
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newImages = [...images];
    const temp = newImages[dragIdx];
    newImages[dragIdx] = newImages[targetIdx];
    newImages[targetIdx] = temp;
    updateNode(node.id, { gridImages: newImages });
    setDragIdx(null);
  };

  const handleClearAll = () => {
    updateNode(node.id, { gridImages: Array(cols * rows).fill(null) });
  };

  return (
    <div className="storyboard-grid-node" onMouseDown={e => e.stopPropagation()}>
      {/* Toolbar */}
      <div className="grid-node-toolbar">
        <select
          value={ratio}
          onChange={e => updateNode(node.id, { ratio: e.target.value })}
          className="grid-toolbar-select"
        >
          {ratioOptions.map(r => <option key={r} value={r}>比例 {r}</option>)}
        </select>
        <select
          value={`${cols}×${rows}`}
          onChange={e => handleGridChange(e.target.value)}
          className="grid-toolbar-select"
        >
          {gridOptions.map(g => <option key={g} value={g}>网格 {g}</option>)}
        </select>
        <button className={`grid-toolbar-btn ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(!isEditing)}>
          ✏️ 编辑
        </button>
        <button className="grid-toolbar-btn" onClick={handleClearAll}>🗑️ 清空</button>
      </div>

      {/* Grid */}
      <div
        className="grid-node-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          aspectRatio: ratio === '16:9' ? `${cols * 16}/${rows * 9}` : ratio === '9:16' ? `${cols * 9}/${rows * 16}` : ratio === '1:1' ? '1' : `${cols * 4}/${rows * 3}`,
        }}
      >
        {images.slice(0, cols * rows).map((img, idx) => (
          <div
            key={idx}
            className={`grid-cell ${isEditing ? 'editable' : ''} ${dragIdx === idx ? 'dragging' : ''}`}
            draggable={isEditing && !!img}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
          >
            {img ? (
              <div className="grid-cell-img-wrap">
                <img src={img} alt={`S${idx + 1}`} />
                {isEditing && (
                  <button className="grid-cell-remove" onClick={() => handleClearCell(idx)}>×</button>
                )}
                <span className="grid-cell-number">S{idx + 1}</span>
              </div>
            ) : (
              <label className="grid-cell-empty">
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCellUpload(idx)} />
                <span className="grid-cell-plus">+</span>
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="grid-node-footer">
        双击以进入分镜编辑排序
      </div>
    </div>
  );
}
