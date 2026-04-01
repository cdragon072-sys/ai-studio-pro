/**
 * 统一 API 客户端
 * 支持 GRS AI / KIE AI / DeepSeek / RunningHub / T8 Star
 * 包含异步任务轮询器
 */

export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TaskSubmitResult {
  taskId: string;
  status: string;
}

export interface TaskPollResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  resultUrls?: string[];
  error?: string;
}

/**
 * 发起 API 请求
 */
export async function apiRequest<T = any>(
  config: ApiClientConfig,
  endpoint: string,
  body: Record<string, any>,
  method: string = 'POST'
): Promise<ApiResponse<T>> {
  try {
    const url = `${config.baseUrl.replace(/\/$/, '')}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(config.timeout || 30000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    // GRS AI may return SSE-format (data: {...}) or plain JSON
    const textBody = await response.text();
    let data: any;

    // Try plain JSON first
    try {
      data = JSON.parse(textBody);
    } catch {
      // Handle SSE format: "data: {...}\n\ndata: [DONE]"
      const lines = textBody.split('\n').filter(l => l.startsWith('data: ') && l.trim() !== 'data: [DONE]');
      if (lines.length > 0) {
        const lastDataLine = lines[lines.length - 1];
        const jsonStr = lastDataLine.replace(/^data:\s*/, '');
        try {
          data = JSON.parse(jsonStr);
        } catch {
          return { success: false, error: `Invalid response format: ${textBody.slice(0, 300)}` };
        }
      } else {
        return { success: false, error: `Cannot parse response: ${textBody.slice(0, 300)}` };
      }
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * 异步任务轮询器
 * 用于 GRS AI 的 /v1/draw/result 轮询模式
 */
export async function pollTaskResult(
  config: ApiClientConfig,
  taskId: string,
  onProgress?: (progress: number, status: string) => void,
  maxAttempts: number = 120,
  intervalMs: number = 3000
): Promise<TaskPollResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await apiRequest<any>(config, '/v1/draw/result', { id: taskId });

    if (!result.success) {
      // Don't fail immediately on transient errors during polling
      if (attempt < 3) {
        console.warn(`[POLL] Attempt ${attempt} failed:`, result.error);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }
      return { status: 'failed', error: result.error };
    }

    const data = result.data;
    console.log(`[POLL] Attempt ${attempt}:`, JSON.stringify(data).slice(0, 500));

    // Unwrap nested data.data structure
    const inner = data?.data || data;

    // Check for completion
    const status = inner?.status || data?.status;
    if (status === 'completed' || status === 'success' || status === 'SUCCESS' || inner?.output) {
      // Extract URLs from various possible structures
      const urls = inner?.output?.images || inner?.output?.videos ||
                   inner?.images || inner?.videos ||
                   inner?.result?.images || inner?.result?.videos ||
                   data?.images || data?.videos || [];
      
      let resultUrl = '';
      if (typeof inner?.output === 'string') {
        resultUrl = inner.output;
      } else if (typeof inner?.url === 'string') {
        resultUrl = inner.url;
      } else if (typeof inner?.result_url === 'string') {
        resultUrl = inner.result_url;
      } else if (typeof inner?.result === 'string') {
        resultUrl = inner.result;
      } else if (typeof data?.url === 'string') {
        resultUrl = data.url;
      } else if (urls.length > 0) {
        const first = urls[0];
        resultUrl = typeof first === 'string' ? first : first?.url || first?.image_url || '';
      }

      console.log('[POLL] Completed! URL:', resultUrl);
      
      return {
        status: 'completed',
        progress: 100,
        resultUrl,
        resultUrls: urls.map((u: any) => typeof u === 'string' ? u : u?.url || u?.image_url),
      };
    }

    if (status === 'failed' || status === 'error' || status === 'FAILED') {
      return { status: 'failed', error: inner?.message || inner?.error || data?.message || 'Generation failed' };
    }

    // Still processing
    const progress = inner?.progress || data?.progress || Math.min(10 + attempt * 2, 90);
    onProgress?.(progress, status || 'processing');
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return { status: 'failed', error: 'Timeout: max polling attempts reached' };
}

/**
 * 流式请求 (用于 Chat API)
 */
export async function streamChatRequest(
  config: ApiClientConfig,
  messages: Array<{ role: string; content: string }>,
  model: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const url = `${config.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      onError(`HTTP ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err.message || 'Stream error');
  }
}
