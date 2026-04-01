import { useState, useRef, useEffect } from 'react';
import { useGenerationStore } from '../../stores/generationStore';
import { SEEDANCE_MASTER_SYSTEM_PROMPT } from '../../data/seedance-master';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export default function AgentChat({ onClose }: { onClose: () => void }) {
  const { providers } = useGenerationStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🎬 **Seedance 大师**已就绪！\n\n我可以帮你：\n- 📝 将剧本转化为专业分镜提示词\n- 🎥 推荐最佳运镜和镜头语言\n- 🎨 优化风格描述和质量标签\n- 👤 确保多镜头角色一致性\n\n告诉我你的创意概念，我来为你生成完整的提示词序列！',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatProviders = providers.filter(p =>
    p.models.some(m => m.type === 'chat') && p.apiKey
  );

  useEffect(() => {
    if (chatProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(chatProviders[0].id);
    }
  }, [chatProviders, selectedProvider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const provider = providers.find(p => p.id === selectedProvider);

    if (!provider?.apiKey) {
      // Demo mode: generate mock response
      setIsStreaming(true);
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }]);

      const demoResponse = generateDemoResponse(input.trim());
      let current = '';
      for (let i = 0; i < demoResponse.length; i++) {
        current += demoResponse[i];
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: current } : m
        ));
        await new Promise(r => setTimeout(r, 15));
      }
      setIsStreaming(false);
      return;
    }

    // Real API streaming
    setIsStreaming(true);
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }]);

    try {
      const { streamChatRequest } = await import('../../services/api-client');
      const chatModel = provider.models.find(m => m.type === 'chat');
      let accumulated = '';

      await streamChatRequest(
        { baseUrl: provider.baseUrl, apiKey: provider.apiKey },
        [
          { role: 'system', content: SEEDANCE_MASTER_SYSTEM_PROMPT },
          ...messages.filter(m => m.role !== 'system').slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: input.trim() },
        ],
        chatModel?.id || 'deepseek-chat',
        (chunk) => {
          accumulated += chunk;
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          ));
        },
        () => { setIsStreaming(false); },
        (error) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantId ? { ...m, content: `❌ 错误: ${error}` } : m
          ));
          setIsStreaming(false);
        }
      );
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: `❌ 连接失败: ${err.message}` } : m
      ));
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="agent-chat">
      <div className="agent-chat-header">
        <div className="agent-chat-title">
          <span className="agent-avatar">🎬</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Seedance 大师</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              视频提示词专家 · {isStreaming ? '💭 思考中...' : '● 在线'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {chatProviders.length > 0 && (
            <select
              className="agent-provider-select"
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
            >
              {chatProviders.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="agent-chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`agent-msg agent-msg-${msg.role}`}>
            {msg.role === 'assistant' && <span className="agent-msg-avatar">🎬</span>}
            <div className="agent-msg-content">
              <div className="agent-msg-text">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="agent-quick-actions">
        {['📝 剧本转分镜', '🎥 推荐运镜', '✨ 优化提示词', '👤 角色一致性'].map(action => (
          <button
            key={action}
            className="agent-quick-btn"
            onClick={() => {
              const prompts: Record<string, string> = {
                '📝 剧本转分镜': '请帮我把以下剧本概念转化为4个分镜提示词序列：赛博朋克城市中的追逐战，一位义眼女性被企业追踪者追逐',
                '🎥 推荐运镜': '请为一个产品展示广告推荐最佳的3种运镜组合方案',
                '✨ 优化提示词': '请帮我优化这个提示词：一个女孩在雨中走路',
                '👤 角色一致性': '请教我如何在多个镜头中保持同一个角色的外观一致性',
              };
              setInput(prompts[action] || action);
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="agent-chat-input-area">
        <textarea
          className="agent-chat-input"
          placeholder={chatProviders.length > 0 ? '描述你的创意概念...' : '演示模式 (设置API Key后连接真实AI)'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button
          className="btn btn-primary agent-send-btn"
          onClick={sendMessage}
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? '⌛' : '↑'}
        </button>
      </div>
    </div>
  );
}

// Demo response generator
function generateDemoResponse(userInput: string): string {
  if (userInput.includes('分镜') || userInput.includes('剧本')) {
    return `## 🎬 分镜提示词序列

基于你的概念，我为你生成了4镜头结构：

### S01 — 建立镜头 (5s)
\`Extreme wide shot, a cyberpunk megacity at night after rain, neon-lit skyscrapers reflecting on wet streets, holographic billboards flickering, slow drone descent, IMAX quality, Blade Runner color palette, 8K\`
- **运镜**: 无人机缓降 (Drone Descent)
- **情绪**: 压抑、宏大

### S02 — 角色登场 (5s)  
\`Medium tracking shot, a young woman with a glowing blue cybernetic eye wearing a black trenchcoat, walking urgently through crowded market street, handheld camera following, shallow depth of field, neon reflections on her face, cinematic\`
- **运镜**: 手持跟拍 (Handheld Tracking)
- **情绪**: 紧张、匿名

### S03 — 冲突升级 (5s)
\`Close-up push-in, the woman's face snapping around to look behind her, rain droplets on her skin, blue eye pulsing with data, three corporate agents visible in background bokeh, anamorphic lens flare, tension building\`
- **运镜**: 推镜特写 (Push-in Close-up)
- **情绪**: 恐惧、警觉

### S04 — 追逐爆发 (5s)
\`First-person POV running through neon-lit alleyways, vaulting over market stalls, holographic signs blurring past, heavy breathing audio, motion blur, agents in pursuit, Dutch angle on tight turns, cyberpunk chase sequence\`
- **运镜**: 第一人称跑酷 (POV Chase)
- **情绪**: 肾上腺素、爆发

> 💡 **角色一致性提示**: S01-S04 应使用同一参考图(@图片1)锁定角色外观，确保义眼、黑色风衣等关键特征保持一致。`;
  }

  if (userInput.includes('运镜') || userInput.includes('镜头')) {
    return `## 🎥 运镜推荐方案

### 方案 A — 商业展示型
1. **环绕镜头** (Orbit) — 360°展示产品全貌
2. **推镜头** (Push-in) — 聚焦产品细节
3. **升镜头** (Crane Up) — 揭示品牌标语

### 方案 B — 叙事紧张型
1. **稳定器跟拍** (Steadicam Track) — 建立角色
2. **希区柯克变焦** (Dolly Zoom) — 制造压迫感
3. **航拍拉远** (Drone Pull Out) — 揭示全景

### 方案 C — 创意动感型
1. **滑轨推拉** (Dolly Push-Pull) — 配合音乐节拍
2. **倾斜镜头** (Dutch Angle) — 增加动感
3. **一镜到底** (One-Take) — 视觉连贯

每种方案都适合不同风格的视频。需要我为你的具体项目定制运镜方案吗？`;
  }

  if (userInput.includes('优化') || userInput.includes('提示词')) {
    return `## ✨ 提示词优化建议

**原始**: "一个女孩在雨中走路"

**优化后**:
\`\`\`
Cinematic medium shot, a young East Asian woman in her 20s with long black hair, wearing a light blue dress, walking slowly through a rain-soaked Tokyo street at night. Neon reflections creating colorful puddles on asphalt. Raindrops visible in the glow of sodium streetlights. Gentle wind moving her hair. Steadicam tracking shot from the side. Shallow depth of field, bokeh background. Melancholic yet beautiful atmosphere. Song Joong-ki movie aesthetic, 8K quality, film grain.
\`\`\`

**优化要点**:
1. ✅ 添加了**具体人物描述** (年龄/发色/服装)
2. ✅ 指定了**场景细节** (东京街道/霓虹灯)
3. ✅ 加入了**运镜指令** (侧面跟拍)
4. ✅ 定义了**光影效果** (钠灯/雨滴折射)
5. ✅ 注入了**情绪氛围** (忧郁但美丽)
6. ✅ 使用了**质量标签** (8K/电影颗粒)`;
  }

  return `## 💡 收到！

我是 **Seedance 大师**，专注于 AI 视频生成提示词工程。

关于你说的"${userInput.slice(0, 50)}..."，我可以从以下角度帮你：

1. **拆解为分镜序列** — 将概念分解为多个可执行的镜头
2. **优化提示词结构** — 按 [镜头+主体+动作+场景+运镜+光影+风格] 公式重构
3. **推荐模型选择** — 根据内容推荐 Seedance/可灵/Sora/Veo 最佳模型
4. **角色一致性方案** — 设计多镜头中角色外观统一的策略

请更详细地描述你的需求，或者直接发送你的剧本文案！`;
}
