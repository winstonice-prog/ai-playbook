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
  const enabled = [...models, ...customModels].filter((m) => m.enabled)
  const activeRules = ruleBook.rules.filter((r) => r.enabled && r.content).length

  if (enabled.length === 0) {
    return (
      <div className="bg-surface-card border-b border-border px-4 py-2 flex items-center gap-2 text-[12px] text-text-muted">
        <WifiOff size={13} />{T('noModelsEnabled')}
      </div>
    )
  }

  return (
    <div className="bg-surface-card border-b border-border px-4 py-1.5 flex items-center gap-4 text-[11px] overflow-x-auto">
      {enabled.map((m) => {
        const s = modelStatuses.find((x) => x.modelId === m.id)
        const hasKey = !!apiKeys[m.id]
        const status = !s ? 'idle' : s.status === 'loading' ? 'loading' : s.status === 'done' ? (s.triggeredRules.length > 0 ? 'warn' : 'done') : 'error'
        const labels: Record<string, string> = { idle: T('idle'), loading: T('loading'), done: T('done'), warn: T('needReview'), error: T('error') }
        const dotColors: Record<string, string> = { idle: 'bg-border-light', loading: 'bg-accent animate-pulse', done: 'bg-green', warn: 'bg-amber animate-pulse', error: 'bg-red' }
        return (
          <div key={m.id} className="flex items-center gap-2 shrink-0">
            {hasKey ? <Wifi size={11} className="text-green/70" /> : <WifiOff size={11} className="text-text-muted/40" />}
            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
            <span className="font-medium" style={{ color: m.color }}>{m.name}</span>
            <span className="text-text-muted">{labels[status]}</span>
            {status === 'loading' && <Loader2 size={10} className="animate-spin text-accent" />}
            {status === 'done' && <CheckCircle2 size={10} className="text-green/70" />}
            {status === 'warn' && <AlertTriangle size={10} className="text-amber" />}
          </div>
        )
      })}
      <div className="ml-auto flex items-center gap-4 text-text-muted shrink-0">
        <span>{T('modelsCount', { n: enabled.length })}</span>
        <span>{T('rulesCount', { n: activeRules })}</span>
        {sending && <span className="text-accent font-medium">Processing…</span>}
      </div>
    </div>
  )
}
