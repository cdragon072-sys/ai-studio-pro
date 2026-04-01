import { useStoryboardStore } from '../../stores/storyboardStore';
import { WORKFLOW_STEPS, getStepByView } from '../../data/workflow-steps';

export default function Header() {
  const { shots, activeView, setActiveView } = useStoryboardStore();
  const currentStep = getStepByView(activeView);

  return (
    <header className="header">
      <div className="header-title">
        <span className="header-title-icon">🎬</span>
        AI 影视工坊
      </div>

      {/* Workflow Pipeline Steps */}
      <div className="header-pipeline">
        {WORKFLOW_STEPS.map((step, idx) => (
          <div key={step.id} className="header-pipeline-item">
            <button
              className={`header-step ${activeView === step.id ? 'active' : ''}`}
              style={{
                '--step-color': step.color,
              } as React.CSSProperties}
              onClick={() => setActiveView(step.id)}
            >
              <span className="header-step-num">{step.number}</span>
              <span className="header-step-label">{step.label}</span>
            </button>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <span className="header-step-arrow">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        {currentStep && (
          <span className="badge badge-purple" style={{ background: `${currentStep.color}22`, color: currentStep.color }}>
            {currentStep.icon} {currentStep.label}
          </span>
        )}
        {activeView === 'storyboard' && (
          <span className="badge badge-green">● {shots.length} 镜头</span>
        )}
      </div>
    </header>
  );
}
