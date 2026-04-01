import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStoryboardStore } from '../../stores/storyboardStore';
import ShotNode from './ShotNode';

const nodeTypes = { shotNode: ShotNode };

export default function StoryboardCanvas() {
  const { shots, addShot, selectShot } = useStoryboardStore();

  // Convert shots to React Flow nodes
  const initialNodes: Node[] = useMemo(() =>
    shots.map((shot, index) => ({
      id: shot.id,
      type: 'shotNode',
      position: { x: index * 320 + 60, y: 80 + (index % 2) * 40 },
      data: shot,
    })),
    [shots]
  );

  // Create edges between sequential shots
  const initialEdges: Edge[] = useMemo(() =>
    shots.slice(1).map((shot, index) => ({
      id: `e-${shots[index].id}-${shot.id}`,
      source: shots[index].id,
      target: shot.id,
      animated: true,
      style: { stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 2 },
    })),
    [shots]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when shots change
  useMemo(() => {
    setNodes(shots.map((shot, index) => {
      const existing = nodes.find(n => n.id === shot.id);
      return {
        id: shot.id,
        type: 'shotNode',
        position: existing?.position || { x: index * 320 + 60, y: 80 + (index % 2) * 40 },
        data: shot,
      };
    }));
    setEdges(shots.slice(1).map((shot, index) => ({
      id: `e-${shots[index].id}-${shot.id}`,
      source: shots[index].id,
      target: shot.id,
      animated: true,
      style: { stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 2 },
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shots]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectShot(node.id);
  }, [selectShot]);

  const onPaneClick = useCallback(() => {
    selectShot(null);
  }, [selectShot]);

  return (
    <div className="canvas-container">
      {/* Floating Toolbar */}
      <div className="canvas-toolbar">
        <button className="btn-icon" onClick={addShot} title="新建镜头">➕</button>
        <div className="toolbar-divider" />
        <button className="btn-icon" title="自动布局">📐</button>
        <button className="btn-icon" title="全屏">⛶</button>
        <div className="toolbar-divider" />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 8px' }}>
          {shots.length} 镜头
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.04)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => 'rgba(139, 92, 246, 0.6)'}
          maskColor="rgba(0, 0, 0, 0.7)"
          style={{ background: 'var(--bg-secondary)' }}
        />
      </ReactFlow>
    </div>
  );
}
