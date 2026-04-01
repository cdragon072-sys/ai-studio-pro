import { useStoryboardStore } from '../../stores/storyboardStore';
import PromptPanel from './PromptPanel';
import GeneratePanel from './GeneratePanel';
import type { PanelTab } from '../../types';

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'prompt', label: '🎯 提示词' },
  { id: 'generate', label: '🤖 AI 生成' },
];

export default function RightPanel() {
  const { activePanelTab, setActivePanelTab } = useStoryboardStore();

  return (
    <aside className="right-panel">
      <div className="panel-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`panel-tab ${activePanelTab === tab.id ? 'active' : ''}`}
            onClick={() => setActivePanelTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activePanelTab === 'prompt' && <PromptPanel />}
      {activePanelTab === 'generate' && <GeneratePanel />}
    </aside>
  );
}
