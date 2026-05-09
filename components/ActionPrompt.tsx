'use client'

import { useChatStore } from '@/lib/store'
import { t } from '@/lib/i18n'
import { ClipboardCheck, ShieldCheck, MessageSquarePlus, X } from 'lucide-react'
import { useState } from 'react'

interface ActionPromptProps {
  visible: boolean
  onAction: (prompt: string) => void
}

export default function ActionPrompt({ visible, onAction }: ActionPromptProps) {
  const lang = useChatStore((s) => s.lang)
  const ruleBook = useChatStore((s) => s.ruleBook)
  const [dismissed, setDismissed] = useState(false)

  const T = (k: Parameters<typeof t>[1]) => t(lang, k)
  const hasRules = ruleBook.rules.filter((r) => r.enabled && r.content).length > 0

  if (!visible || dismissed) return null

  const actions = [
    {
      icon: ClipboardCheck,
      label: lang === 'zh' ? '提交代码给 AI 审核' : 'Submit code for AI review',
      prompt: lang === 'zh'
        ? '请审核以下代码，从代码质量、安全性、性能和可维护性四个维度给出改进建议：\n\n'
        : 'Please review the following code and provide improvement suggestions on code quality, security, performance, and maintainability:\n\n',
      color: 'text-blue-400',
    },
    {
      icon: ShieldCheck,
      label: lang === 'zh' ? '按规则书检查规范' : 'Check against rulebook',
      prompt: lang === 'zh'
        ? '请检查以下内容是否符合规则书中的要求：\n\n'
        : 'Please check if the following content complies with the rulebook requirements:\n\n',
      color: 'text-panel-accent',
      disabled: !hasRules,
      disabledHint: lang === 'zh' ? '（暂无生效规则）' : '(No active rules)',
    },
    {
      icon: MessageSquarePlus,
      label: lang === 'zh' ? '开始新一轮讨论' : 'Start a new discussion',
      prompt: '',
      color: 'text-green-400',
    },
  ]

  return (
    <div className="bg-panel-accent-soft/20 border border-panel-accent/20 rounded-lg p-3 mx-4 mb-3 animate-in fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-gray-300">
          {lang === 'zh' ? '💡 接下来可以做什么？' : '💡 What would you like to do next?'}
        </span>
        <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-300">
          <X size={12} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => { onAction(action.prompt); setDismissed(true) }}
            disabled={action.disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-all ${
              action.disabled
                ? 'border-panel-border text-gray-600 cursor-not-allowed'
                : 'border-panel-border text-gray-300 hover:border-panel-accent hover:bg-panel-accent-soft'
            }`}
            title={action.disabled ? action.disabledHint : ''}
          >
            <action.icon size={13} className={action.disabled ? 'text-gray-600' : action.color} />
            {action.label}
            {action.disabled && action.disabledHint && (
              <span className="text-[9px] text-gray-600 ml-0.5">{action.disabledHint}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
