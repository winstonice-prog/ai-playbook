import { NextRequest } from 'next/server'
import { AIModel } from '@/lib/ai-models'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { model, apiKey } = await req.json()
  const m: AIModel = model

  if (!apiKey) return Response.json({ ok: false, message: '未提供 API Key' })

  try {
    let res: Response

    if (m.apiType === 'openai' || m.apiType === 'anthropic') {
      const isAnthropic = m.apiType === 'anthropic'
      const url = isAnthropic ? `${m.baseUrl}/messages` : `${m.baseUrl}/models`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (isAnthropic) {
        headers['x-api-key'] = apiKey
        headers['anthropic-version'] = '2023-06-01'
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      res = await fetch(url, {
        method: isAnthropic ? 'POST' : 'GET',
        headers,
        body: isAnthropic ? JSON.stringify({
          model: m.modelId,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }],
        }) : undefined,
        signal: AbortSignal.timeout(8000),
      })
    } else if (m.apiType === 'gemini') {
      res = await fetch(
        `${m.baseUrl}/models?key=${apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      )
    } else {
      return Response.json({ ok: false, message: `不支持的 API 类型: ${m.apiType}` })
    }

    if (res.ok || res.status === 429) {
      // 429 = rate limited but key is valid
      return Response.json({ ok: true, message: res.status === 429 ? 'Key 有效（被限流）' : '连接成功' })
    }

    if (res.status === 401 || res.status === 403) {
      return Response.json({ ok: false, message: 'Key 无效或权限不足' })
    }

    const errText = await res.text()
    return Response.json({ ok: false, message: `错误 (${res.status}): ${errText.slice(0, 100)}` })
  } catch (e: any) {
    return Response.json({ ok: false, message: e.message || '网络请求失败' })
  }
}
