import { useState } from 'react';
import { useStoryboardStore } from '../../stores/storyboardStore';
import { useGenerationStore } from '../../stores/generationStore';

export default function ScriptPage() {
  const { setActiveView } = useStoryboardStore();
  const { providers } = useGenerationStore();
  const [script, setScript] = useState(`# 赛博朋克追逐战

## ACT 1 — 开场

**场景 1：城市夜景**
雨后的赛博朋克城市，霓虹灯在湿漉漉的街道上映射出五彩斑斓的光芒。
密集的高楼大厦之间，全息广告牌闪烁不停。

**场景 2：主角登场**
一位穿着黑色风衣的年轻女性，低着头快步穿过熙攘的人群。
她的右眼闪烁着蓝色的机械光芒 —— 这是一只义眼。

## ACT 2 — 冲突

**场景 3：追逐**
身后传来急促的脚步声，三个穿着企业制服的追踪者紧跟而来。
她猛然回头，面部特写，雨滴划过她紧张的面容。

## ACT 3 — 高潮

（待续...）`);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedShots, setExtractedShots] = useState<string[]>([]);

  const chatProvider = providers.find(p => p.apiKey && p.models.some(m => m.type === 'chat'));

  const callAi = async (systemPrompt: string, userPrompt: string) => {
    setAiLoading(true);
    setAiResult('');

    if (!chatProvider) {
      // Demo mode
      const demos: Record<string, string> = {
        '扩写': `## ACT 3 — 高潮

**场景 4：天台追逐**
她跃上附近建筑的消防梯，金属梯级在雨中发出刺耳的声响。身后的追踪者毫不犹豫地跟了上来。
攀上天台后，整个赛博朋克城市的天际线在她眼前展开——数不清的霓虹灯在雨帘中朦胧闪烁。

**场景 5：对峙**
三个追踪者从不同方向包围上来。领头的追踪者摘下面罩，露出一张她熟悉的面孔——那是她曾经的搭档。
"数据芯片。交出来，一切既往不咎。"
她握紧拳头，义眼中闪过一串加密数据流。

**场景 6：抉择**
她后退一步，站在天台边缘。身后是百米高空，脚下是城市深渊。
"有些东西，比我的命更重要。"
她纵身跃下——`,
        '对话': `**场景 3（对话补充）:**

追踪者A：(通讯器) "目标锁定，C区第三街道。"

主角：(低声) "该死...他们又来了。"

追踪者A：(喊话) "KAI！别跑了！你带走的东西不属于你！"

主角：(头也不回) "它也不属于你们的老板。"

追踪者B：(切入旁路) "注意，她的义眼有电子干扰能力。保持距离。"

主角：(自言自语) "距离？你们还不够了解我。" (点击义眼，释放EMP脉冲)`,
        '场景': `**场景描述优化建议：**

原文："雨后的赛博朋克城市"
→ **优化**: "暴雨刚过的新东京第七层区，空气中弥漫着臭氧和醛类化合物的混合气味。头顶盘旋的广告无人机像发光的水母群，将整片天空染成紫红色的脉动海洋。"

原文："霓虹灯在湿漉漉的街道上映射出五彩斑斓的光芒"
→ **优化**: "地面积水像一面碎裂的镜子，每一片水洼都映射着不同的霓虹 —— 红色的拉面店招牌、蓝色的机体改造诊所、绿色的'数字天堂'网吧。脚步踏过时，这些光芒如受惊的鱼群般荡漾开来。"`,
        '分镜': generateShotExtraction(script),
      };

      const key = userPrompt.includes('扩写') ? '扩写' :
                  userPrompt.includes('对话') ? '对话' :
                  userPrompt.includes('场景') || userPrompt.includes('优化') ? '场景' :
                  userPrompt.includes('分镜') || userPrompt.includes('提取') ? '分镜' : '扩写';

      const demoText = demos[key] || demos['扩写'];
      let current = '';
      for (let i = 0; i < demoText.length; i++) {
        current += demoText[i];
        if (i % 2 === 0) {
          setAiResult(current);
          await new Promise(r => setTimeout(r, 10));
        }
      }
      setAiResult(demoText);
      setAiLoading(false);
      return;
    }

    // Real API
    try {
      const { streamChatRequest } = await import('../../services/api-client');
      const chatModel = chatProvider.models.find(m => m.type === 'chat');
      let accumulated = '';

      await streamChatRequest(
        { baseUrl: chatProvider.baseUrl, apiKey: chatProvider.apiKey },
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `当前剧本:\n${script}\n\n用户指令: ${userPrompt}` },
        ],
        chatModel?.id || 'deepseek-chat',
        (chunk) => { accumulated += chunk; setAiResult(accumulated); },
        () => setAiLoading(false),
        (error) => { setAiResult(`❌ 错误: ${error}`); setAiLoading(false); }
      );
    } catch (err: any) {
      setAiResult(`❌ 连接失败: ${err.message}`);
      setAiLoading(false);
    }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    callAi(
      '你是一位专业编剧。根据用户的剧本和指令，帮助续写、优化或补充内容。保持风格统一，输出格式与原剧本一致。',
      aiPrompt
    );
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      '扩写': '请帮我扩写剧本中最后一个待续的部分，续写2-3个场景',
      '对话': '为剧本中的角色生成自然的对话台词',
      '场景': '优化剧本中的场景描写，让画面感更强',
      '结构': '检查这个剧本的三幕结构是否完整，给出改进建议',
      '分镜': '从剧本中提取分镜列表，每个分镜包含：镜号、场景描述、运镜建议、时长估计',
    };
    const systemPrompts: Record<string, string> = {
      '扩写': '你是一位擅长剧情发展的编剧。根据已有剧本续写新场景，保持风格和角色一致性。',
      '对话': '你是一位对话写作专家。为场景补充自然、有张力的角色对话。',
      '场景': '你是一位视觉描写大师。用电影般的语言优化场景描述，加入具体的感官细节。',
      '结构': '你是一位剧本结构顾问。分析三幕结构，指出薄弱环节并给出专业建议。',
      '分镜': '你是一位分镜师。从剧本中提取分镜序列。格式：S01: [描述] | 运镜: [推荐] | 时长: [秒]',
    };
    callAi(systemPrompts[action] || systemPrompts['扩写'], prompts[action] || action);
  };

  const handleApplyToScript = () => {
    if (aiResult) {
      setScript(prev => prev + '\n\n' + aiResult);
      setAiResult('');
    }
  };

  // Count scenes/characters in script
  const sceneCount = (script.match(/\*\*场景\s*\d+/g) || []).length;
  const estimatedDuration = sceneCount * 15;

  return (
    <div className="page-container">
      <div className="page-content-wide">
        <div className="script-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              <span style={{ marginRight: '8px' }}>📝</span>写剧本
            </h1>
            <p className="page-subtitle">第二步：编写故事结构、场景描述和对白</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setActiveView('concept')}>← 构思主题</button>
            <button className="btn btn-primary" onClick={() => setActiveView('materials')}>生成素材 →</button>
          </div>
        </div>

        <div className="script-layout">
          {/* Main Editor */}
          <div className="script-editor-container">
            <div className="script-editor-toolbar">
              <span className="badge badge-purple">📄 剧本编辑器</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-ghost btn-sm">B</button>
                <button className="btn btn-ghost btn-sm">I</button>
                <button className="btn btn-ghost btn-sm">H1</button>
                <button className="btn btn-ghost btn-sm">H2</button>
                <div className="toolbar-divider" style={{ margin: '0 4px' }} />
                <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(script)}>📋 复制</button>
              </div>
            </div>
            <textarea
              className="script-editor"
              value={script}
              onChange={e => setScript(e.target.value)}
              spellCheck={false}
            />
            <div className="script-editor-footer">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {script.length} 字符 · {script.split('\n').length} 行
              </span>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="script-ai-panel">
            <div className="panel-section">
              <div className="panel-section-title">🤖 AI 剧本助手</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
                {chatProvider
                  ? `使用 ${chatProvider.name} 辅助创作`
                  : '演示模式 (配置API Key后连接真实AI)'}
              </p>

              <div className="input-group">
                <label className="input-label">AI 指令</label>
                <textarea
                  className="input"
                  placeholder="例：帮我补充 ACT 3 的高潮部分，需要一段紧张刺激的追车戏..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAiGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
              >
                {aiLoading ? '⏳ 生成中...' : '✨ AI 生成'}
              </button>
            </div>

            <div className="panel-section">
              <div className="panel-section-title">🎯 快捷操作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => handleQuickAction('扩写')} disabled={aiLoading}>
                  📖 扩写选中段落
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => handleQuickAction('对话')} disabled={aiLoading}>
                  💬 生成角色对话
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => handleQuickAction('场景')} disabled={aiLoading}>
                  🎭 优化场景描述
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => handleQuickAction('结构')} disabled={aiLoading}>
                  📐 检查故事结构
                </button>
                <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => handleQuickAction('分镜')} disabled={aiLoading}>
                  🔄 一键提取分镜
                </button>
              </div>
            </div>

            {/* AI Result */}
            {aiResult && (
              <div className="panel-section">
                <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>💡 AI 输出</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleApplyToScript}>📥 应用到剧本</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAiResult('')}>✕</button>
                  </div>
                </div>
                <div style={{
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  lineHeight: 1.8,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}>
                  {aiResult}
                </div>
              </div>
            )}

            <div className="panel-section">
              <div className="panel-section-title">📊 剧本分析</div>
              <div className="script-stats">
                <div className="script-stat">
                  <span className="script-stat-value">{sceneCount}</span>
                  <span className="script-stat-label">场景</span>
                </div>
                <div className="script-stat">
                  <span className="script-stat-value">2</span>
                  <span className="script-stat-label">角色</span>
                </div>
                <div className="script-stat">
                  <span className="script-stat-value">~{estimatedDuration}s</span>
                  <span className="script-stat-label">预估时长</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateShotExtraction(script: string): string {
  const scenes = script.match(/\*\*场景\s*\d+[^*]*\*\*[^*]*/g) || [];
  let result = '## 📋 分镜提取结果\n\n';
  
  scenes.forEach((scene, i) => {
    const lines = scene.trim().split('\n');
    const title = lines[0]?.replace(/\*\*/g, '').trim() || `场景 ${i + 1}`;
    const desc = lines.slice(1).join(' ').trim().slice(0, 60);
    const cameras = ['推镜特写', '稳定器跟拍', '航拍下降', '手持跟拍', '环绕镜头', '希区柯克变焦'];
    result += `**S${String(i + 1).padStart(2, '0')}**: ${title}\n`;
    result += `  描述: ${desc}...\n`;
    result += `  运镜: ${cameras[i % cameras.length]}\n`;
    result += `  时长: ${10 + i * 5}秒\n\n`;
  });

  if (scenes.length === 0) {
    result += '未检测到标准场景标记。请使用 **场景 N：标题** 格式标记场景。';
  }

  return result;
}
