'use client'

import { useState, useMemo } from 'react'
import { useChatStore } from '@/lib/store'
import { GripVertical, Trash2, Plus, ChevronDown, ChevronRight, Library, ShieldAlert, AlertTriangle, Lightbulb, X } from 'lucide-react'
import { t } from '@/lib/i18n'
import { RuleSeverity, Rule } from '@/lib/rule-engine'

const RULE_TEMPLATES = [
  { id: 't1', title: '始终用中文回复', content: '必须始终使用中文回复，不要混用英文', severity: 'warning' as RuleSeverity },
  { id: 't2', title: '始终用英文回复', content: '必须始终使用英文回复，不要混用其他语言', severity: 'warning' as RuleSeverity },
  { id: 't3', title: '禁止使用 emoji', content: '不要使用任何 emoji 表情符号', severity: 'warning' as RuleSeverity },
  { id: 't4', title: '不要主动询问个人信息', content: '不要在回复中主动询问用户的个人身份信息、联系方式或隐私数据', severity: 'redline' as RuleSeverity },
  { id: 't5', title: '代码必须附带注释', content: '所有代码回复必须附带必要的注释说明', severity: 'warning' as RuleSeverity },
  { id: 't6', title: '标注不确定信息', content: '对不确定的信息必须主动标注"未经核实"', severity: 'suggestion' as RuleSeverity },
  { id: 't7', title: '数据脱敏', content: '涉及个人数据、API Key、密码等敏感信息必须先脱敏处理再输出', severity: 'redline' as RuleSeverity },
  { id: 't8', title: '禁止幻觉编造', content: '不要编造不存在的数据、文献或事实。如不确定请如实说明', severity: 'redline' as RuleSeverity },
  { id: 't9', title: '回复简洁', content: '尽量简洁，避免冗余废话', severity: 'suggestion' as RuleSeverity },
  { id: 't10', title: '结构化输出', content: '尽量使用结构化格式输出（列表、表格、分点）', severity: 'suggestion' as RuleSeverity },
  { id: 't11', title: '引用来源', content: '引用数据或事实时必须标注来源或依据', severity: 'warning' as RuleSeverity },
  { id: 't12', title: '禁用 Markdown 格式', content: '不要使用 Markdown 格式标记，使用纯文本', severity: 'warning' as RuleSeverity },
  { id: 't13', title: '保持专业语气', content: '保持专业正式的语气，不要口语化或使用网络用语', severity: 'suggestion' as RuleSeverity },
  { id: 't14', title: '版权合规', content: '不要输出受版权保护的完整内容', severity: 'redline' as RuleSeverity },
  { id: 't15', title: '先问后答', content: '遇到模糊问题先提出澄清性问题，不要猜测意图', severity: 'suggestion' as RuleSeverity },
]

const S_ICONS = { redline: ShieldAlert, warning: AlertTriangle, suggestion: Lightbulb }
const S_COLORS: Record<RuleSeverity, string> = { redline: 'text-red', warning: 'text-amber', suggestion: 'text-blue' }
const S_BADGE: Record<RuleSeverity, string> = { redline: 'bg-red/10 border-red/20 text-red', warning: 'bg-amber/10 border-amber/20 text-amber', suggestion: 'bg-blue/10 border-blue/20 text-blue' }
const S_LABEL: Record<RuleSeverity, { zh: string; en: string }> = { redline: { zh: '红线', en: 'Redline' }, warning: { zh: '警告', en: 'Warning' }, suggestion: { zh: '建议', en: 'Suggestion' } }

