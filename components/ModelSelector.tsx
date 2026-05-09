'use client'

import { useChatStore } from '@/lib/store'
import { Check } from 'lucide-react'

export default function ModelSelector() {
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const toggleModel = useChatStore((s) => s.toggleModel)
  const apiKeys = useChatStore((s) => s.apiKeys)
  const allModels = [...models, ...customModels]

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {allModels.map((m) => {
        const hasKey = !!apiKeys[m.id]
        return (
          <button key={m.id} onClick={() => toggleModel(m.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              m.enabled
                ? 'text-white shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
            style={m.enabled ? { backgroundColor: m.color + '20', border: `1px solid ${m.color}40` } : { border: '1px solid transparent' }}
            title={`${m.provider} · ${m.modelId}`}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            {m.name}
            {!hasKey && m.enabled && <span className="w-1 h-1 rounded-full bg-amber" title="No API Key" />}
            {m.enabled && hasKey && <Check size={10} className="text-green" />}
          </button>
        )
      })}
    </div>
  )
}
