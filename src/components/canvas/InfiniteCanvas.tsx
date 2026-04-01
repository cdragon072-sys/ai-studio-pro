import { useRef, useCallback, useEffect, useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import CanvasNode from './CanvasNode';
import ConnectionLine from './ConnectionLine';
import AddNodeMenu from './AddNodeMenu';
import CanvasToolbar from './CanvasToolbar';

export default function InfiniteCanvas() {
  const {
    viewportX, viewportY, zoom,
    nodes, connections, selectedNodeId, connectingFrom,
    panBy, zoomTo, selectNode, cancelConnection,
    openAddMenu, closeAddMenu, showAddMenu, addMenuPosition,
    loadFromStorage,
  } = useCanvasStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load from IndexedDB on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Screen coords → canvas coords
  const screenToCanvas = useCallback((sx: number, sy: number) => ({
    x: (sx - viewportX) / zoom,
    y: (sy - viewportY) / zoom,
  }), [viewportX, viewportY, zoom]);

  // Mouse wheel → zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newZoom = zoom * (1 + delta);
    zoomTo(newZoom, e.clientX, e.clientY);
  }, [zoom, zoomTo]);

  // Pan (middle mouse or left click on background)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current?.querySelector('.canvas-world'))) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
    if (e.button === 0 && (e.target === canvasRef.current?.querySelector('.canvas-world') || e.target === canvasRef.current)) {
      selectNode(null);
      if (connectingFrom) cancelConnection();
      closeAddMenu();
    }
  }, [selectNode, connectingFrom, cancelConnection, closeAddMenu]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isPanning.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      panBy(dx, dy);
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, [panBy]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Double-click → add menu
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current?.querySelector('.canvas-world') || e.target === canvasRef.current) {
      const cp = screenToCanvas(e.clientX, e.clientY);
      openAddMenu(cp.x, cp.y);
    }
  }, [openAddMenu, screenToCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId, removeNode } = useCanvasStore.getState();
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (selectedNodeId) removeNode(selectedNodeId);
      }
      if (e.key === 'Escape') {
        cancelConnection();
        closeAddMenu();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cancelConnection, closeAddMenu]);

  // Get node center for connection port position
  const getPortPos = useCallback((nodeId: string, side: 'left' | 'right') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: side === 'left' ? node.x : node.x + node.width,
      y: node.y + node.height / 2,
    };
  }, [nodes]);

  return (
    <div
      className="infinite-canvas"
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Canvas World (transformed layer) */}
      <div
        className="canvas-world"
        style={{
          transform: `translate(${viewportX}px, ${viewportY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Connection Lines */}
        <svg className="canvas-connections" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {connections.map(conn => {
            const from = getPortPos(conn.fromNodeId, conn.fromSide);
            const to = getPortPos(conn.toNodeId, conn.toSide);
            return <ConnectionLine key={conn.id} from={from} to={to} />;
          })}
          {connectingFrom && (
            <ConnectionLine
              from={getPortPos(connectingFrom.nodeId, connectingFrom.side)}
              to={screenToCanvas(mousePos.x, mousePos.y)}
              dashed
            />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <CanvasNode key={node.id} node={node} />
        ))}
      </div>

      {/* Left Toolbar (fixed UI) */}
      <CanvasToolbar />

      {/* Add Node Menu */}
      {showAddMenu && (
        <AddNodeMenu canvasX={addMenuPosition.x} canvasY={addMenuPosition.y} />
      )}

      {/* Bottom Status Bar */}
      <div className="canvas-statusbar">
        <button className="canvas-status-btn" onClick={() => useCanvasStore.getState().fitToView()} title="适应画布">⊡</button>
        <div className="canvas-zoom-display">
          <span className="canvas-zoom-dot" />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
