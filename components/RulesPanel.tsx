'use client'

import { useState, useMemo } from 'react'
import { useChatStore } from '@/lib/store'
import { GripVertical, Trash2, Plus, ChevronDown, ChevronRight, Library, ShieldAlert, AlertTriangle, Lightbulb, X } from 'lucide-react'
import { t } from '@/lib/i18n'
import { RuleSeverity, Rule } from '@/lib/rule-engine'

// ============================================================
// Templates
// ============================================================
const RULE_TEMPLATES = [
  { id: 't1', title: '始终用中文回复', content: '必须始终使用中文回复，不要混用英文', severity: 'warning' as RuleSeverity },
  { id: 't2', title: '始终用英文回复', content: '必须始终使用英文回复，不要混用其他语言', severity: 'warning' as RuleSeverity },
  { id: 't3', title: '禁止使用 emoji', content: '不要使用任何 emoji 表情符号', severity: 'warning' as RuleSeverity },
  { id: 't4', title: '不要主动询问个人信息', content: '不要在回复中主动询问用户的个人身份信息、联系方式或隐私数据', severity: 'redline' as RuleSeverity },
  { id: 't5', title: '代码必须附带注释', content: '所有代码回复必须附带必要的注释说明', severity: 'warning' as RuleSeverity },
  { id: 't6', title: '标注不确定信息', content: '对任何不确定或不完全确认的信息，必须主动标注"未经核实"或"仅供参考"', severity: 'suggestion' as RuleSeverity },
  { id: 't7', title: '数据脱敏', content: '涉及个人数据、API Key、密码等敏感信息的内容，必须先脱敏处理再输出', severity: 'redline' as RuleSeverity },
  { id: 't8', title: '禁止幻觉编造', content: '不要编造不存在的数据、文献或事实。如不确定请如实说明', severity: 'redline' as RuleSeverity },
  { id: 't9', title: '回复简洁', content: '尽量简洁，避免冗余废话', severity: 'suggestion' as RuleSeverity },
  { id: 't10', title: '结构化输出', content: '尽量使用结构化格式输出（如列表、表格、分点），便于阅读', severity: 'suggestion' as RuleSeverity },
  { id: 't11', title: '引用来源', content: '引用数据或事实时，必须标注来源或依据', severity: 'warning' as RuleSeverity },
  { id: 't12', title: '禁用 Markdown 格式', content: '不要使用 Markdown 格式标记（如 #、*、` 等），使用纯文本', severity: 'warning' as RuleSeverity },
  { id: 't13', title: '保持专业语气', content: '必须保持专业、正式的语气，不要使用口语化表达或网络用语', severity: 'suggestion' as RuleSeverity },
  { id: 't14', title: '版权合规', content: '不要输出受版权保护的完整内容（如整段歌词、全文转载等）', severity: 'redline' as RuleSeverity },
  { id: 't15', title: '先问后答', content: '遇到模糊或不完整的问题时，必须先提出澄清性问题，不要擅自猜测意图', severity: 'suggestion' as RuleSeverity },
]

