'use client'

import { useState } from 'react'
import { useChatStore } from '@/lib/store'
import { X, Eye, EyeOff, Check, XCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import { t } from '@/lib/i18n'

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const lang = useChatStore((s) => s.lang)
  const apiKeys = useChatStore((s) => s.apiKeys)
  const setApiKey = useChatStore((s) => s.setApiKey)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const addCustomModel = useChatStore((s) => s.addCustomModel)
  const removeCustomModel = useChatStore((s) => s.removeCustomModel)
  const testApiKey = useChatStore((s) => s.testApiKey)
  const toggleModel = useChatStore((s) => s.toggleModel)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<Record<string, 'testing' | 'ok' | 'fail'>>({})
  const [testMsg, setTestMsg] = useState<Record<string, string>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [nm, setNm] = useState({ name: '', provider: '', modelId: '', baseUrl: '', apiType: 'openai' as const, apiKey: '' })
  const allModels = [...models, ...customModels]
  const T = (k: Parameters<typeof t>[1]) => t(lang, k)

  const handleTest = async (id: string) => {
    const key = apiKeys[id]; if (!key) return
    setTesting((t) => ({ ...t, [id]: 'testing' }))
    const r = await testApiKey(id, key)
    setTesting((t) => ({ ...t, [id]: r.ok ? 'ok' : 'fail' }))
    setTestMsg((m) => ({ ...m, [id]: r.message }))
    setTimeout(() => setTesting((t) => { const n = { ...t }; delete n[id]; return n }), 3000)
  }

  const handleAdd = () => {
    if (!nm.name || !nm.modelId) return
    addCustomModel({ name: nm.name, provider: nm.provider || nm.name, modelId: nm.modelId, baseUrl: nm.baseUrl || 'https://api.openai.com/v1', apiType: nm.apiType, color: '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'), description: '', _apiKey: nm.apiKey || undefined } as any)
    setNm({ name: '', provider: '', modelId: '', baseUrl: '', apiType: 'openai', apiKey: '' }); setShowAddForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface-card z-10">
          <h2 className="text-[15px] font-bold text-text-primary">{T('settings')}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary p-1"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">{T('apiKeys')}</h3>
            <p className="text-[12px] text-text-muted mb-4">{T('apiKeysHint')}</p>
            {allModels.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-[13px] font-medium text-text-primary">{m.name}</span>
                  {apiKeys[m.id] && <span className="text-[10px] text-green font-semibold">● Set</span>}
                  {testing[m.id] === 'ok' && <Check size={13} className="text-green" />}
                  {testing[m.id] === 'fail' && <XCircle size={13} className="text-red" />}
                </div>
                <div className="flex gap-1.5">
                  <input type={showKeys[m.id] ? 'text' : 'password'} value={apiKeys[m.id] || ''} onChange={(e) => setApiKey(m.id, e.target.value)}
                    placeholder={m.provider + ' API Key'} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-accent/30 placeholder:text-text-muted/50" />
                  <button onClick={() => setShowKeys({ ...showKeys, [m.id]: !showKeys[m.id] })} className="px-2 text-text-muted hover:text-text-secondary">{showKeys[m.id] ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  <button onClick={() => handleTest(m.id)} disabled={!apiKeys[m.id] || testing[m.id] === 'testing'}
                    className="px-3 py-2 rounded-lg text-[11px] font-medium border border-border text-text-muted hover:text-accent hover:border-accent/30 disabled:opacity-30 transition-colors">
                    {testing[m.id] === 'testing' ? <Loader2 size={12} className="animate-spin" /> : T('test')}
                  </button>
                </div>
                {testMsg[m.id] && <p className={`text-[11px] mt-1 ${testing[m.id] === 'ok' ? 'text-green' : 'text-red'}`}>{testMsg[m.id]}</p>}
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">{T('modelToggle')}</h3>
            {models.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 mb-2">
                <input type="checkbox" checked={m.enabled} onChange={() => toggleModel(m.id)} className="accent-accent w-4 h-4" />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-[13px] text-text-primary">{m.name}</span>
                <span className="text-[11px] text-text-muted ml-auto">{m.modelId}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{T('customModels')}</h3>
              <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"><Plus size={12} />{T('addCustom')}</button>
            </div>
            {showAddForm && (
              <div className="bg-surface border border-border rounded-xl p-4 mb-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <input value={nm.name} onChange={(e) => setNm({ ...nm, name: e.target.value })} placeholder={T('modelName') + ' *'} className="bg-surface-card border border-border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-accent/30 text-text-primary" />
                  <input value={nm.provider} onChange={(e) => setNm({ ...nm, provider: e.target.value })} placeholder={T('providerName')} className="bg-surface-card border border-border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-accent/30 text-text-primary" />
                </div>
                <input value={nm.modelId} onChange={(e) => setNm({ ...nm, modelId: e.target.value })} placeholder={T('modelId') + ' *'} className="w-full bg-surface-card border border-border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-accent/30 text-text-primary" />
                <div className="flex gap-2.5">
                  <input value={nm.baseUrl} onChange={(e) => setNm({ ...nm, baseUrl: e.target.value })} placeholder={T('apiUrl')} className="flex-1 bg-surface-card border border-border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-accent/30 text-text-primary" />
                  <select value={nm.apiType} onChange={(e) => setNm({ ...nm, apiType: e.target.value as any })} className="bg-surface-card border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary outline-none">
                    <option value="openai">OpenAI Compatible</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option>
                  </select>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={handleAdd} disabled={!nm.name || !nm.modelId} className="flex-1 py-2.5 bg-accent text-white rounded-lg text-[13px] font-semibold disabled:opacity-30 hover:opacity-90">{T('confirm')}</button>
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 border border-border rounded-lg text-[13px] text-text-muted hover:text-text-secondary">{T('cancel')}</button>
                </div>
              </div>
            )}
            {customModels.length === 0 && !showAddForm && <p className="text-[12px] text-text-muted italic">{T('noCustomModels')}</p>}
            <div className="space-y-1.5">
              {customModels.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 bg-surface rounded-lg px-3 py-2.5">
                  <input type="checkbox" checked={m.enabled} onChange={() => toggleModel(m.id)} className="accent-accent w-4 h-4" />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-[13px] text-text-primary flex-1">{m.name}</span>
                  <span className="text-[11px] text-text-muted">{m.modelId}</span>
                  <button onClick={() => removeCustomModel(m.id)} className="text-text-muted hover:text-red"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