function RuleRow({ rule, lang, allModels, isExpanded, onToggle, updateRule, deleteRule, onDragStart, onDragOver, onDrop, isDragging, T }: any) {
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDrop}
      className={`rounded-xl border px-3.5 py-3 transition-all cursor-default ${
        isDragging ? 'border-accent bg-accent-soft/30' :
        rule.enabled ? 'border-border bg-surface-card hover:border-border-light' : 'border-border bg-surface-card opacity-50'}`}>
      <div className="flex items-center gap-2.5">
        <button className="text-text-muted hover:text-text-secondary cursor-grab p-0.5 shrink-0"><GripVertical size={14} /></button>
        <input type="checkbox" checked={rule.enabled} onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })} className="accent-accent w-4 h-4 rounded" />
        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${S_BADGE[rule.severity]}`}>
          {lang === 'zh' ? S_LABEL[rule.severity].zh : S_LABEL[rule.severity].en}
        </span>
        <input type="text" value={rule.title} onChange={(e) => updateRule(rule.id, { title: e.target.value })}
          placeholder={T('ruleTitle')} className="flex-1 bg-transparent outline-none text-[13px] font-medium text-text-primary placeholder:text-text-muted/50 min-w-0" />
        <button onClick={onToggle} className="text-text-muted hover:text-text-secondary p-0.5">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
        <button onClick={() => deleteRule(rule.id)} className="text-text-muted hover:text-red p-0.5"><Trash2 size={14} /></button>
      </div>
      {isExpanded && (
        <div className="mt-3 ml-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted w-12 shrink-0">{lang === 'zh' ? '级别' : 'Level'}</span>
            {(['redline', 'warning', 'suggestion'] as RuleSeverity[]).map((sev) => {
              const Icon = S_ICONS[sev]; const active = rule.severity === sev
              return (
                <button key={sev} onClick={() => updateRule(rule.id, { severity: sev })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${active ? S_BADGE[sev] : 'border-border text-text-muted hover:border-border-light'}`}>
                  <Icon size={12} />{lang === 'zh' ? S_LABEL[sev].zh : S_LABEL[sev].en}
                </button>
              )
            })}
          </div>
          <textarea value={rule.content} onChange={(e) => updateRule(rule.id, { content: e.target.value })}
            placeholder={T('ruleContent')} rows={2}
            className="w-full bg-surface border border-border rounded-lg p-3 outline-none focus:border-accent/30 resize-none text-[13px] text-text-secondary placeholder:text-text-muted/50" />
          <div>
            <p className="text-[11px] text-text-muted mb-2">{T('ruleScope')}</p>
            <div className="flex flex-wrap gap-1.5">
              {allModels.map((m: any) => {
                const sel = rule.targetModels.includes(m.id)
                return (
                  <button key={m.id} onClick={() => updateRule(rule.id, { targetModels: sel ? rule.targetModels.filter((id: string) => id !== m.id) : [...rule.targetModels, m.id] })}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${sel ? 'bg-accent-soft text-accent' : 'bg-surface text-text-muted hover:text-text-secondary'}`}>{m.name}</button>
                )
              })}
            </div>
          </div>
          <div className="text-[11px] text-text-muted bg-surface rounded-lg p-3 leading-relaxed">
            {lang === 'zh' ? '自动检查基于语义模式匹配，结果仅供参考。红线级别建议人工复核。' : 'Automated checks are pattern-based. Redline rules should be manually reviewed.'}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RulesPanel() {
  const lang = useChatStore((s) => s.lang)
  const ruleBook = useChatStore((s) => s.ruleBook)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const addRule = useChatStore((s) => s.addRule)
  const updateRule = useChatStore((s) => s.updateRule)
  const deleteRule = useChatStore((s) => s.deleteRule)
  const reorderRules = useChatStore((s) => s.reorderRules)
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const allModels = [...models, ...customModels]
  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)
  const grouped = useMemo(() => ({
    redline: ruleBook.rules.filter((r) => r.severity === 'redline'),
    warning: ruleBook.rules.filter((r) => r.severity === 'warning'),
    suggestion: ruleBook.rules.filter((r) => r.severity === 'suggestion'),
  }), [ruleBook.rules])
  const activeCount = ruleBook.rules.filter((r) => r.enabled && r.content).length

  const handleAddRule = (severity: RuleSeverity) => {
    setShowAddPicker(false); addRule({ severity })
    setTimeout(() => { const last = useChatStore.getState().ruleBook.rules.at(-1); if (last) setExpandedRule(last.id) }, 100)
  }

  const sections = ([
    { severity: 'redline' as const, rules: grouped.redline },
    { severity: 'warning' as const, rules: grouped.warning },
    { severity: 'suggestion' as const, rules: grouped.suggestion },
  ]).filter((s) => s.rules.length > 0)

  return (
    <div className="h-full overflow-y-auto p-4 bg-surface-secondary">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[15px] font-bold text-text-primary">{T('ruleBook')}</h2>
          <p className="text-[12px] text-text-muted mt-0.5">{T('rulesActive', { n: activeCount })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${showTemplates ? 'bg-accent-soft text-accent border-accent/20' : 'border-border text-text-muted hover:text-text-secondary hover:border-border-light'}`}>
            <Library size={13} />{lang === 'zh' ? '模板' : 'Templates'}
          </button>
          <div className="relative">
            <button onClick={() => setShowAddPicker(!showAddPicker)}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity">
              <Plus size={13} />{T('addRule')}
            </button>
            {showAddPicker && (
              <div className="absolute right-0 top-full mt-1.5 bg-surface-card border border-border rounded-xl p-1.5 z-20 shadow-xl w-48">
                <p className="text-[11px] text-text-muted px-2 py-1.5">{lang === 'zh' ? '选择严重级别' : 'Select severity'}</p>
                {(['redline', 'warning', 'suggestion'] as RuleSeverity[]).map((sev) => {
                  const Icon = S_ICONS[sev]
                  return (
                    <button key={sev} onClick={() => handleAddRule(sev)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-left hover:bg-surface-hover transition-colors ${S_COLORS[sev]}`}>
                      <Icon size={14} />{lang === 'zh' ? S_LABEL[sev].zh : S_LABEL[sev].en}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTemplates && (
        <div className="mb-5 border border-accent/10 rounded-xl bg-surface-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-text-secondary font-medium">{lang === 'zh' ? '点击模板导入到规则书' : 'Click to import'}</p>
            <button onClick={() => setShowTemplates(false)} className="text-text-muted hover:text-text-secondary"><X size={14} /></button>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {RULE_TEMPLATES.map((tpl) => (
              <button key={tpl.id} onClick={() => { addRule({ title: tpl.title, content: tpl.content, severity: tpl.severity }); setShowTemplates(false) }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-[12px] bg-surface hover:bg-surface-hover transition-colors group flex items-center gap-2.5">
                <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${S_BADGE[tpl.severity]}`}>
                  {lang === 'zh' ? S_LABEL[tpl.severity].zh : S_LABEL[tpl.severity].en}
                </span>
                <span className="text-text-secondary group-hover:text-text-primary font-medium truncate">{tpl.title}</span>
                <Plus size={11} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {ruleBook.rules.length === 0 && !showTemplates && (
        <div className="text-center py-16">
          <ShieldAlert size={36} className="mx-auto mb-4 text-text-muted/30" />
          <p className="text-[14px] font-medium text-text-muted mb-1">{T('noRules')}</p>
          <p className="text-[12px] text-text-muted/70 max-w-xs mx-auto">
            {lang === 'zh' ? '点击「模板」从预设模板导入，或「添加规则」手动创建' : 'Click Templates to import or Add Rule to create'}
          </p>
        </div>
      )}

      {sections.map(({ severity, rules }) => {
        const Icon = S_ICONS[severity]
        return (
          <div key={severity} className="mb-5">
            <div className="flex items-center gap-2.5 mb-2.5 px-0.5">
              <Icon size={15} className={S_COLORS[severity]} />
              <span className="text-[13px] font-semibold text-text-primary">{lang === 'zh' ? S_LABEL[severity].zh : S_LABEL[severity].en}</span>
              <span className="text-[11px] text-text-muted">· {rules.length}</span>
            </div>
            <div className="space-y-2">
              {rules.map((rule) => {
                const actualIdx = ruleBook.rules.findIndex((r) => r.id === rule.id)
                return (
                  <RuleRow key={rule.id} {...{
                    rule, lang, allModels, isExpanded: expandedRule === rule.id,
                    onToggle: () => setExpandedRule(expandedRule === rule.id ? null : rule.id),
                    updateRule, deleteRule, T, isDragging: dragIdx === actualIdx,
                    onDragStart: () => setDragIdx(actualIdx),
                    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== actualIdx) { reorderRules(dragIdx, actualIdx); setDragIdx(actualIdx) } },
                    onDrop: () => setDragIdx(null),
                  }} />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
