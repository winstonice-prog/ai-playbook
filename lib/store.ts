import { create } from 'zustand'
import { AI_MODELS, AIModel } from '@/lib/ai-models'
import { loadRuleBook, saveRuleBook, createRule, buildInjectionPrompt, checkCompliance, RuleBook, Rule } from '@/lib/rule-engine'

export interface ModelStatus {
  modelId: string
  status: 'idle' | 'loading' | 'done' | 'error'
  response: string
  error?: string
  triggeredRules: string[]
}

export interface OrchRole {
  modelId: string
  roleName: string
  instructions: string
  enabled: boolean
}

export interface AttachedImage {
  id: string
  name: string
  dataUrl: string
  mimeType: string
  size: number
}

export interface OrchMessage {
  id: string
  from: string // modelId or 'human' or 'system'
  fromName: string
  to: string // modelId or 'human' or 'all'
  toName: string
  content: string
  status: 'pending' | 'streaming' | 'done' | 'error'
  triggeredRules: string[]
  timestamp: number
}

interface SettingsStore {
  apiKeys: Record<string, string>
  setApiKey: (modelId: string, key: string) => void
  wizardDone: boolean
  setWizardDone: () => void
  lang: 'zh' | 'en'
  toggleLang: () => void
}

interface ChatStore extends SettingsStore {
  mode: 'broadcast' | 'orchestrate'
  setMode: (m: 'broadcast' | 'orchestrate') => void

  models: AIModel[]
  customModels: AIModel[]
  addCustomModel: (model: Partial<AIModel>) => void
  removeCustomModel: (id: string) => void
  updateCustomModel: (id: string, patch: Partial<AIModel>) => void
  allModels: AIModel[]
  toggleModel: (id: string) => void
  updateModelConfig: (id: string, patch: { modelId?: string; baseUrl?: string }) => void
  testApiKey: (modelId: string, apiKey: string) => Promise<{ ok: boolean; message: string }>

  ruleBook: RuleBook
  addRule: (partial?: Partial<Rule>) => void
  updateRule: (id: string, patch: Partial<Rule>) => void
  deleteRule: (id: string) => void
  reorderRules: (fromIndex: number, toIndex: number) => void
  getRulePrompt: (modelId: string) => string

  // Broadcast mode
  input: string
  setInput: (v: string) => void
  attachedImages: AttachedImage[]
  addImage: (file: File) => Promise<void>
  removeImage: (id: string) => void
  clearImages: () => void
  modelStatuses: ModelStatus[]
  sendMessage: () => Promise<void>
  sending: boolean
  abortSend: () => void

  // Orchestrate mode
  orchRoles: OrchRole[]
  setOrchRole: (modelId: string, patch: Partial<OrchRole>) => void
  reorderOrchRoles: (fromIndex: number, toIndex: number) => void
  orchThread: OrchMessage[]
  orchRunning: boolean
  orchPaused: boolean
  orchCurrentStep: number
  orchHumanInput: string
  setOrchHumanInput: (v: string) => void
  startOrchestrate: (task: string) => Promise<void>
  orchIntervene: () => Promise<void>
  orchContinue: () => void
  orchStop: () => void

  // Brainstorm (auto role assignment)
  brainstormThread: OrchMessage[]
  brainstormRunning: boolean
  brainstormDone: boolean
  brainstormProposals: Record<string, { roleName: string; reason: string }>
  startBrainstorm: (task: string) => Promise<void>
  applyBrainstorm: () => void
  clearBrainstorm: () => void
}

function loadApiKeys(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('ai-rc-apikeys')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveApiKeys(keys: Record<string, string>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ai-rc-apikeys', JSON.stringify(keys))
}

function loadOrchRoles(): OrchRole[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ai-rc-orchroles')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveOrchRoles(roles: OrchRole[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ai-rc-orchroles', JSON.stringify(roles))
}

let broadcastAbortControllers: AbortController[] = []
let orchAbortController: AbortController | null = null

