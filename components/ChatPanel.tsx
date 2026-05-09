'use client'

import { useChatStore } from '@/lib/store'
import { useEffect, useRef, useState } from 'react'
import { Send, Square, Sparkles, AlertTriangle, ImagePlus, X, Image } from 'lucide-react'
import { t } from '@/lib/i18n'
import ActionPrompt from '@/components/ActionPrompt'

export default function ChatPanel() {
  const input = useChatStore((s) => s.input)
  const setInput = useChatStore((s) => s.setInput)
  const modelStatuses = useChatStore((s) => s.modelStatuses)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const sending = useChatStore((s) => s.sending)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const abortSend = useChatStore((s) => s.abortSend)
  const attachedImages = useChatStore((s) => s.attachedImages)
  const addImage = useChatStore((s) => s.addImage)
  const removeImage = useChatStore((s) => s.removeImage)
  const clearImages = useChatStore((s) => s.clearImages)
  const lang = useChatStore((s) => s.lang)
  const [multimodal, setMultimodal] = useState(true)
  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [modelStatuses])

  const handleSend = () => {
    const canSend = (input.trim() || attachedImages.length > 0) && !sending
    if (!canSend) return
    // If multimodal off, clear images before sending
    if (!multimodal) clearImages()
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!multimodal) return
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) addImage(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of files) addImage(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!multimodal) return
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (!files) return
    for (const file of files) {
      if (file.type.startsWith('image/')) addImage(file)
    }
  }

  const allModels = [...models, ...customModels]
  const enabledModels = allModels.filter((m) => m.enabled)
  const columnCount = Math.min(enabledModels.length || 1, 3)

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {modelStatuses.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4 py-12">
            <div className="relative">
              <Sparkles size={48} className="text-panel-accent/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  {['#10a37f', '#d97757', '#4285f4', '#4d6bfe'].map((c, i) => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: c, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-center">{T('emptyChatPrompt1')}</p>
            <p className="text-xs text-gray-700 text-center max-w-xs">{T('emptyChatPrompt2')}</p>
          </div>
        )}

        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          {modelStatuses.map((status) => {
            const model = enabledModels.find((m) => m.id === status.modelId)
            if (!model) return null
            return (
              <div key={status.modelId} className="bg-panel-card border border-panel-border rounded-lg overflow-hidden"
                style={{ borderTopColor: model.color, borderTopWidth: 2 }}>
                <div className="px-3 py-2 border-b border-panel-border flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                  <span className="text-xs font-medium">{model.name}</span>
                  <span className="text-[10px] text-gray-600">{model.provider}</span>
                  <div className="ml-auto">
                    {status.status === 'loading' && <span className="flex gap-0.5">{[0,1,2].map(i=><span key={i} className="w-1 h-1 rounded-full bg-panel-accent animate-bounce" style={{animationDelay:`${i*0.2}s`}}/>)}</span>}
                    {status.status === 'done' && status.triggeredRules.length > 0 && <AlertTriangle size={10} className="text-panel-warn" />}
                    {status.status === 'error' && <span className="text-[10px] text-panel-danger">错误</span>}
                  </div>
                </div>
                <div className="p-3 text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto text-gray-300">
                  {status.status === 'loading' && !status.response && <span className="text-gray-700 italic">{T('thinking')}</span>}
                  {status.response}
                  {status.status === 'error' && !status.response && <span className="text-panel-danger">{status.error}</span>}
                </div>
                {status.triggeredRules.length > 0 && (
                  <div className="px-3 py-1.5 bg-panel-warn/5 border-t border-panel-warn/20 text-[10px] text-panel-warn flex items-center gap-1">
                    <AlertTriangle size={10} />触发 {status.triggeredRules.length} 条规则
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Post-conversation actions */}
        <ActionPrompt
          visible={modelStatuses.length > 0 && modelStatuses.every((s) => s.status === 'done' || s.status === 'error') && !sending}
          onAction={(prompt) => { if (prompt) setInput(prompt) }}
        />
      </div>

      {/* Input */}
      <div className="border-t border-panel-border p-3" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {/* Image previews */}
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.dataUrl} alt={img.name} className="h-16 w-16 object-cover rounded border border-panel-border" />
                <button onClick={() => removeImage(img.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-panel-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-panel-card border border-panel-border rounded-lg px-3 py-2 focus-within:border-panel-accent transition-colors">
          {/* Multimodal toggle */}
          <button
            onClick={() => setMultimodal(!multimodal)}
            className={`p-1.5 rounded transition-colors ${multimodal ? 'text-panel-accent bg-panel-accent-soft' : 'text-gray-500 hover:text-gray-300'}`}
            title={multimodal ? T('multimodal') : T('textOnly')}>
            <Image size={14} />
          </button>
          {multimodal && <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded text-gray-500 hover:text-panel-accent hover:bg-panel-accent-soft transition-colors" title="添加图片">
              <ImagePlus size={14} />
            </button>
          </>}
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} onPaste={handlePaste}
            placeholder={enabledModels.length === 0 ? T('chatPlaceholderNoModel') : multimodal ? T('chatPlaceholder') : lang === 'zh' ? '输入消息，Enter 发送，Shift+Enter 换行' : 'Type a message, Enter to send, Shift+Enter for newline'}
            rows={1} disabled={sending}
            className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-200 placeholder-gray-600 disabled:opacity-40" />
          {sending ? (
            <button onClick={abortSend} className="p-1.5 rounded text-panel-danger hover:bg-panel-danger/10 transition-colors"><Square size={16} /></button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim() && attachedImages.length === 0}
              className="p-1.5 rounded text-panel-accent hover:bg-panel-accent-soft disabled:opacity-20 transition-colors"><Send size={16} /></button>
          )}
        </div>
      </div>
    </div>
  )
}
