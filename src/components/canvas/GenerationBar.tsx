import { useState, useEffect } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useGenerationStore } from '../../stores/generationStore';

export default function GenerationBar() {
  const { selectedNodeId, nodes, updateNode, addHistory } = useCanvasStore();
  const { providers } = useGenerationStore();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [resolution, setResolution] = useState('1k');
  const [scale, setScale] = useState('1x');
  const [genStatus, setGenStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [genError, setGenError] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Sync prompt from node
  useEffect(() => {
    if (selectedNode?.prompt) setPrompt(selectedNode.prompt);
    else setPrompt('');
    setGenStatus('idle');
  }, [selectedNodeId]);

  // Only show for actionable nodes
  if (!selectedNode || selectedNode.type === 'upload') return null;

  // Get connected input nodes
  const getInputImages = () => {
    const conns = useCanvasStore.getState().connections.filter(c => c.toNodeId === selectedNode.id);
    return conns.map(c => {
      const fromNode = nodes.find(n => n.id === c.fromNodeId);
      return fromNode?.imageUrl || fromNode?.resultUrl;
    }).filter(Boolean) as string[];
  };

  const inputImages = getInputImages();

  // All available models based on node type
  const getModels = () => {
    const allModels: { id: string; name: string; provider: string; providerId: string; icon: string; providerType: string }[] = [];
    providers.forEach(p => {
      if (!p.enabled) return;
      p.models.forEach(m => {
        const isImage = m.type === 'text-to-image' || m.type === 'image-to-image';
        const isVideo = m.type === 'text-to-video' || m.type === 'image-to-video';
        const isText = m.type === 'chat';
        if (selectedNode.type === 'image' && isImage) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        } else if (selectedNode.type === 'video' && isVideo) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        } else if (selectedNode.type === 'text' && isText) {
          allModels.push({ id: m.id, name: m.name, provider: p.name, providerId: p.id, icon: p.icon, providerType: p.type });
        }
      });
    });
    return allModels;
  };

  const models = getModels();
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  const handleGenerate = async () => {
    if (!prompt.trim() && !inputImages.length) return;
    if (!currentModel) { setGenError('请选择模型'); setGenStatus('error'); return; }

    // Find the provider for the selected model
    const provider = providers.find(p => p.id === currentModel.providerId);
    if (!provider) { setGenError('未找到供应商'); setGenStatus('error'); return; }
    if (!provider.apiKey) { setGenError('请先在设置中配置 API Key'); setGenStatus('error'); return; }

    setGenStatus('generating');
    setGenError('');
    updateNode(selectedNode.id, { status: 'generating', prompt, model: currentModel.id });

    try {
      const { apiRequest, pollTaskResult, streamChatRequest } = await import('../../services/api-client');
      const config = { baseUrl: provider.baseUrl, apiKey: provider.apiKey };

      // =========== TEXT NODE (Chat) ===========
      if (selectedNode.type === 'text' && currentModel.providerType !== 'grsai') {
        // DeepSeek or other chat providers
        let result = '';
        await streamChatRequest(
          config,
          [{ role: 'user', content: prompt }],
          currentModel.id,
          (chunk) => { result += chunk; updateNode(selectedNode.id, { text: result }); },
          () => {
            updateNode(selectedNode.id, { status: 'completed' });
            setGenStatus('done');
          },
          (err) => { throw new Error(err); }
        );
        return;
      }

      // =========== IMAGE NODE ===========
      if (selectedNode.type === 'image' || (selectedNode.type === 'text' && currentModel.providerType === 'grsai')) {
        let endpoint = '/v1/draw/completions';
        const body: any = { model: currentModel.id, prompt };

        // GRS AI routing
        if (currentModel.providerType === 'grsai') {
          if (currentModel.id.startsWith('nano-banana')) {
            endpoint = '/v1/draw/nano-banana';
            body.aspectRatio = resolution === '1k' ? 'auto' : '16:9';
          } else {
            body.size = resolution === '2k' ? '2K' : '1K';
            body.variants = 1;
          }
          // Include reference image URLs if connected
          if (inputImages.length > 0) {
            body.urls = inputImages;
          }
        }

        const submitResult = await apiRequest(config, endpoint, body);
        console.log('[GEN] Submit result:', submitResult);

        if (!submitResult.success) {
          throw new Error(submitResult.error || '提交失败');
        }

        // Extract task ID from response
        const taskId = submitResult.data?.id || submitResult.data?.taskId || submitResult.data?.data?.id;
        if (!taskId) {
          // Some APIs return result directly
          const directUrl = submitResult.data?.data?.url || submitResult.data?.url || 
                           submitResult.data?.data?.images?.[0]?.url || submitResult.data?.images?.[0]?.url;
          if (directUrl) {
            updateNode(selectedNode.id, { status: 'completed', resultUrl: directUrl, imageUrl: directUrl });
            addHistory({ type: 'image', url: directUrl, prompt, model: currentModel.name, nodeId: selectedNode.id });
            setGenStatus('done');
            return;
          }
          throw new Error('未获取到任务ID: ' + JSON.stringify(submitResult.data).slice(0, 200));
        }

        // Poll for result
        const pollResult = await pollTaskResult(config, taskId, (progress, status) => {
          updateNode(selectedNode.id, { status: 'generating' });
          console.log(`[GEN] Progress: ${progress}% - ${status}`);
        });

        if (pollResult.status === 'completed' && pollResult.resultUrl) {
          updateNode(selectedNode.id, { status: 'completed', resultUrl: pollResult.resultUrl, imageUrl: pollResult.resultUrl });
          addHistory({ type: 'image', url: pollResult.resultUrl, prompt, model: currentModel.name, nodeId: selectedNode.id });
          setGenStatus('done');
        } else {
          throw new Error(pollResult.error || '生成失败');
        }
        return;
      }

      // =========== VIDEO NODE ===========
      if (selectedNode.type === 'video') {
        let endpoint = '/v1/video/sora-video';
        const body: any = { model: currentModel.id, prompt };

        if (currentModel.providerType === 'grsai') {
          if (currentModel.id.startsWith('veo')) {
            endpoint = '/v1/video/veo';
            body.aspectRatio = '16:9';
            if (selectedNode.firstFrameUrl) body.firstFrameUrl = selectedNode.firstFrameUrl;
            if (selectedNode.lastFrameUrl) body.lastFrameUrl = selectedNode.lastFrameUrl;
          } else {
            // Sora-2
            body.aspectRatio = '16:9';
            body.duration = 10;
            body.size = 'small';
            if (inputImages.length > 0) body.url = inputImages[0];
          }
        }

        const submitResult = await apiRequest(config, endpoint, body);
        console.log('[VIDEO] Submit result:', submitResult);

        if (!submitResult.success) throw new Error(submitResult.error || '视频提交失败');

        const taskId = submitResult.data?.id || submitResult.data?.taskId || submitResult.data?.data?.id;
        if (!taskId) throw new Error('未获取到视频任务ID');

        const pollResult = await pollTaskResult(config, taskId, (progress, status) => {
          updateNode(selectedNode.id, { status: 'generating' });
          console.log(`[VIDEO] Progress: ${progress}% - ${status}`);
        }, 180, 5000);

        if (pollResult.status === 'completed' && pollResult.resultUrl) {
          updateNode(selectedNode.id, { status: 'completed', resultUrl: pollResult.resultUrl, videoUrl: pollResult.resultUrl });
          addHistory({ type: 'video', url: pollResult.resultUrl, prompt, model: currentModel.name, nodeId: selectedNode.id });
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
      updateNode(selectedNode.id, { status: 'error', error: err.message });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const modeLabel = selectedNode.type === 'text'
    ? (selectedNode.textMode === 'text2video' ? '文生视频' : selectedNode.textMode === 'img2prompt' ? '图片反推' : '')
    : selectedNode.type === 'image' && selectedNode.imageMode
      ? { 'img2img': '图生图', 'img2video': '图生视频', 'bg-replace': '换背景', 'first-frame': '首帧生视频' }[selectedNode.imageMode] || ''
      : selectedNode.type === 'video' && selectedNode.videoMode
        ? { 'text2video': '文生视频', 'img-ref': '图片参考', 'first-last-frame': '首尾帧' }[selectedNode.videoMode] || ''
        : '';

  return (
    <div className="generation-bar" onMouseDown={e => e.stopPropagation()}>
      {/* Mode Badge */}
      {modeLabel && <span className="gen-bar-mode">{modeLabel}</span>}

      {/* Input images from connections */}
      {inputImages.length > 0 && (
        <div className="gen-bar-thumbs">
          {inputImages.map((url, i) => (
            <img key={i} src={url} alt="" className="gen-bar-thumb" />
          ))}
        </div>
      )}

      {/* Prompt input */}
      <textarea
        className="gen-bar-input"
        placeholder="描述你想要生成的内容，并在下方调整生成参数。（按下Enter 生成，Shift+Enter 换行）"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />

      {/* Error display */}
      {genStatus === 'error' && genError && (
        <span className="gen-bar-error" title={genError}>⚠️</span>
      )}

      {/* Model selector */}
      <div className="gen-bar-controls">
        <button className="gen-bar-model-btn" onClick={() => setShowModelPicker(!showModelPicker)}>
          <span className="gen-bar-model-icon">◆</span>
          <span>{currentModel?.name || '选择模型'}</span>
          <span className="gen-bar-chevron">▾</span>
        </button>

        {showModelPicker && (
          <div className="gen-bar-model-picker">
            {models.length === 0 && (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                无可用模型，请在设置中启用供应商并配置 API Key
              </div>
            )}
            {models.map(m => (
              <button
                key={`${m.providerId}-${m.id}`}
                className={`gen-bar-model-option ${selectedModel === m.id ? 'active' : ''}`}
                onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
              >
                <span className="gen-bar-model-option-icon">{m.icon}</span>
                <div>
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.provider}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <select className="gen-bar-select" value={resolution} onChange={e => setResolution(e.target.value)}>
          <option value="1k">1k</option>
          <option value="2k">2k</option>
          <option value="4k">4k</option>
        </select>

        <select className="gen-bar-select" value={scale} onChange={e => setScale(e.target.value)}>
          <option value="1x">1x</option>
          <option value="2x">2x</option>
          <option value="4x">4x</option>
        </select>
      </div>

      {/* Generate button */}
      <button
        className="gen-bar-send"
        onClick={handleGenerate}
        disabled={genStatus === 'generating'}
      >
        {genStatus === 'generating' ? '⏳' : '⬆'}
      </button>
    </div>
  );
}