function buildOrchSystemPrompt(role: OrchRole, ruleBook: RuleBook, previousMessages: OrchMessage[]): string {
  const parts: string[] = []

  // Rule book injection
  const rulePrompt = buildInjectionPrompt(ruleBook, role.modelId)
  if (rulePrompt) parts.push(rulePrompt)

  // Role instructions
  parts.push(`## 你的角色\n你是团队中的【${role.roleName}】。\n${role.instructions}`)

  // Context: what happened before
  if (previousMessages.length > 0) {
    parts.push('\n## 之前的对话')
    for (const msg of previousMessages) {
      parts.push(`[${msg.fromName} → ${msg.toName}]: ${msg.content}`)
    }
  }

  parts.push('\n请根据你的角色，基于以上对话内容执行你的任务。直接输出结果，不要加前缀说明。')
  return parts.join('\n')
}

export const useChatStore = create<ChatStore>((set, get) => ({
  mode: 'broadcast',
  setMode: (m) => set({ mode: m }),

  // API Keys
  apiKeys: {},
  setApiKey: (modelId, key) => {
    const keys = { ...get().apiKeys, [modelId]: key }
    saveApiKeys(keys)
    set({ apiKeys: keys })
  },

  // Language
  lang: 'zh',
  toggleLang: () => {
    const next = get().lang === 'zh' ? 'en' : 'zh'
    localStorage.setItem('ai-rc-lang', next)
    set({ lang: next })
  },

  // Wizard
  wizardDone: false,
  setWizardDone: () => {
    localStorage.setItem('ai-rc-wizard', '1')
    set({ wizardDone: true })
  },

  // Models
  models: AI_MODELS,
  customModels: [],
  addCustomModel: (partial) =>
    set((s) => {
      const apiKeyToSet = (partial as any)._apiKey
      delete (partial as any)._apiKey
      const model: AIModel = {
        id: 'custom-' + Math.random().toString(36).slice(2, 8),
        name: '',
        provider: '',
        apiType: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        color: '#6c5ce7',
        enabled: true,
        modelId: '',
        description: '',
        ...partial,
      }
      const updated = [...s.customModels, model]
      localStorage.setItem('ai-rc-custom-models', JSON.stringify(updated))
      const newKeys = apiKeyToSet ? { ...s.apiKeys, [model.id]: apiKeyToSet } : s.apiKeys
      if (apiKeyToSet) saveApiKeys(newKeys)
      return { customModels: updated, apiKeys: newKeys }
    }),
  removeCustomModel: (id) =>
    set((s) => {
      const updated = s.customModels.filter((m) => m.id !== id)
      localStorage.setItem('ai-rc-custom-models', JSON.stringify(updated))
      // Also remove its API key
      const keys = { ...s.apiKeys }
      delete keys[id]
      saveApiKeys(keys)
      return { customModels: updated, apiKeys: keys }
    }),
  updateCustomModel: (id, patch) =>
    set((s) => {
      const updated = s.customModels.map((m) => (m.id === id ? { ...m, ...patch } : m))
      localStorage.setItem('ai-rc-custom-models', JSON.stringify(updated))
      return { customModels: updated }
    }),
  allModels: [],
  toggleModel: (id) =>
    set((s) => {
      const inBuiltin = s.models.find((m) => m.id === id)
      if (inBuiltin) {
        return { models: s.models.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)) }
      }
      return { customModels: s.customModels.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)) }
    }),
  updateModelConfig: (id, patch) =>
    set((s) => {
      const inBuiltin = s.models.find((m) => m.id === id)
      if (inBuiltin) {
        return { models: s.models.map((m) => (m.id === id ? { ...m, ...patch } : m)) }
      }
      const updated = s.customModels.map((m) => (m.id === id ? { ...m, ...patch } : m))
      localStorage.setItem('ai-rc-custom-models', JSON.stringify(updated))
      return { customModels: updated }
    }),
  testApiKey: async (modelId, apiKey) => {
    const model = [...get().models, ...get().customModels].find((m) => m.id === modelId)
    if (!model) return { ok: false, message: '模型不存在' }
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, apiKey }),
      })
      const data = await res.json()
      return data
    } catch (e: any) {
      return { ok: false, message: e.message || '网络错误' }
    }
  },

  // Rule book
  ruleBook: { id: 'default', name: '默认规则书', rules: [] },
  addRule: (partial) =>
    set((s) => {
      const updated = { ...s.ruleBook, rules: [...s.ruleBook.rules, createRule(partial)] }
      saveRuleBook(updated)
      return { ruleBook: updated }
    }),
  updateRule: (id, patch) =>
    set((s) => {
      const updated = {
        ...s.ruleBook,
        rules: s.ruleBook.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }
      saveRuleBook(updated)
      return { ruleBook: updated }
    }),
  deleteRule: (id) =>
    set((s) => {
      const updated = { ...s.ruleBook, rules: s.ruleBook.rules.filter((r) => r.id !== id) }
      saveRuleBook(updated)
      return { ruleBook: updated }
    }),
  reorderRules: (fromIndex, toIndex) =>
    set((s) => {
      const rules = [...s.ruleBook.rules]
      const [moved] = rules.splice(fromIndex, 1)
      rules.splice(toIndex, 0, moved)
      const updated = { ...s.ruleBook, rules }
      saveRuleBook(updated)
      return { ruleBook: updated }
    }),
  getRulePrompt: (modelId) => buildInjectionPrompt(get().ruleBook, modelId),

  // Broadcast mode
  input: '',
  setInput: (v) => set({ input: v }),
  attachedImages: [],
  addImage: async (file) => {
    const id = 'img-' + Math.random().toString(36).slice(2, 8)
    const reader = new FileReader()
    return new Promise((resolve) => {
      reader.onload = () => {
        set((s) => ({
          attachedImages: [...s.attachedImages, {
            id,
            name: file.name,
            dataUrl: reader.result as string,
            mimeType: file.type,
            size: file.size,
          }],
        }))
        resolve()
      }
      reader.readAsDataURL(file)
    })
  },
  removeImage: (id) => set((s) => ({
    attachedImages: s.attachedImages.filter((img) => img.id !== id),
  })),
  clearImages: () => set({ attachedImages: [] }),
  modelStatuses: [],
  sending: false,

  sendMessage: async () => {
    const { input, models, customModels, getRulePrompt, apiKeys, ruleBook, attachedImages } = get()
    if (!input.trim() && attachedImages.length === 0) return

    const enabledModels = [...models, ...customModels].filter((m) => m.enabled)
    if (enabledModels.length === 0) return

    const imgData = attachedImages
    set({ sending: true, input: '', attachedImages: [] })
    broadcastAbortControllers = []

    const statuses: ModelStatus[] = enabledModels.map((m) => ({
      modelId: m.id,
      status: 'loading' as const,
      response: '',
      triggeredRules: [],
    }))
    set({ modelStatuses: statuses })

    await Promise.all(
      enabledModels.map(async (model) => {
        const idx = statuses.findIndex((s) => s.modelId === model.id)
        const ac = new AbortController()
        broadcastAbortControllers.push(ac)

        try {
          const rulePrompt = getRulePrompt(model.id)
          const apiKey = apiKeys[model.id]
          if (!apiKey) throw new Error(`请先配置 ${model.name} 的 API Key`)

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              message: input,
              rulePrompt: rulePrompt || null,
              apiKey,
              images: imgData.length > 0 ? imgData.map((i) => ({ dataUrl: i.dataUrl, mimeType: i.mimeType })) : null,
            }),
            signal: ac.signal,
          })

          if (!res.ok) {
            const errText = await res.text()
            throw new Error(errText || `HTTP ${res.status}`)
          }

          const reader = res.body?.getReader()
          if (!reader) throw new Error('No response stream')

          const decoder = new TextDecoder()
          let full = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            full += decoder.decode(value, { stream: true })
            set((s) => {
              const updated = [...s.modelStatuses]
              if (updated[idx]) updated[idx] = { ...updated[idx], response: full }
              return { modelStatuses: updated }
            })
          }

          // Smart compliance check
          const triggered = ruleBook.rules
            .filter((r) => r.enabled && r.content)
            .map((r) => checkCompliance(r, full))
            .filter((c) => c.violated)
            .map((c) => c.ruleId)

          set((s) => {
            const updated = [...s.modelStatuses]
            if (updated[idx]) updated[idx] = { ...updated[idx], status: 'done' as const, triggeredRules: triggered }
            return { modelStatuses: updated }
          })
        } catch (e: any) {
          if (e.name === 'AbortError') return
          set((s) => {
            const updated = [...s.modelStatuses]
            if (updated[idx]) updated[idx] = { ...updated[idx], status: 'error' as const, error: e.message || '未知错误' }
            return { modelStatuses: updated }
          })
        }
      })
    )

    set({ sending: false })
  },

  abortSend: () => {
    broadcastAbortControllers.forEach((ac) => ac.abort())
    broadcastAbortControllers = []
    set({ sending: false })
  },

  // Orchestrate mode
  orchRoles: [],
  setOrchRole: (modelId, patch) =>
    set((s) => {
      if (!s.orchRoles.find((r) => r.modelId === modelId)) {
        const model = [...s.models, ...s.customModels].find((m) => m.id === modelId)
        const newRole: OrchRole = {
          modelId,
          roleName: model?.name || modelId,
          instructions: '',
          enabled: true,
          ...patch,
        }
        const updated = [...s.orchRoles, newRole]
        saveOrchRoles(updated)
        return { orchRoles: updated }
      }
      const updated = s.orchRoles.map((r) => (r.modelId === modelId ? { ...r, ...patch } : r))
      saveOrchRoles(updated)
      return { orchRoles: updated }
    }),
  reorderOrchRoles: (fromIndex, toIndex) =>
    set((s) => {
      const roles = [...s.orchRoles]
      const [moved] = roles.splice(fromIndex, 1)
      roles.splice(toIndex, 0, moved)
      saveOrchRoles(roles)
      return { orchRoles: roles }
    }),

  orchThread: [],
  orchRunning: false,
  orchPaused: false,
  orchCurrentStep: 0,
  orchHumanInput: '',
  setOrchHumanInput: (v) => set({ orchHumanInput: v }),

  startOrchestrate: async (task: string) => {
    const { orchRoles, apiKeys, ruleBook, models } = get()
    const activeRoles = orchRoles.filter((r) => r.enabled)
    if (activeRoles.length === 0) return

    // Check all have API keys
    for (const role of activeRoles) {
      if (!apiKeys[role.modelId]) {
        const model = [...models, ...customModels].find((m) => m.id === role.modelId)
        set((s) => ({
          orchThread: [...s.orchThread, {
            id: Math.random().toString(36).slice(2),
            from: 'system', fromName: '系统',
            to: 'human', toName: '你',
            content: `错误：${model?.name || role.modelId} 未配置 API Key`,
            status: 'error', triggeredRules: [], timestamp: Date.now(),
          }],
        }))
        return
      }
    }

    orchAbortController = new AbortController()

    // Initial task message
    const taskMsg: OrchMessage = {
      id: Math.random().toString(36).slice(2),
      from: 'human', fromName: '你',
      to: activeRoles[0].modelId, toName: activeRoles[0].roleName,
      content: task,
      status: 'done', triggeredRules: [], timestamp: Date.now(),
    }
    set({ orchThread: [taskMsg], orchRunning: true, orchPaused: false, orchCurrentStep: 0 })

    // Execute pipeline
    for (let i = 0; i < activeRoles.length; i++) {
      const { orchPaused: paused } = get()
      if (paused) break

      const role = activeRoles[i]
      const model = [...models, ...customModels].find((m) => m.id === role.modelId)!

      const msgId = Math.random().toString(36).slice(2)
      const streamMsg: OrchMessage = {
        id: msgId,
        from: role.modelId, fromName: role.roleName,
        to: i < activeRoles.length - 1 ? activeRoles[i + 1].modelId : 'human',
        toName: i < activeRoles.length - 1 ? activeRoles[i + 1].roleName : '你',
        content: '',
        status: 'streaming', triggeredRules: [], timestamp: Date.now(),
      }

      set((s) => ({
        orchThread: [...s.orchThread, streamMsg],
        orchCurrentStep: i,
      }))

      try {
        const previousMsgs = get().orchThread.filter((m) => m.id !== msgId && m.status === 'done')
        const systemPrompt = buildOrchSystemPrompt(role, ruleBook, previousMsgs)
        const apiKey = apiKeys[role.modelId]!

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, message: task, rulePrompt: systemPrompt, apiKey, isOrch: true }),
          signal: orchAbortController.signal,
        })

        if (!res.ok) throw new Error(await res.text())

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No stream')

        const decoder = new TextDecoder()
        let full = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          set((s) => ({
            orchThread: s.orchThread.map((m) => (m.id === msgId ? { ...m, content: full } : m)),
          }))
        }

        // Smart compliance check
        const triggered = ruleBook.rules
          .filter((r) => r.enabled && r.content)
          .map((r) => checkCompliance(r, full))
          .filter((c) => c.violated)
          .map((c) => c.ruleId)

        set((s) => ({
          orchThread: s.orchThread.map((m) =>
            m.id === msgId ? { ...m, status: 'done' as const, triggeredRules: triggered } : m
          ),
        }))

        // Check if paused after each step
        const { orchPaused: nowPaused } = get()
        if (nowPaused) break

      } catch (e: any) {
        if (e.name === 'AbortError') break
        set((s) => ({
          orchThread: s.orchThread.map((m) =>
            m.id === msgId ? { ...m, status: 'error' as const, content: e.message || '请求失败' } : m
          ),
        }))
        break
      }
    }

    set({ orchRunning: false, orchPaused: false, orchCurrentStep: get().orchRoles.filter((r) => r.enabled).length - 1 })
  },

  orchIntervene: async () => {
    const { orchHumanInput, orchRoles, apiKeys, ruleBook, models } = get()
    if (!orchHumanInput.trim()) return

    const activeRoles = orchRoles.filter((r) => r.enabled)
    const currentStep = get().orchCurrentStep

    // Human message
    const humanMsg: OrchMessage = {
      id: Math.random().toString(36).slice(2),
      from: 'human', fromName: '你',
      to: 'all', toName: '所有 AI',
      content: orchHumanInput,
      status: 'done', triggeredRules: [], timestamp: Date.now(),
    }

    set((s) => ({
      orchThread: [...s.orchThread, humanMsg],
      orchHumanInput: '',
    }))

    // Send to all active AIs in parallel, collect responses
    const responses: OrchMessage[] = []
    for (const role of activeRoles) {
      const model = [...models, ...customModels].find((m) => m.id === role.modelId)!
      const apiKey = apiKeys[role.modelId]
      if (!apiKey) continue

      const msgId = Math.random().toString(36).slice(2)
      const streamMsg: OrchMessage = {
        id: msgId, from: role.modelId, fromName: role.roleName,
        to: 'human', toName: '你', content: '',
        status: 'streaming', triggeredRules: [], timestamp: Date.now(),
      }
      set((s) => ({ orchThread: [...s.orchThread, streamMsg] }))

      try {
        const previousMsgs = get().orchThread.filter((m) => m.id !== msgId && m.status === 'done')
        const systemPrompt = buildOrchSystemPrompt(role, ruleBook, previousMsgs)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, message: orchHumanInput, rulePrompt: systemPrompt, apiKey, isOrch: true }),
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(errText)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('No stream')

        const decoder = new TextDecoder()
        let full = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          set((s) => ({
            orchThread: s.orchThread.map((m) => (m.id === msgId ? { ...m, content: full } : m)),
          }))
        }

        // Smart compliance check
        const triggered = ruleBook.rules
          .filter((r) => r.enabled && r.content)
          .map((r) => checkCompliance(r, full))
          .filter((c) => c.violated)
          .map((c) => c.ruleId)

        set((s) => ({
          orchThread: s.orchThread.map((m) =>
            m.id === msgId ? { ...m, status: 'done' as const, triggeredRules: triggered } : m
          ),
        }))
      } catch (e: any) {
        set((s) => ({
          orchThread: s.orchThread.map((m) =>
            m.id === msgId ? { ...m, status: 'error' as const, content: e.message || '错误' } : m
          ),
        }))
      }
    }
  },

  orchContinue: () => set({ orchPaused: false }),

  orchStop: () => {
    if (orchAbortController) orchAbortController.abort()
    orchAbortController = null
    set({ orchRunning: false, orchPaused: false })
  },

  // Brainstorm
  brainstormThread: [],
  brainstormRunning: false,
  brainstormDone: false,
  brainstormProposals: {},

  startBrainstorm: async (task: string) => {
    const { models, customModels, apiKeys, ruleBook } = get()
    const enabledModels = [...models, ...customModels].filter((m) => m.enabled)
    if (enabledModels.length === 0) return

    set({ brainstormRunning: true, brainstormDone: false, brainstormProposals: {}, brainstormThread: [] })

    const userPrompt = `【团队任务】
${task}

【你的任务】
分析以上团队任务，思考需要哪些工作岗位来完成它，然后建议你自己最适合担任哪个角色。

请用以下格式回复（务必严格遵守格式，不要多说其他内容）：

角色：[角色名称]
理由：[为什么你最适合这个角色，1-2句话]`

    const thread: OrchMessage[] = []

    await Promise.all(
      enabledModels.map(async (model) => {
        const apiKey = apiKeys[model.id]
        if (!apiKey) {
          thread.push({
            id: Math.random().toString(36).slice(2),
            from: model.id, fromName: model.name,
            to: 'human', toName: '你',
            content: '未配置 API Key，跳过',
            status: 'error', triggeredRules: [], timestamp: Date.now(),
          })
          return
        }

        const msgId = Math.random().toString(36).slice(2)
        const streamMsg: OrchMessage = {
          id: msgId, from: model.id, fromName: model.name,
          to: 'human', toName: '你',
          content: '',
          status: 'streaming', triggeredRules: [], timestamp: Date.now(),
        }
        thread.push(streamMsg)
        set({ brainstormThread: [...thread] })

        try {
          const rulePrompt = buildInjectionPrompt(ruleBook, model.id)
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              message: userPrompt,
              rulePrompt: rulePrompt || null,
              apiKey,
            }),
          })

          if (!res.ok) throw new Error(await res.text())

          const reader = res.body?.getReader()
          if (!reader) throw new Error('No stream')

          const decoder = new TextDecoder()
          let full = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            full += decoder.decode(value, { stream: true })
            set((s) => ({
              brainstormThread: s.brainstormThread.map((m) =>
                m.id === msgId ? { ...m, content: full } : m
              ),
            }))
          }

          set((s) => {
            const updated = s.brainstormThread.map((m) =>
              m.id === msgId ? { ...m, status: 'done' as const } : m
            )
            return { brainstormThread: updated }
          })

          // Parse proposal
          const roleMatch = full.match(/角色[：:]\s*(.+)/)
          const reasonMatch = full.match(/理由[：:]\s*(.+)/)
          if (roleMatch) {
            set((s) => ({
              brainstormProposals: {
                ...s.brainstormProposals,
                [model.id]: {
                  roleName: roleMatch[1].trim(),
                  reason: reasonMatch?.[1]?.trim() || '',
                },
              },
            }))
          }
        } catch (e: any) {
          set((s) => ({
            brainstormThread: s.brainstormThread.map((m) =>
              m.id === msgId ? { ...m, status: 'error' as const, content: e.message || '请求失败' } : m
            ),
          }))
        }
      })
    )

    set({ brainstormRunning: false, brainstormDone: true })
  },

  applyBrainstorm: () => {
    const { brainstormProposals } = get()
    const roles: OrchRole[] = Object.entries(brainstormProposals).map(([modelId, proposal]) => ({
      modelId,
      roleName: proposal.roleName,
      instructions: proposal.reason || `担任${proposal.roleName}`,
      enabled: true,
    }))
    saveOrchRoles(roles)
    set({ orchRoles: roles })
  },

  clearBrainstorm: () => set({
    brainstormThread: [],
    brainstormRunning: false,
    brainstormDone: false,
    brainstormProposals: {},
  }),
}))

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const keys = loadApiKeys()
  if (Object.keys(keys).length > 0) { useChatStore.setState({ apiKeys: keys }) }
  const saved = loadRuleBook()
  if (saved.rules.length > 0) { useChatStore.setState({ ruleBook: saved }) }
  const wizard = localStorage.getItem('ai-rc-wizard')
  if (wizard === '1') { useChatStore.setState({ wizardDone: true }) }
  const savedRoles = loadOrchRoles()
  if (savedRoles.length > 0) { useChatStore.setState({ orchRoles: savedRoles }) }
  const savedCustomModels = localStorage.getItem('ai-rc-custom-models')
  if (savedCustomModels) {
    try { useChatStore.setState({ customModels: JSON.parse(savedCustomModels) }) } catch {}
  }
  const savedLang = localStorage.getItem('ai-rc-lang')
  if (savedLang === 'en' || savedLang === 'zh') {
    useChatStore.setState({ lang: savedLang })
  }
}
