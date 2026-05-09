'use client'

import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/lib/store'
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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)

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
      if (item.type.startsWith('image/')) { e.preventDefault(); const f = item.getAsFile(); if (f) addImage(f) }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return
    for (const file of files) addImage(file); e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!multimodal) return
    e.preventDefault()
    const files = e.dataTransfer?.files; if (!files) return
    for (const file of files) { if (file.type.startsWith('image/')) addImage(file) }
  }

  const allModels = [...models, ...customModels]
  const enabledModels = allModels.filter((m) => m.enabled)
  const col = Math.min(enabledModels.length || 1, 3)

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
        {modelStatuses.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted gap-5">
            <div className="w-16 h-16 rounded-2xl bg-surface-card border border-border flex items-center justify-center">
              <Sparkles size={28} className="text-accent/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[15px] font-medium text-text-secondary">{T('emptyChatPrompt1')}</p>
              <p className="text-[13px] text-text-muted">{T('emptyChatPrompt2')}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${col}, 1fr)` }}>
          {modelStatuses.map((status) => {
            const model = enabledModels.find((m) => m.id === status.modelId)
            if (!model) return null
            return (
              <div key={status.modelId}
                className="bg-surface-card border border-border rounded-xl overflow-hidden shadow-sm"
                style={{ borderTopColor: model.color, borderTopWidth: 3 }}>
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: model.color }} />
                  <span className="text-[13px] font-semibold text-text-primary">{model.name}</span>
                  <span className="text-[11px] text-text-muted font-normal">{model.provider}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {status.status === 'loading' && (
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </span>
                    )}
                    {status.status === 'done' && status.triggeredRules.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-amber"><AlertTriangle size={11} />{status.triggeredRules.length}</span>
                    )}
                    {status.status === 'error' && <span className="text-[11px] text-red">Error</span>}
                  </div>
                </div>
                <div className="p-4 text-[13px] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto text-text-secondary">
                  {status.status === 'loading' && !status.response ? (
                    <span className="text-text-muted italic">Thinking…</span>
                  ) : status.response}
                  {status.status === 'error' && !status.response && (
                    <span className="text-red">{status.error}</span>
                  )}
                </div>
                {status.triggeredRules.length > 0 && (
                  <div className="px-4 py-2 bg-amber/5 border-t border-amber/10 text-[11px] text-amber flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={11} />{status.triggeredRules.length} rule{status.triggeredRules.length > 1 ? 's' : ''} triggered
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <ActionPrompt
          visible={modelStatuses.length > 0 && modelStatuses.every((s) => s.status === 'done' || s.status === 'error') && !sending}
          onAction={(prompt) => { if (prompt) setInput(prompt) }}
        />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {attachedImages.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {attachedImages.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.dataUrl} alt={img.name} className="h-16 w-16 object-cover rounded-lg border border-border" />
                <button onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-surface-card border border-border rounded-xl px-4 py-2.5 focus-within:border-accent/40 focus-within:shadow-sm transition-all">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />

          <button onClick={() => setMultimodal(!multimodal)}
            className={`p-1.5 rounded-lg transition-colors ${multimodal ? 'text-accent bg-accent-soft' : 'text-text-muted hover:text-text-secondary'}`}
            title={multimodal ? T('multimodal') : T('textOnly')}>
            <Image size={16} />
          </button>

          {multimodal && (
            <button onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-soft transition-colors">
              <ImagePlus size={16} />
            </button>
          )}

          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} onPaste={handlePaste}
            placeholder={enabledModels.length === 0 ? T('chatPlaceholderNoModel') : T('chatPlaceholder')}
            rows={1} disabled={sending}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] text-text-primary placeholder:text-text-muted/60 disabled:opacity-40 py-0.5" />

          {sending ? (
            <button onClick={abortSend} className="p-1.5 rounded-lg text-red hover:bg-red/10 transition-colors"><Square size={15} /></button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim() && attachedImages.length === 0}
              className="p-1.5 rounded-lg text-accent hover:bg-accent-soft disabled:opacity-20 disabled:hover:bg-transparent transition-colors"><Send size={16} /></button>
          )}
        </div>

        <div className="flex justify-between mt-2 px-1">
          <span className="text-[11px] text-text-muted">{T('sendingToAll', { n: enabledModels.length })}</span>
          <span className="text-[11px] text-text-muted">{T('enterToSend')}</span>
        </div>
      </div>
    </div>
  )
}
