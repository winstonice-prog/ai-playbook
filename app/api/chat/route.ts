import { NextRequest } from 'next/server'
import { AIModel } from '@/lib/ai-models'

export const runtime = 'edge'

interface ImageInput { dataUrl: string; mimeType: string }

async function callOpenAI(model: AIModel, systemPrompt: string, userMessage: string, apiKey: string, images: ImageInput[] | null) {
  const messages: any[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })

  const userContent: any[] = []
  if (userMessage) userContent.push({ type: 'text', text: userMessage })
  if (images) {
    for (const img of images) {
      userContent.push({ type: 'image_url', image_url: { url: img.dataUrl } })
    }
  }
  messages.push({ role: 'user', content: userContent.length === 1 && userContent[0].type === 'text' ? userContent[0].text : userContent })

  const res = await fetch(`${model.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: model.modelId, messages, stream: true }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${model.name}: ${err}`)
  }
  return res
}

async function callAnthropic(model: AIModel, systemPrompt: string, userMessage: string, apiKey: string, images: ImageInput[] | null) {
  const content: any[] = []
  if (images) {
    for (const img of images) {
      const base64 = img.dataUrl.split(',')[1]
      content.push({ type: 'image', source: { type: 'base64', media_type: img.mimeType, data: base64 } })
    }
  }
  if (userMessage) content.push({ type: 'text', text: userMessage })

  const body: any = {
    model: model.modelId, max_tokens: 4096,
    messages: [{ role: 'user', content }],
    stream: true,
  }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch(`${model.baseUrl}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${model.name}: ${err}`)
  }
  return res
}

async function callGemini(model: AIModel, systemPrompt: string, userMessage: string, apiKey: string, images: ImageInput[] | null) {
  const parts: any[] = []
  if (systemPrompt) parts.push({ text: systemPrompt })
  if (images) {
    for (const img of images) {
      const base64 = img.dataUrl.split(',')[1]
      parts.push({ inlineData: { mimeType: img.mimeType, data: base64 } })
    }
  }
  if (userMessage) parts.push({ text: userMessage })

  const contents: any[] = []
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] })
    contents.push({ role: 'model', parts: [{ text: '明白。' }] })
  }
  contents.push({ role: 'user', parts })

  const url = `${model.baseUrl}/models/${model.modelId}:streamGenerateContent?alt=sse&key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${model.name}: ${err}`)
  }
  return res
}

function transformAnthropicStream(stream: ReadableStream): ReadableStream {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) { controller.enqueue(encoder.encode('data: [DONE]\n\n')); controller.close(); break }
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n'); buffer = lines.pop() || ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: data.delta.text } }] })}\n\n`))
                }
              } catch { /* skip */ }
            }
          }
        }
      } catch (e) { controller.error(e) }
    },
  })
}

function transformGeminiStream(stream: ReadableStream): ReadableStream {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) { controller.enqueue(encoder.encode('data: [DONE]\n\n')); controller.close(); break }
          const text = decoder.decode(value, { stream: true })
          for (const line of text.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text
                if (textPart) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: textPart } }] })}\n\n`))
              } catch { /* skip */ }
            }
          }
        }
      } catch (e) { controller.error(e) }
    },
  })
}

export async function POST(req: NextRequest) {
  const { model, message, rulePrompt, apiKey, images } = await req.json()
  const m: AIModel = model

  if (!apiKey) return new Response('请先配置 API Key', { status: 401 })

  try {
    let responseStream: ReadableStream
    if (m.apiType === 'openai') {
      const res = await callOpenAI(m, rulePrompt || '', message || '', apiKey, images)
      responseStream = res.body!
    } else if (m.apiType === 'anthropic') {
      const res = await callAnthropic(m, rulePrompt || '', message || '', apiKey, images)
      responseStream = transformAnthropicStream(res.body!)
    } else if (m.apiType === 'gemini') {
      const res = await callGemini(m, rulePrompt || '', message || '', apiKey, images)
      responseStream = transformGeminiStream(res.body!)
    } else {
      return new Response('不支持的 API 类型', { status: 400 })
    }

    return new Response(responseStream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (e: any) {
    return new Response(e.message || '请求失败', { status: 500 })
  }
}