const S_ICONS = { redline: ShieldAlert, warning: AlertTriangle, suggestion: Lightbulb }
const S_COLORS: Record<RuleSeverity, string> = { redline: 'text-red-400', warning: 'text-amber-400', suggestion: 'text-blue-400' }
const S_BG: Record<RuleSeverity, string> = { redline: 'bg-red-500/15 border-red-500/30 text-red-400', warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400', suggestion: 'bg-blue-500/15 border-blue-500/30 text-blue-400' }
const S_LABEL: Record<RuleSeverity, { zh: string; en: string }> = { redline: { zh: '红线', en: 'Redline' }, warning: { zh: '警告', en: 'Warning' }, suggestion: { zh: '建议', en: 'Suggestion' } }

// ============================================================
// Rule Row
// ============================================================
function RuleRow({
  rule, lang, allModels, isExpanded, onToggle, updateRule, deleteRule, onDragStart, onDragOver, onDrop, isDragging, T,
}: {
  rule: Rule; lang: 'zh' | 'en'; allModels: any[]; isExpanded: boolean; onToggle: () => void
  updateRule: (id: string, p: Partial<Rule>) => void; deleteRule: (id: string) => void
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; isDragging: boolean
  T: Function
}) {
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDrop}
      className={`rounded-lg border px-3 py-2.5 transition-colors cursor-default ${isDragging ? 'border-panel-accent bg-panel-accent-soft opacity-50' : rule.enabled ? 'border-panel-border bg-panel-card' : 'border-panel-border bg-panel-card opacity-50'}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button className="text-gray-600 hover:text-gray-400 cursor-grab p-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <GripVertical size={14} />
        </button>
        <input type="checkbox" checked={rule.enabled} onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
          className="accent-panel-accent w-3.5 h-3.5" />
        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${S_BG[rule.severity]}`}>
          {lang === 'zh' ? S_LABEL[rule.severity].zh : S_LABEL[rule.severity].en}
        </span>
        <input type="text" value={rule.title} onChange={(e) => updateRule(rule.id, { title: e.target.value })}
          placeholder={T('ruleTitle')} className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-600 min-w-0" />
        <button onClick={onToggle} className="text-gray-500 hover:text-gray-300 p-0.5">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <button onClick={() => deleteRule(rule.id)} className="text-gray-500 hover:text-red-400 p-0.5">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 ml-6 space-y-3">
          {/* Severity switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-14 shrink-0">{lang === 'zh' ? '级别' : 'Level'}</span>
            {(['redline', 'warning', 'suggestion'] as RuleSeverity[]).map((sev) => {
              const Icon = S_ICONS[sev]
              const active = rule.severity === sev
              return (
                <button key={sev} onClick={() => updateRule(rule.id, { severity: sev })}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] border transition-all ${
                    active ? S_BG[sev] : 'border-panel-border text-gray-600 hover:border-gray-500'
                  }`}>
                  <Icon size={11} className={active ? '' : 'text-gray-500'} />
                  {lang === 'zh' ? S_LABEL[sev].zh : S_LABEL[sev].en}
                </button>
              )
            })}
          </div>

          <textarea value={rule.content} onChange={(e) => updateRule(rule.id, { content: e.target.value })}
            placeholder={T('ruleContent')} rows={2}
            className="w-full bg-panel-bg border border-panel-border rounded-lg p-2.5 outline-none focus:border-panel-accent resize-none text-sm text-gray-300 placeholder-gray-600" />

          <div>
            <p className="text-[11px] text-gray-500 mb-1.5">{T('ruleScope')}</p>
            <div className="flex flex-wrap gap-1.5">
              {allModels.map((m: any) => {
                const selected = rule.targetModels.includes(m.id)
                return (
                  <button key={m.id} onClick={() => updateRule(rule.id, {
                    targetModels: selected ? rule.targetModels.filter((id: string) => id !== m.id) : [...rule.targetModels, m.id],
                  })}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${selected ? 'bg-panel-accent-soft text-panel-accent' : 'bg-panel-bg text-gray-600 hover:text-gray-400'}`}>
                    {m.name}
                  </button>
                )
              })}
            </div>
            {rule.targetModels.length > 0 && (
              <p className="text-[10px] text-gray-600 mt-1">{T('ruleSpecified')}</p>
            )}
          </div>

          <div className="text-[10px] text-gray-600 bg-panel-bg/50 rounded-lg p-2.5 leading-relaxed">
            {lang === 'zh'
              ? '自动检查基于语义模式匹配，结果仅供参考。红线级别建议人工复核。'
              : 'Automated checks are pattern-based. Redline rules should be reviewed manually.'}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Panel
// ============================================================
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
    setShowAddPicker(false)
    addRule({ severity })
    // Auto-expand the newly added rule
    setTimeout(() => {
      const state = useChatStore.getState()
      const last = state.ruleBook.rules[state.ruleBook.rules.length - 1]
      if (last) setExpandedRule(last.id)
    }, 100)
  }

  const handleImportTemplate = (tpl: typeof RULE_TEMPLATES[0]) => {
    addRule({ title: tpl.title, content: tpl.content, severity: tpl.severity })
  }

  const sections: { severity: RuleSeverity; rules: Rule[] }[] = [
    { severity: 'redline', rules: grouped.redline },
    { severity: 'warning', rules: grouped.warning },
    { severity: 'suggestion', rules: grouped.suggestion },
  ].filter((s) => s.rules.length > 0)

  return (
    <div className="bg-panel-card h-full overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">{T('ruleBook')}</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{T('rulesActive', { n: activeCount })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${showTemplates ? 'bg-panel-accent-soft text-panel-accent border-panel-accent/30' : 'border-panel-border text-gray-400 hover:text-gray-200'}`}>
            <Library size={13} />
            {lang === 'zh' ? '模板' : 'Templates'}
          </button>

          {/* Severity picker for adding */}
          <div className="relative">
            <button onClick={() => setShowAddPicker(!showAddPicker)}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-panel-accent text-white rounded-lg hover:opacity-90">
              <Plus size={13} />{T('addRule')}
            </button>
            {showAddPicker && (
              <div className="absolute right-0 top-full mt-1 bg-panel-card border border-panel-border rounded-lg p-1.5 z-20 shadow-lg w-44">
                <p className="text-[10px] text-gray-500 px-2 py-1 mb-0.5">{lang === 'zh' ? '选择严重级别' : 'Select severity'}</p>
                {(['redline', 'warning', 'suggestion'] as RuleSeverity[]).map((sev) => {
                  const Icon = S_ICONS[sev]
                  return (
                    <button key={sev} onClick={() => handleAddRule(sev)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-left hover:bg-panel-bg transition-colors ${S_COLORS[sev]}`}>
                      <Icon size={13} />
                      {lang === 'zh' ? S_LABEL[sev].zh : S_LABEL[sev].en}
                    </button>
                  )
                })}
                <button onClick={() => setShowAddPicker(false)}
                  className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 mt-0.5 py-1">
                  {lang === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="mb-4 border border-panel-accent/20 rounded-lg bg-panel-bg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-gray-400">
              {lang === 'zh' ? '点击模板导入到规则书' : 'Click to import template'}
            </p>
            <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-gray-300">
              <X size={13} />
            </button>
          </div>
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {RULE_TEMPLATES.map((tpl) => (
              <button key={tpl.id} onClick={() => handleImportTemplate(tpl)}
                className="w-full text-left px-3 py-2 rounded-md text-xs bg-panel-card hover:bg-panel-accent-soft/30 transition-colors group flex items-center gap-2">
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium border ${S_BG[tpl.severity]}`}>
                  {lang === 'zh' ? S_LABEL[tpl.severity].zh : S_LABEL[tpl.severity].en}
                </span>
                <span className="text-gray-300 group-hover:text-white truncate">{tpl.title}</span>
                <Plus size={11} className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-panel-accent" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {ruleBook.rules.length === 0 && !showTemplates && (
        <div className="text-center py-12">
          <ShieldAlert size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-500 mb-1">{T('noRules')}</p>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">
            {lang === 'zh'
              ? '点击「模板」从 15 条预设模板中导入，或点「添加规则」选择级别后手动创建'
              : 'Click Templates to import from 15 presets, or Add Rule to create manually'}
          </p>
        </div>
      )}

      {/* Rules grouped by severity */}
      {sections.map(({ severity, rules }) => {
        const Icon = S_ICONS[severity]
        return (
          <div key={severity} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={S_COLORS[severity]} />
              <span className="text-xs font-semibold text-gray-300">
                {lang === 'zh' ? S_LABEL[severity].zh : S_LABEL[severity].en}
              </span>
              <span className="text-[10px] text-gray-600">({rules.length})</span>
            </div>
            <div className="space-y-2">
              {rules.map((rule) => {
                const actualIdx = ruleBook.rules.findIndex((r) => r.id === rule.id)
                const isDragging = dragIdx === actualIdx
                return (
                  <RuleRow key={rule.id} {...{
                    rule, lang, allModels,
                    isExpanded: expandedRule === rule.id,
                    onToggle: () => setExpandedRule(expandedRule === rule.id ? null : rule.id),
                    updateRule, deleteRule, T,
                    isDragging,
                    onDragStart: () => setDragIdx(actualIdx),
                    onDragOver: (e: React.DragEvent) => {
                      e.preventDefault()
                      if (dragIdx !== null && dragIdx !== actualIdx) {
                        reorderRules(dragIdx, actualIdx)
                        setDragIdx(actualIdx)
                      }
                    },
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
