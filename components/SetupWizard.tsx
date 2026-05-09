'use client'

import React, { useState } from 'react'
import { useChatStore } from '@/lib/store'
import { AI_MODELS } from '@/lib/ai-models'
import { Shield, ArrowRight, Key, Check, Zap } from 'lucide-react'
import { t } from '@/lib/i18n'

export default function SetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const setApiKey = useChatStore((s) => s.setApiKey)
  const setWizardDone = useChatStore((s) => s.setWizardDone)
  const lang = useChatStore((s) => s.lang)
  const [keys, setKeys] = useState<Record<string, string>>({})

  const T = (k: Parameters<typeof t>[1]) => t(lang, k)

  const steps = [
    { title: T('welcome'), desc: T('welcomeDesc'), icon: Shield },
    { title: T('configKeys'), desc: T('configKeysDesc'), icon: Key },
    { title: T('allReady'), desc: T('allReadyDesc'), icon: Zap },
  ]

  const handleFinish = () => {
    Object.entries(keys).forEach(([id, key]) => { if (key.trim()) setApiKey(id, key.trim()) })
    setWizardDone()
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-panel-bg z-50 flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-panel-accent scale-125' : i < step ? 'bg-panel-success' : 'bg-panel-border'}`} />
          ))}
        </div>
        <div className="text-center mb-8">
          {React.createElement(steps[step].icon, { size: 40, className: 'mx-auto mb-4 text-panel-accent' })}
          <h1 className="text-xl font-bold mb-2">{steps[step].title}</h1>
          <p className="text-sm text-gray-500">{steps[step].desc}</p>
        </div>
        {step === 1 && (
          <div className="space-y-3 mb-6">
            {AI_MODELS.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-300">{m.name}</div>
                  <input type="password" value={keys[m.id] || ''} onChange={(e) => setKeys({ ...keys, [m.id]: e.target.value })}
                    placeholder={`${m.provider} API Key (${lang === 'zh' ? '可选' : 'optional'})`}
                    className="w-full bg-panel-card border border-panel-border rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-panel-accent mt-1" />
                </div>
                {keys[m.id] && <Check size={14} className="text-panel-success flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-300">
              {T('back')}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-5 py-2 text-sm bg-panel-accent text-white rounded-lg hover:opacity-90">
              {T('continue_')}<ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleFinish} className="flex items-center gap-2 px-5 py-2 text-sm bg-panel-success text-white rounded-lg hover:opacity-90">
              {T('start')}<Check size={14} />
            </button>
          )}
        </div>
        {step === 1 && (
          <div className="text-center mt-4">
            <button onClick={() => setStep(2)} className="text-xs text-gray-600 hover:text-gray-400">{T('skipForNow')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
