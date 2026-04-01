import { useState, useEffect } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../stores/canvasStore';
import { useGenerationStore } from '../../stores/generationStore';
import { SCREENWRITING_SYSTEM_PROMPT, SCREENWRITING_FORMATS } from '../../data/screenwriting-skills';

interface Props {
  node: CanvasNodeData;
}

/**
 * 节点附属生成面板 - 选中节点时显示在节点下方
 * 参考 LibLib.tv 的交互模式
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
      if (fromNode?.type === 'text' && fromNode.text) return fromNode.text;
    }
    return '';
  };

  const inputImages = getInputImages();
  const inputText = getInputText();

  // Get mode label
  const getModeLabel = () => {
    if (node.type === 'text') {
      return node.textMode === 'text2video' ? '文生视频' : node.textMode === 'img2prompt' ? '图片反推' : '';
    }
    if (node.type === 'image') {
      if (inputImages.length > 0) return '图生图';
      return '文生图';
    }
    if (node.type === 'video') {
      if (inputImages.length > 0) return '图生视频';
      return '文生视频';
    }
    return '';
  };

  // Available models based on node type
  const getModels = () => {
    const allModels: { id: string; name: string; provider: string; providerId: string; icon: string; providerType: string }[] = [];
    providers.forEach(p => {
      if (!p.enabled) return;
      p.models.forEach(m => {
        const isImage = m.type === 'text-to-image' || m.type === 'image-to-image';
        const isVideo = m.type === 'text-to-video' || m.type === 'image-to-video';
        const isChat = m.type === 'chat';
        if (node.type === 'image' && isImage) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        } else if (node.type === 'video' && isVideo) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        } else if (node.type === 'text' && (isChat || isImage)) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        }
      });
    });
    return allModels;
  };

  const models = getModels();
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  // Auto-fill prompt from connected text node
  useEffect(() => {
    if (inputText && !prompt) setPrompt(inputText);
  }, [inputText]);

  const handleGenerate = async () => {
    const finalPrompt = prompt.trim() || inputText;
    if (!finalPrompt && !inputImages.length) return;
    if (!currentModel) { setGenError('请先选择模型'); setGenStatus('error'); return; }

    const provider = providers.find(p => p.id === currentModel.providerId);
    if (!provider) { setGenError('未找到供应商'); setGenStatus('error'); return; }
    if (!provider.apiKey) { setGenError('请先在设置中配置 API Key'); setGenStatus('error'); return; }

    setGenStatus('generating');
    setGenError('');
    updateNode(node.id, { status: 'generating', prompt: finalPrompt, model: currentModel.id });

    try {
      const { apiRequest, pollTaskResult } = await import('../../services/api-client');
      const config = { baseUrl: provider.baseUrl, apiKey: provider.apiKey };

      // =========== IMAGE NODE ===========
      if (node.type === 'image') {
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
        console.log('[GEN] Submit:', submitResult);
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

      // =========== VIDEO NODE ===========
      if (node.type === 'video') {
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

      // =========== TEXT NODE (Chat) ===========
      if (node.type === 'text') {
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
      {/* Skill pills for text node */}
      {node.type === 'text' && (
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
      )}

      {/* Mode label + connected thumbnails */}
      <div className="node-gen-top">
        {modeLabel && <span className="node-gen-mode">{modeLabel}</span>}
        {inputImages.length > 0 && (
          <div className="node-gen-thumbs">
            {inputImages.map((url, i) => (
              <img key={i} src={url} alt="" className="node-gen-thumb" />
            ))}
            <button className="node-gen-thumb-add" title="添加参考图">+</button>
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
        <div className="node-gen-error">⚠️ {genError}</div>
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
            {models.length === 0 && (
              <div className="node-gen-no-models">无可用模型，请在设置中启用</div>
            )}
            {models.map(m => (
              <button
                key={`${m.providerId}-${m.id}`}
                className={`node-gen-model-option ${selectedModel === m.id ? 'active' : ''}`}
                onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
              >
                <span className="node-gen-model-icon-sm">{m.icon}</span>
                <div>
                  <div className="node-gen-model-name">{m.name}</div>
                  <div className="node-gen-model-provider">{m.provider}</div>
                </div>
              </button>
            ))}
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
