'use client'

import ActionPrompt from '@/components/ActionPrompt'
import { useChatStore } from '@/lib/store'
import { useEffect, useRef } from 'react'
import { Send, Square, ArrowRight, User, AlertTriangle, Loader2 } from 'lucide-react'
import { t } from '@/lib/i18n'

export default function OrchPanel() {
  const lang = useChatStore((s) => s.lang)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const orchThread = useChatStore((s) => s.orchThread)
  const orchRunning = useChatStore((s) => s.orchRunning)
  const orchStop = useChatStore((s) => s.orchStop)
  const orchHumanInput = useChatStore((s) => s.orchHumanInput)
  const setOrchHumanInput = useChatStore((s) => s.setOrchHumanInput)
  const orchIntervene = useChatStore((s) => s.orchIntervene)
  const orchRoles = useChatStore((s) => s.orchRoles)
  const scrollRef = useRef<HTMLDivElement>(null)
  const allModels = [...models, ...customModels]
  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [orchThread])

  const getColor = (from: string) => allModels.find((m) => m.id === from)?.color || '#7c6ff7'

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
        {orchThread.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-card border border-border flex items-center justify-center">
              <ArrowRight size={22} className="text-text-muted/30" />
            </div>
            <p className="text-[14px] text-text-muted">{T('orchestrateTaskHint')}</p>
          </div>
        )}
        <div className="space-y-4 max-w-2xl mx-auto">
          {orchThread.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.from === 'human' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold"
                style={{ backgroundColor: msg.from === 'human' ? '#7c6ff7' : msg.from === 'system' ? '#232330' : getColor(msg.from) + '18', color: msg.from === 'human' ? '#fff' : getColor(msg.from) }}>
                {msg.from === 'human' ? <User size={13} /> : msg.fromName.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 min-w-0 ${msg.from === 'human' ? 'flex flex-col items-end' : ''}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${msg.from === 'human' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[12px] font-semibold text-text-primary">{msg.fromName}</span>
                  <ArrowRight size={10} className="text-text-muted" />
                  <span className="text-[11px] text-text-muted">{msg.toName}</span>
                  {msg.status === 'streaming' && <Loader2 size={11} className="animate-spin text-accent" />}
                  {msg.status === 'done' && msg.triggeredRules.length > 0 && <AlertTriangle size={11} className="text-amber" />}
                  {msg.status === 'error' && <AlertTriangle size={11} className="text-red" />}
                </div>
                <div className={`rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.from === 'human' ? 'bg-accent text-white rounded-tr-md' :
                    msg.status === 'error' ? 'bg-red/5 border border-red/10 text-red' :
                    'bg-surface-card border border-border rounded-tl-md text-text-secondary'}`}>
                  {msg.status === 'streaming' && !msg.content ? <span className="text-text-muted italic">Thinking…</span> : msg.content || ''}
                </div>
                {msg.status === 'done' && msg.triggeredRules.length > 0 && (
                  <div className="mt-1 text-[11px] text-amber font-medium flex items-center gap-1"><AlertTriangle size={10} />{T('needReview')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <ActionPrompt
          visible={orchThread.length > 0 && !orchRunning && orchThread.some((m) => m.status === 'done')}
          onAction={(prompt) => { if (prompt) setOrchHumanInput(prompt) }}
        />
      </div>

      <div className="border-t border-border p-4">
        {orchRunning && (
          <div className="flex items-center justify-between mb-2.5 text-[12px]">
            <span className="text-accent font-semibold flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" />{T('running')}</span>
            <button onClick={orchStop} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red/10 text-red font-semibold hover:bg-red/20 transition-colors"><Square size={11} />Stop</button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-surface-card border border-border rounded-xl px-4 py-2.5 focus-within:border-accent/30 transition-all">
          <textarea value={orchHumanInput} onChange={(e) => setOrchHumanInput(e.target.value)}
            placeholder={orchRunning ? T('intervenePlaceholder') : T('orchestrateTaskHint')} rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] text-text-primary placeholder:text-text-muted/50 py-0.5"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (orchRunning) orchIntervene() } }} />
          <button onClick={() => orchIntervene()} disabled={!orchHumanInput.trim()}
            className="p-1.5 rounded-lg text-accent hover:bg-accent-soft disabled:opacity-20 transition-colors"><Send size={16} /></button>
        </div>
      </div>
    </div>
  )
}
