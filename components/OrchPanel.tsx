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

  const handleIntervene = () => { if (!orchHumanInput.trim()) return; orchIntervene() }

  const getModelColor = (from: string) => allModels.find((m) => m.id === from)?.color || '#6c5ce7'

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {orchThread.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
            <ArrowRight size={32} className="text-gray-700" />
            <p className="text-sm">{T('orchestrateTaskHint')}</p>
          </div>
        )}
        <div className="space-y-3 max-w-2xl mx-auto">
          {orchThread.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.from === 'human' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                style={{ backgroundColor: msg.from === 'human' ? '#6c5ce7' : msg.from === 'system' ? '#333' : getModelColor(msg.from) + '30',
                  color: msg.from === 'human' ? '#fff' : getModelColor(msg.from), border: msg.from === 'human' ? 'none' : `1px solid ${getModelColor(msg.from)}` }}>
                {msg.from === 'human' ? <User size={12} /> : msg.fromName.charAt(0)}
              </div>
              <div className={`flex-1 min-w-0 ${msg.from === 'human' ? 'flex flex-col items-end' : ''}`}>
                <div className={`flex items-center gap-1.5 mb-0.5 ${msg.from === 'human' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] font-medium text-gray-300">{msg.fromName}</span>
                  <ArrowRight size={10} className="text-gray-700" />
                  <span className="text-[10px] text-gray-500">{msg.toName}</span>
                  {msg.status === 'streaming' && <Loader2 size={10} className="animate-spin text-panel-accent" />}
                  {msg.status === 'done' && msg.triggeredRules.length > 0 && <AlertTriangle size={10} className="text-panel-warn" />}
                  {msg.status === 'error' && <AlertTriangle size={10} className="text-panel-danger" />}
                </div>
                <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.from === 'human' ? 'bg-panel-accent text-white rounded-tr-sm'
                    : msg.status === 'error' ? 'bg-panel-danger/10 border border-panel-danger/30 text-panel-danger'
                    : 'bg-panel-card border border-panel-border rounded-tl-sm text-gray-300'}`}>
                  {msg.status === 'streaming' && !msg.content ? <span className="text-gray-600 italic">{T('thinking')}</span>
                    : msg.content || <span className="text-gray-600 italic">(empty)</span>}
                </div>
                {msg.status === 'done' && msg.triggeredRules.length > 0 && (
                  <div className="mt-1 text-[10px] text-panel-warn flex items-center gap-1">
                    <AlertTriangle size={10} />{T('needReview')}
                  </div>
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

      <div className="border-t border-panel-border p-3">
        {orchRunning && (
          <div className="flex items-center justify-between mb-2 text-[10px]">
            <span className="text-panel-accent animate-pulse flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" />{T('running')}
            </span>
            <button onClick={orchStop} className="flex items-center gap-1 px-2 py-0.5 rounded bg-panel-danger/10 text-panel-danger hover:bg-panel-danger/20">
              <Square size={10} />{lang === 'zh' ? '终止' : 'Stop'}
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-panel-card border border-panel-border rounded-lg px-3 py-2 focus-within:border-panel-accent">
          <textarea value={orchHumanInput} onChange={(e) => setOrchHumanInput(e.target.value)}
            placeholder={orchRunning ? T('intervenePlaceholder') : T('orchestrateTaskHint')} rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-200 placeholder-gray-600"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (orchRunning) handleIntervene() } }} />
          <button onClick={handleIntervene} disabled={!orchHumanInput.trim()}
            className="p-1.5 rounded text-panel-accent hover:bg-panel-accent-soft disabled:opacity-20">
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] text-gray-600 mt-1 px-1">
          {orchRunning ? T('interveneHint') : T('orchestrateTaskHint')}
        </div>
      </div>
    </div>
  )
}
