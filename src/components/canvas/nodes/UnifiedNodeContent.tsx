import { useState, useRef, useEffect } from 'react';
import { useCanvasStore, type CanvasNodeData } from '../../../stores/canvasStore';

interface Props { node: CanvasNodeData; }

/**
 * 统一节点内容组件 - 所有节点类型共享同一基座
 * 所有节点都支持：文字输入、图片上传、视频展示
 * 区别仅在于初始布局重点不同
 */
export default function UnifiedNodeContent({ node }: Props) {
  const { updateNode } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Reset imgError when imageUrl changes  
  useEffect(() => {
    setImgError(false);
  }, [node.imageUrl, node.resultUrl]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video')) {
      updateNode(node.id, { videoUrl: url });
    } else {
      setImgError(false);
      updateNode(node.id, { imageUrl: url, resultUrl: undefined });
    }
  };

  const imgSrc = node.resultUrl || node.imageUrl;
  const videoSrc = node.videoUrl;
  const hasText = !!(node.text);
  const hasImage = !!(imgSrc && !imgError);
  const hasVideo = !!videoSrc;

  // Determine which sections to show based on content + node type
  // Text nodes: always show text area prominently
  // Image/Video nodes: show media area prominently, text below
  const isTextPrimary = node.type === 'text';

  return (
    <div className="unified-node-content" onDoubleClick={handleDoubleClick}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* === TEXT AREA (always available) === */}
      <div className={`unified-text-section ${isTextPrimary ? 'primary' : 'secondary'}`}>
        <textarea
          ref={textareaRef}
          className="unified-text-editor"
          value={node.text || ''}
          placeholder={isTextPrimary 
            ? '写下你想讲的故事、场景或角色设定…' 
            : '输入描述文字（可选）…'}
          onChange={e => updateNode(node.id, { text: e.target.value })}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          rows={isTextPrimary ? 4 : (hasText ? 3 : 1)}
        />
      </div>

      {/* === MEDIA AREA === */}
      <div className="unified-media-section">
        {/* Image preview */}
        {hasImage && (
          <div className="unified-media-preview">
            <img
              src={imgSrc}
              alt=""
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
            <div className="unified-media-overlay">
              <button
                className="unified-media-action"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                onMouseDown={e => e.stopPropagation()}
              >🔄 替换</button>
              <button
                className="unified-media-action"
                onClick={(e) => { e.stopPropagation(); updateNode(node.id, { imageUrl: undefined, resultUrl: undefined }); }}
                onMouseDown={e => e.stopPropagation()}
              >✕ 移除</button>
            </div>
            {node.status === 'completed' && node.resultUrl && (
              <div className="unified-media-badge">✅ 已生成</div>
            )}
          </div>
        )}

        {/* Video preview */}
        {hasVideo && (
          <div className="unified-media-preview">
            <video
              src={videoSrc}
              controls
              muted
              loop
              className="unified-video-player"
              onMouseDown={e => e.stopPropagation()}
            />
            {node.status === 'completed' && (
              <div className="unified-media-badge">✅ 已生成</div>
            )}
          </div>
        )}

        {/* Image error state */}
        {imgError && imgSrc && (
          <div className="unified-media-error">
            <span>⚠️ 图片加载失败</span>
            <button
              className="unified-media-action-inline"
              onClick={(e) => {
                e.stopPropagation();
                setImgError(false);
                updateNode(node.id, { imageUrl: undefined, resultUrl: undefined, status: 'idle', error: undefined });
              }}
              onMouseDown={e => e.stopPropagation()}
            >🔄 重置</button>
          </div>
        )}

        {/* Upload / empty state (show when no media and not text-primary) */}
        {!hasImage && !hasVideo && !imgError && (
          <div className="unified-upload-area">
            <button
              className="unified-upload-btn"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              onMouseDown={e => e.stopPropagation()}
            >
              <span className="unified-upload-icon">
                {node.type === 'video' ? '🎬' : node.type === 'image' ? '🖼️' : '📎'}
              </span>
              <span className="unified-upload-text">
                {node.type === 'video' ? '上传视频/图片' : node.type === 'image' ? '上传图片' : '添加附件'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
