export type RuleSeverity = 'redline' | 'warning' | 'suggestion'

export interface Rule {
  id: string
  title: string
  content: string
  enabled: boolean
  targetModels: string[]
  category: 'global' | 'per-model'
  severity: RuleSeverity
  createdAt: number
}

export interface RuleBook {
  id: string
  name: string
  rules: Rule[]
}

const STORAGE_KEY = 'ai-rc-book'

export function loadRuleBook(): RuleBook {
  if (typeof window === 'undefined') return { id: 'default', name: '默认规则书', rules: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate old rules without severity
      parsed.rules = parsed.rules.map((r: any) => ({ severity: 'warning', ...r }))
      return parsed
    }
  } catch { /* ignore */ }
  return { id: 'default', name: '默认规则书', rules: [] }
}

export function saveRuleBook(book: RuleBook) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
}

export function createRule(partial: Partial<Rule> = {}): Rule {
  return {
    id: Math.random().toString(36).slice(2, 10),
    title: '',
    content: '',
    enabled: true,
    targetModels: [],
    category: 'global',
    severity: 'warning',
    createdAt: Date.now(),
    ...partial,
  }
}

export function buildInjectionPrompt(book: RuleBook, modelId: string): string {
  const activeRules = book.rules.filter(
    (r) => r.enabled && r.content && (r.targetModels.length === 0 || r.targetModels.includes(modelId))
  )
  if (activeRules.length === 0) return ''

  const redlines = activeRules.filter((r) => r.severity === 'redline')
  const warnings = activeRules.filter((r) => r.severity === 'warning')
  const suggestions = activeRules.filter((r) => r.severity === 'suggestion')

  const parts: string[] = []

  if (redlines.length > 0) {
    parts.push('## 必须严格遵守（违反将导致严重后果）')
    parts.push(redlines.map((r, i) => `${i + 1}. ${r.content}`).join('\n'))
  }
  if (warnings.length > 0) {
    parts.push('## 应当遵守')
    parts.push(warnings.map((r, i) => `${i + 1}. ${r.content}`).join('\n'))
  }
  if (suggestions.length > 0) {
    parts.push('## 建议参考')
    parts.push(suggestions.map((r, i) => `${i + 1}. ${r.content}`).join('\n'))
  }

  return `[系统规则书]\n${parts.join('\n\n')}\n[/系统规则书]`
}

// Smart compliance check
export interface ComplianceResult {
  ruleId: string
  violated: boolean
  confidence: 'high' | 'low'
  reason: string
}

export function checkCompliance(rule: Rule, response: string): ComplianceResult {
  const content = rule.content
  const respLower = response.toLowerCase()
  const contentLower = content.toLowerCase()

  // --- Pattern 1: 禁止/不要/No type rules ---
  const prohibitMatch = content.match(
    /(?:不要|禁止|不能|请勿|千万别|不可|严禁|don't|never|do not|no |avoid|prohibit)\s*(.+?)(?:[。，.!！\n]|$)/
  )
  if (prohibitMatch) {
    const prohibited = prohibitMatch[1].trim()

    // Check for emoji
    if (/emoji|表情|😀|😂/.test(prohibited) || prohibited === '使用表情') {
      const hasEmoji = /[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(response)
      return { ruleId: rule.id, violated: hasEmoji, confidence: hasEmoji ? 'high' : 'low', reason: hasEmoji ? '检测到 emoji 表情' : '未检测到 emoji' }
    }
    // Check for markdown
    if (/markdown|md|格式/.test(prohibited)) {
      const hasMd = /[#*\[`]/.test(response)
      return { ruleId: rule.id, violated: hasMd, confidence: 'low', reason: hasMd ? '检测到 markdown 格式标记' : '未检测到明显格式标记' }
    }
    // Check for English
    if (/英文|英语|english/.test(prohibited)) {
      const engRatio = (response.match(/[a-zA-Z]/g) || []).length / Math.max(response.length, 1)
      return { ruleId: rule.id, violated: engRatio > 0.5, confidence: engRatio > 0.7 ? 'high' : 'low', reason: engRatio > 0.5 ? `英文占比 ${Math.round(engRatio * 100)}%` : '以中文为主' }
    }
    // Generic: check if prohibited pattern appears in response
    if (prohibited.length >= 2) {
      const found = respLower.includes(prohibited.toLowerCase())
      return { ruleId: rule.id, violated: found, confidence: 'low', reason: found ? `检测到疑似内容: "${prohibited}"` : '未检测到' }
    }
  }

  // --- Pattern 2: 必须/始终/Always type rules ---
  const mustMatch = content.match(
    /(?:必须|始终|总是|一定|务必|记得|always|must|should|ensure)\s*(.+?)(?:[。，.!！\n]|$)/
  )
  if (mustMatch) {
    const required = mustMatch[1].trim()
    // 使用中文
    if (/中文|chinese|汉语/.test(required)) {
      const chineseRatio = (response.match(/[\u4e00-\u9fff]/g) || []).length / Math.max(response.length, 1)
      return { ruleId: rule.id, violated: chineseRatio < 0.2, confidence: chineseRatio < 0.1 ? 'high' : 'low', reason: chineseRatio < 0.2 ? `中文占比仅 ${Math.round(chineseRatio * 100)}%` : '中文回复正常' }
    }
    // 使用英文
    if (/英文|英语|english/.test(required)) {
      const engRatio = (response.match(/[a-zA-Z]/g) || []).length / Math.max(response.length, 1)
      return { ruleId: rule.id, violated: engRatio < 0.3, confidence: 'low', reason: engRatio < 0.3 ? '英文占比较低' : '英文回复正常' }
    }
    // 附带注释/文档
    if (/注释|comment|文档|doc/.test(required)) {
      const hasComment = /\/[/*]|#|<!--/.test(response)
      return { ruleId: rule.id, violated: !hasComment, confidence: 'low', reason: hasComment ? '检测到注释' : '未检测到注释' }
    }
    // Generic: check if required is present
    if (required.length >= 2) {
      const found = respLower.includes(required.toLowerCase())
      return { ruleId: rule.id, violated: !found, confidence: 'low', reason: found ? '检测到要求内容' : `未检测到: "${required}"` }
    }
  }

  // --- Pattern 3: 关键词匹配（fallback）---
  const keywords = contentLower.split(/[\s，,]+/).filter((w) => w.length >= 2)
  const found = keywords.some((kw) => respLower.includes(kw))
  // Can't determine violation from keyword presence alone
  return { ruleId: rule.id, violated: false, confidence: 'low', reason: '自动检查无法判断，建议人工审核' }
}
