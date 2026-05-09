'use client'

import { useChatStore } from '@/lib/store'
import { t } from '@/lib/i18n'
import { ClipboardCheck, ShieldCheck, MessageSquarePlus, X } from 'lucide-react'
import { useState } from 'react'

interface ActionPromptProps { visible: boolean; onAction: (prompt: string) => void }

export default function ActionPrompt({ visible, onAction }: ActionPromptProps) {
  const lang = useChatStore((s) => s.lang)
  const ruleBook = useChatStore((s) => s.ruleBook)
  const [dismissed, setDismissed] = useState(false)
  const T = (k: Parameters<typeof t>[1]) => t(lang, k)
  const hasRules = ruleBook.rules.filter((r) => r.enabled && r.content).length > 0

  if (!visible || dismissed) return null

  const actions = [
    { icon: ClipboardCheck, label: lang === 'zh' ? '提交代码给 AI 审核' : 'Submit code for review', prompt: lang === 'zh' ? '请审核以下代码，从代码质量、安全性、性能和可维护性四个维度给出改进建议：\n\n' : 'Please review the following code on quality, security, performance, and maintainability:\n\n', color: 'text-blue' },
    { icon: ShieldCheck, label: lang === 'zh' ? '按规则书检查规范' : 'Check against rulebook', prompt: lang === 'zh' ? '请检查以下内容是否符合规则书中的要求：\n\n' : 'Please check compliance with the rulebook:\n\n', color: 'text-accent', disabled: !hasRules, hint: lang === 'zh' ? '暂无生效规则' : 'No active rules' },
    { icon: MessageSquarePlus, label: lang === 'zh' ? '开始新一轮讨论' : 'Start a new discussion', prompt: '', color: 'text-green' },
  ]

  return (
    <div className="animate-in bg-accent-soft/30 border border-accent/10 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-text-secondary">
          {lang === 'zh' ? '接下来可以做什么？' : 'What would you like to do next?'}
        </span>
        <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text-secondary p-0.5"><X size={14} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => (
          <button key={i} onClick={() => { onAction(a.prompt); setDismissed(true) }} disabled={a.disabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
              a.disabled ? 'border-border text-text-muted/50 cursor-not-allowed' : 'border-border text-text-secondary hover:border-accent/30 hover:bg-accent-soft'}`}
            title={a.disabled ? a.hint : ''}>
            <a.icon size={14} className={a.disabled ? 'text-text-muted/50' : a.color} />{a.label}
            {a.disabled && <span className="text-[10px] text-text-muted/50">{a.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
