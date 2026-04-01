import { useState, useEffect } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../stores/canvasStore';
import { useGenerationStore } from '../../stores/generationStore';
import { SCREENWRITING_SYSTEM_PROMPT, SCREENWRITING_FORMATS } from '../../data/screenwriting-skills';

interface Props {
  node: CanvasNodeData;
}

type ModelCategory = 'all' | 'chat' | 'image' | 'video';

const MODEL_CATEGORIES: { id: ModelCategory; label: string; icon: string }[] = [
  { id: 'all', label: '全部', icon: '⊞' },
  { id: 'chat', label: '文本', icon: '📝' },
  { id: 'image', label: '图片', icon: '🖼️' },
  { id: 'video', label: '视频', icon: '🎬' },
];

/**
 * 统一生成面板 - 每个节点都能选择任意类型的模型
 * 选择的模型类型自动决定生成行为
 */
export default function NodeGenerationPanel({ node }: Props) {
  const { updateNode, addHistory, nodes, connections } = useCanvasStore();
  const { providers } = useGenerationStore();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [resolution, setResolution] = useState('1k');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [genStatus, setGenStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [genError, setGenError] = useState('');
  const [useScreenwritingSkill, setUseScreenwritingSkill] = useState(false);
  const [screenwritingFormat, setScreenwritingFormat] = useState('short');
  const [modelCategory, setModelCategory] = useState<ModelCategory>('all');

  // Set default model category based on node type
  useEffect(() => {
    if (node.type === 'text') setModelCategory('chat');
    else if (node.type === 'image') setModelCategory('image');
    else if (node.type === 'video') setModelCategory('video');
    else setModelCategory('all');
  }, [node.type]);

  // Sync prompt from node when switching
  useEffect(() => {
    setPrompt(node.prompt || '');
    setGenStatus(node.status === 'generating' ? 'generating' : node.status === 'error' ? 'error' : 'idle');
    setGenError(node.error || '');
  }, [node.id]);

  // Get connected input images
  const getInputImages = () => {
    const conns = connections.filter(c => c.toNodeId === node.id);
    return conns.map(c => {
      const fromNode = nodes.find(n => n.id === c.fromNodeId);
      return fromNode?.imageUrl || fromNode?.resultUrl;
    }).filter(Boolean) as string[];
  };

  // Get connected input text
  const getInputText = () => {
    const conns = connections.filter(c => c.toNodeId === node.id);
    for (const c of conns) {
      const fromNode = nodes.find(n => n.id === c.fromNodeId);
      if (fromNode?.text) return fromNode.text;
    }
    return '';
  };

  // Get connected input videos
  const getInputVideos = () => {
    const conns = connections.filter(c => c.toNodeId === node.id);
    return conns.map(c => {
      const fromNode = nodes.find(n => n.id === c.fromNodeId);
      return fromNode?.videoUrl;
    }).filter(Boolean) as string[];
  };

  const inputImages = getInputImages();
  const inputText = getInputText();
  const inputVideos = getInputVideos();

  // All models from all providers, with category filtering
  const getModels = () => {
    const allModels: { id: string; name: string; provider: string; providerId: string; icon: string; providerType: string; modelType: string }[] = [];
    providers.forEach(p => {
      if (!p.enabled) return;
      p.models.forEach(m => {
        allModels.push({
          id: m.id,
          name: m.name,
          provider: p.name,
          providerId: p.id,
          icon: p.icon,
          providerType: p.type,
          modelType: m.type,
        });
      });
    });

    // Filter by selected category
    if (modelCategory === 'chat') {
      return allModels.filter(m => m.modelType === 'chat');
    }
    if (modelCategory === 'image') {
      return allModels.filter(m => m.modelType === 'text-to-image' || m.modelType === 'image-to-image');
    }
    if (modelCategory === 'video') {
      return allModels.filter(m => m.modelType === 'text-to-video' || m.modelType === 'image-to-video');
    }
    return allModels;
  };

  const models = getModels();
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  // Determine what kind of generation this will be based on selected model
  const getGenType = (): 'chat' | 'image' | 'video' => {
    if (!currentModel) return 'chat';
    if (currentModel.modelType === 'chat') return 'chat';
    if (currentModel.modelType === 'text-to-image' || currentModel.modelType === 'image-to-image') return 'image';
    if (currentModel.modelType === 'text-to-video' || currentModel.modelType === 'image-to-video') return 'video';
    return 'chat';
  };

  // Get smart mode label based on selected model + connected inputs
  const getModeLabel = () => {
    const genType = getGenType();
    if (genType === 'chat') return '💬 AI 对话';
    if (genType === 'image') {
      return inputImages.length > 0 ? '🖼️ 图生图' : '🖼️ 文生图';
    }
    if (genType === 'video') {
      if (inputImages.length > 0) return '🎬 图生视频';
      return '🎬 文生视频';
    }
    return '';
  };

  // Auto-fill prompt from connected text node  
  useEffect(() => {
    if (inputText && !prompt) setPrompt(inputText);
  }, [inputText]);

  // ======= GENERATION HANDLER =======
  const handleGenerate = async () => {
    // Use node.text as fallback prompt if prompt is empty
    const finalPrompt = prompt.trim() || node.text?.trim() || inputText;
    if (!finalPrompt && !inputImages.length) return;
    if (!currentModel) { setGenError('请先选择模型'); setGenStatus('error'); return; }

    const provider = providers.find(p => p.id === currentModel.providerId);
    if (!provider) { setGenError('未找到供应商'); setGenStatus('error'); return; }
    if (!provider.apiKey) { setGenError('请先在设置中配置 API Key'); setGenStatus('error'); return; }

    setGenStatus('generating');
    setGenError('');
    updateNode(node.id, { status: 'generating', prompt: finalPrompt, model: currentModel.id });

    try {
      const genType = getGenType();
      const { apiRequest, pollTaskResult } = await import('../../services/api-client');
      const config = { baseUrl: provider.baseUrl, apiKey: provider.apiKey };

      // =========== CHAT / TEXT GENERATION ===========
      if (genType === 'chat') {
        const { streamChatRequest } = await import('../../services/api-client');
        let result = '';
        const messages: Array<{ role: string; content: string }> = [];
        
        // Inject screenwriting master system prompt if skill is active
        if (useScreenwritingSkill) {
          const formatInfo = SCREENWRITING_FORMATS.find(f => f.id === screenwritingFormat);
          const systemContent = SCREENWRITING_SYSTEM_PROMPT + 
            `\n\n用户选择的格式：${formatInfo?.name || '叙事短片'}（${formatInfo?.duration || '5-10分钟'}）`;
          messages.push({ role: 'system', content: systemContent });
        }
        
        messages.push({ role: 'user', content: finalPrompt });
        
        await streamChatRequest(
          config,
          messages,
          currentModel.id,
          (chunk) => { result += chunk; updateNode(node.id, { text: result }); },
          () => { updateNode(node.id, { status: 'completed' }); setGenStatus('done'); },
          (err) => { throw new Error(err); }
        );
        return;
      }

      // =========== IMAGE GENERATION ===========
      if (genType === 'image') {
        let endpoint = '/v1/draw/completions';
        const body: any = { model: currentModel.id, prompt: finalPrompt };

        if (currentModel.providerType === 'grsai') {
          if (currentModel.id.startsWith('nano-banana')) {
            endpoint = '/v1/draw/nano-banana';
          }
          body.size = resolution === '2k' ? '2K' : '1K';
          if (inputImages.length > 0) body.urls = inputImages;
        }

        const submitResult = await apiRequest(config, endpoint, body);
        if (!submitResult.success) throw new Error(submitResult.error || '提交失败');

        const taskId = submitResult.data?.id || submitResult.data?.taskId || submitResult.data?.data?.id;
        if (!taskId) {
          const directUrl = submitResult.data?.data?.url || submitResult.data?.url ||
                           submitResult.data?.data?.images?.[0]?.url || submitResult.data?.images?.[0]?.url;
          if (directUrl) {
            updateNode(node.id, { status: 'completed', resultUrl: directUrl, imageUrl: directUrl });
            addHistory({ type: 'image', url: directUrl, prompt: finalPrompt, model: currentModel.name, nodeId: node.id });
            setGenStatus('done');
            return;
          }
          throw new Error('未获取到任务ID');
        }

        const pollResult = await pollTaskResult(config, taskId, (progress, status) => {
          console.log(`[GEN] Progress: ${progress}% - ${status}`);
        });

        if (pollResult.status === 'completed' && pollResult.resultUrl) {
          updateNode(node.id, { status: 'completed', resultUrl: pollResult.resultUrl, imageUrl: pollResult.resultUrl });
          addHistory({ type: 'image', url: pollResult.resultUrl, prompt: finalPrompt, model: currentModel.name, nodeId: node.id });
          setGenStatus('done');
        } else {
          throw new Error(pollResult.error || '生成失败');
        }
        return;
      }

      // =========== VIDEO GENERATION ===========
      if (genType === 'video') {
        let endpoint = '/v1/video/sora-video';
        const body: any = { model: currentModel.id, prompt: finalPrompt };

        if (currentModel.providerType === 'grsai') {
          if (currentModel.id.startsWith('veo')) {
            endpoint = '/v1/video/veo';
            body.aspectRatio = aspectRatio;
            if (node.firstFrameUrl) body.firstFrameUrl = node.firstFrameUrl;
            if (node.lastFrameUrl) body.lastFrameUrl = node.lastFrameUrl;
          } else {
            body.aspectRatio = aspectRatio;
            body.duration = 10;
            body.size = 'small';
            if (inputImages.length > 0) body.url = inputImages[0];
          }
        }

        const submitResult = await apiRequest(config, endpoint, body);
        if (!submitResult.success) throw new Error(submitResult.error || '视频提交失败');

        const taskId = submitResult.data?.id || submitResult.data?.taskId || submitResult.data?.data?.id;
        if (!taskId) throw new Error('未获取到视频任务ID');

        const pollResult = await pollTaskResult(config, taskId, (progress, status) => {
          console.log(`[VIDEO] Progress: ${progress}% - ${status}`);
        }, 180, 5000);

        if (pollResult.status === 'completed' && pollResult.resultUrl) {
          updateNode(node.id, { status: 'completed', resultUrl: pollResult.resultUrl, videoUrl: pollResult.resultUrl });
          addHistory({ type: 'video', url: pollResult.resultUrl, prompt: finalPrompt, model: currentModel.name, nodeId: node.id });
          setGenStatus('done');
        } else {
          throw new Error(pollResult.error || '视频生成失败');
        }
        return;
      }

    } catch (err: any) {
      console.error('[GEN ERROR]', err);
      setGenError(err.message || '生成失败');
      setGenStatus('error');
      updateNode(node.id, { status: 'error', error: err.message });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const modeLabel = getModeLabel();

  return (
    <div className="node-gen-panel" onMouseDown={e => e.stopPropagation()}>
      {/* Skill pills (available for ALL node types now) */}
      <div className="node-gen-skills">
        <button
          className={`node-gen-skill-pill ${useScreenwritingSkill ? 'active' : ''}`}
          onClick={() => setUseScreenwritingSkill(!useScreenwritingSkill)}
          title="启用山音超级编剧大师技能"
        >
          🎬 编剧大师
        </button>
        {useScreenwritingSkill && (
          <select
            className="node-gen-select"
            value={screenwritingFormat}
            onChange={e => setScreenwritingFormat(e.target.value)}
          >
            {SCREENWRITING_FORMATS.map(f => (
              <option key={f.id} value={f.id}>{f.icon} {f.name} ({f.duration})</option>
            ))}
          </select>
        )}
      </div>

      {/* Connected inputs display */}
      <div className="node-gen-top">
        {modeLabel && <span className="node-gen-mode">{modeLabel}</span>}
        {inputImages.length > 0 && (
          <div className="node-gen-thumbs">
            {inputImages.map((url, i) => (
              <img key={i} src={url} alt="" className="node-gen-thumb" />
            ))}
          </div>
        )}
        {inputVideos.length > 0 && (
          <div className="node-gen-thumbs">
            {inputVideos.map((_url, i) => (
              <div key={i} className="node-gen-thumb node-gen-thumb-video" title="已连接视频">🎬</div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt input */}
      <textarea
        className="node-gen-input"
        placeholder="描述你想要生成的内容，按/呼出指令，@引用素材"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
      />

      {/* Error display */}
      {genStatus === 'error' && genError && (
        <div className="node-gen-error" onClick={() => { setGenStatus('idle'); setGenError(''); }}>
          ⚠️ {genError} <span style={{opacity:0.5, fontSize:'10px'}}>点击清除</span>
        </div>
      )}

      {/* Controls row */}
      <div className="node-gen-controls">
        <button
          className="node-gen-model-btn"
          onClick={() => setShowModelPicker(!showModelPicker)}
        >
          <span className="node-gen-model-icon">◆</span>
          <span>{currentModel?.name || '选择模型'}</span>
          <span className="node-gen-chevron">▾</span>
        </button>

        {showModelPicker && (
          <div className="node-gen-model-picker">
            {/* Model category tabs */}
            <div className="node-gen-model-tabs">
              {MODEL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`node-gen-model-tab ${modelCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setModelCategory(cat.id)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Model list */}
            <div className="node-gen-model-list">
              {models.length === 0 && (
                <div className="node-gen-no-models">该分类无可用模型，请在设置中启用</div>
              )}
              {models.map(m => (
                <button
                  key={`${m.providerId}-${m.id}-${m.modelType}`}
                  className={`node-gen-model-option ${selectedModel === m.id ? 'active' : ''}`}
                  onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                >
                  <span className="node-gen-model-icon-sm">{m.icon}</span>
                  <div>
                    <div className="node-gen-model-name">{m.name}</div>
                    <div className="node-gen-model-provider">{m.provider}</div>
                  </div>
                  <span className="node-gen-model-type-badge">
                    {m.modelType === 'chat' ? '📝' : 
                     m.modelType.includes('image') ? '🖼️' : '🎬'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <select className="node-gen-select" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
          <option value="1:1">1:1</option>
          <option value="4:3">4:3</option>
        </select>

        <select className="node-gen-select" value={resolution} onChange={e => setResolution(e.target.value)}>
          <option value="1k">1K</option>
          <option value="2k">2K</option>
        </select>

        {/* Generate button */}
        <button
          className="node-gen-send"
          onClick={handleGenerate}
          disabled={genStatus === 'generating'}
          title="生成 (Enter)"
        >
          {genStatus === 'generating' ? '⏳' : '↑'}
        </button>
      </div>
    </div>
  );
}
