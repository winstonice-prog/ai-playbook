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
    setWizardDone(); onDone()
  }

  return (
    <div className="fixed inset-0 bg-surface z-50 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="flex justify-center gap-2.5 mb-10">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-green' : 'w-4 bg-border'}`} />
          ))}
        </div>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-5">
            {React.createElement(steps[step].icon, { size: 32, className: 'text-accent' })}
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">{steps[step].title}</h1>
          <p className="text-[14px] text-text-muted leading-relaxed">{steps[step].desc}</p>
        </div>
        {step === 1 && (
          <div className="space-y-3 mb-8">
            {AI_MODELS.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-surface-card border border-border rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: m.color + '15' }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-text-primary">{m.name}</div>
                  <input type="password" value={keys[m.id] || ''} onChange={(e) => setKeys({ ...keys, [m.id]: e.target.value })}
                    placeholder={`${m.provider} API Key (${lang === 'zh' ? '可选' : 'optional'})`}
                    className="w-full bg-transparent outline-none text-[12px] text-text-secondary placeholder:text-text-muted/50 mt-0.5" />
                </div>
                {keys[m.id] && <Check size={16} className="text-green shrink-0" />}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-3">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 text-[14px] font-medium text-text-muted hover:text-text-secondary transition-colors">{T('back')}</button>}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold bg-accent text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm">{T('continue_')}<ArrowRight size={15} /></button>
          ) : (
            <button onClick={handleFinish} className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold bg-green text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm">{T('start')}<Check size={15} /></button>
          )}
        </div>
        {step === 1 && (
          <div className="text-center mt-5">
            <button onClick={() => setStep(2)} className="text-[13px] text-text-muted hover:text-text-secondary transition-colors">{T('skipForNow')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
