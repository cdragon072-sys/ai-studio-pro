import { useState } from 'react';
import InfiniteCanvas from './components/canvas/InfiniteCanvas';
import AgentChat from './components/chat/AgentChat';
import SettingsModal from './components/panels/SettingsModal';
import { useCanvasStore } from './stores/canvasStore';

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const showSettings = useCanvasStore(s => s.showSettings);
  const setShowSettings = useCanvasStore(s => s.setShowSettings);

  return (
    <div className="app-canvas-root">
      {/* Top Bar */}
      <div className="canvas-topbar">
        <div className="topbar-left">
          <span className="topbar-logo">🎬</span>
          <span className="topbar-title">AI 影视工坊</span>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </div>

      {/* Infinite Canvas */}
      <InfiniteCanvas />

      {/* Agent Chat Toggle */}
      <button
        className={`agent-chat-fab ${showChat ? 'active' : ''}`}
        onClick={() => setShowChat(!showChat)}
        title="Seedance 大师"
      >
        🎬
      </button>

      {/* Agent Chat Panel */}
      {showChat && <AgentChat onClose={() => setShowChat(false)} />}

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
