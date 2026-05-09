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
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {allModels.map((m) => {
        const hasKey = !!apiKeys[m.id]
        return (
          <button
            key={m.id}
            onClick={() => toggleModel(m.id)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
              m.enabled
                ? 'text-white border'
                : 'text-gray-600 border border-panel-border hover:border-gray-600'
            }`}
            style={
              m.enabled
                ? { backgroundColor: m.color + '20', borderColor: m.color }
                : {}
            }
            title={m.provider + ' - ' + m.modelId}
          >
            {m.name}
            {!hasKey && m.enabled && (
              <span className="w-1 h-1 rounded-full bg-panel-warn" title="未配置 API Key" />
            )}
            {m.enabled && hasKey && <Check size={10} />}
          </button>
        )
      })}
    </div>
  )
}
