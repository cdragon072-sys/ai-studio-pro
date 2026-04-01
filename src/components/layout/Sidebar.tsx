import { useStoryboardStore } from '../../stores/storyboardStore';
import { WORKFLOW_STEPS } from '../../data/workflow-steps';

export default function Sidebar() {
  const { activeView, setActiveView, setShowSettings } = useStoryboardStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => setActiveView('concept')}>
        影
      </div>

      {/* Workflow Step Label */}
      <div className="sidebar-section-label">工作流</div>

      <nav className="sidebar-nav">
        {WORKFLOW_STEPS.map(step => (
          <button
            key={step.id}
            className={`sidebar-item ${activeView === step.id ? 'active' : ''}`}
            onClick={() => setActiveView(step.id)}
          >
            <div className="sidebar-step-number" style={{ 
              background: activeView === step.id ? step.color : 'transparent',
              borderColor: step.color,
            }}>
              {step.number}
            </div>
            <span className="sidebar-tooltip">
              <strong>{step.label}</strong>
              <br />
              <span style={{ opacity: 0.7, fontSize: '10px' }}>{step.tools}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      {/* Workflow Progress */}
      <div className="sidebar-progress">
        <div className="sidebar-progress-bar">
          <div 
            className="sidebar-progress-fill" 
            style={{ 
              height: `${(WORKFLOW_STEPS.findIndex(s => s.id === activeView) + 1) / WORKFLOW_STEPS.length * 100}%` 
            }} 
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => setShowSettings(true)}
        >
          <span style={{ fontSize: '18px' }}>⚙️</span>
          <span className="sidebar-tooltip">API 设置</span>
        </button>
      </nav>
    </aside>
  );
}
