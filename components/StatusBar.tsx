'use client'

import { useChatStore } from '@/lib/store'
import { AlertTriangle, CheckCircle2, Loader2, Wifi, WifiOff } from 'lucide-react'
import { t } from '@/lib/i18n'

export default function StatusBar() {
  const lang = useChatStore((s) => s.lang)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const modelStatuses = useChatStore((s) => s.modelStatuses)
  const sending = useChatStore((s) => s.sending)
  const ruleBook = useChatStore((s) => s.ruleBook)
  const apiKeys = useChatStore((s) => s.apiKeys)

  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)
  const enabledModels = [...models, ...customModels].filter((m) => m.enabled)
  const activeRules = ruleBook.rules.filter((r) => r.enabled && r.content).length

  function getModelStatus(modelId: string) {
    const s = modelStatuses.find((m) => m.modelId === modelId)
    if (!s) return { status: 'idle', label: T('idle'), icon: null }
    switch (s.status) {
      case 'loading': return { status: 'loading', label: T('loading'), icon: <Loader2 size={10} className="animate-spin text-panel-accent" /> }
      case 'done': return s.triggeredRules.length > 0
        ? { status: 'warn', label: T('needReview'), icon: <AlertTriangle size={10} className="text-panel-warn" /> }
        : { status: 'done', label: T('done'), icon: <CheckCircle2 size={10} className="text-panel-success" /> }
      case 'error': return { status: 'error', label: T('error'), icon: <AlertTriangle size={10} className="text-panel-danger" /> }
      default: return { status: 'idle', label: T('idle'), icon: null }
    }
  }

  const statusDot: Record<string, string> = { idle: 'bg-gray-700', loading: 'bg-panel-accent animate-pulse', done: 'bg-panel-success', warn: 'bg-panel-warn animate-pulse', error: 'bg-panel-danger' }

  if (enabledModels.length === 0) {
    return (
      <div className="bg-panel-card border-b border-panel-border px-4 py-1.5 flex items-center gap-2 text-[10px] text-gray-600">
        <WifiOff size={11} />{T('noModelsEnabled')}
      </div>
    )
  }

  return (
    <div className="bg-panel-card border-b border-panel-border px-4 py-1.5 flex items-center gap-3 text-[10px] overflow-x-auto">
      {enabledModels.map((m) => {
        const st = getModelStatus(m.id)
        const hasKey = !!apiKeys[m.id]
        return (
          <div key={m.id} className="flex items-center gap-1.5 flex-shrink-0">
            {hasKey ? <Wifi size={10} className="text-panel-success" /> : <WifiOff size={10} className="text-gray-700" />}
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[st.status]}`} />
            <span style={{ color: m.color }} className="font-medium">{m.name}</span>
            <span className="text-gray-600">{st.label}</span>
            {st.icon}
          </div>
        )
      })}
      <div className="ml-auto flex items-center gap-3 text-gray-600 flex-shrink-0">
        <span>{T('modelsCount', { n: enabledModels.length })}</span>
        <span>{T('rulesCount', { n: activeRules })}</span>
        {sending && <span className="text-panel-accent animate-pulse">{T('processing')}</span>}
      </div>
    </div>
  )
}
