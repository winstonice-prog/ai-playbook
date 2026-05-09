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
  const [newModel, setNewModel] = useState({ name: '', provider: '', modelId: '', baseUrl: '', apiType: 'openai' as 'openai' | 'anthropic' | 'gemini', apiKey: '' })

  const allModels = [...models, ...customModels]
  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)

  const handleTest = async (modelId: string) => {
    const key = apiKeys[modelId]
    if (!key) return
    setTesting((t) => ({ ...t, [modelId]: 'testing' }))
    const result = await testApiKey(modelId, key)
    setTesting((t) => ({ ...t, [modelId]: result.ok ? 'ok' : 'fail' }))
    setTestMsg((m) => ({ ...m, [modelId]: result.message }))
    setTimeout(() => setTesting((t) => { const n = { ...t }; delete n[modelId]; return n }), 3000)
  }

  const handleAddCustom = () => {
    if (!newModel.name || !newModel.modelId) return
    addCustomModel({
      name: newModel.name, provider: newModel.provider || newModel.name,
      modelId: newModel.modelId, baseUrl: newModel.baseUrl || 'https://api.openai.com/v1',
      apiType: newModel.apiType,
      color: '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'),
      description: 'Custom model',
      _apiKey: newModel.apiKey || undefined,
    } as any)
    setNewModel({ name: '', provider: '', modelId: '', baseUrl: '', apiType: 'openai', apiKey: '' })
    setShowAddForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-panel-card border border-panel-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-panel-border sticky top-0 bg-panel-card z-10">
          <h2 className="text-sm font-semibold">{T('settings')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* API Keys */}
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{T('apiKeys')}</h3>
            <p className="text-[10px] text-gray-600 mb-3">{T('apiKeysHint')}</p>
            {allModels.map((m) => (
              <div key={m.id} className="mb-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-medium text-gray-300">{m.name}</span>
                  {apiKeys[m.id] && <span className="text-[9px] text-panel-success">{lang === 'zh' ? '● 已填' : '● Set'}</span>}
                  {testing[m.id] === 'ok' && <Check size={12} className="text-panel-success" />}
                  {testing[m.id] === 'fail' && <XCircle size={12} className="text-panel-danger" />}
                  {testMsg[m.id] && <span className={`text-[9px] ${testing[m.id] === 'ok' ? 'text-panel-success' : 'text-panel-danger'}`}>{testMsg[m.id]}</span>}
                </div>
                <div className="flex gap-1">
                  <input type={showKeys[m.id] ? 'text' : 'password'} value={apiKeys[m.id] || ''}
                    onChange={(e) => setApiKey(m.id, e.target.value)} placeholder={m.provider + ' API Key'}
                    className="flex-1 bg-panel-bg border border-panel-border rounded px-2 py-1.5 text-xs text-gray-300 outline-none focus:border-panel-accent" />
                  <button onClick={() => setShowKeys({ ...showKeys, [m.id]: !showKeys[m.id] })} className="px-1.5 text-gray-600 hover:text-gray-400">
                    {showKeys[m.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleTest(m.id)} disabled={!apiKeys[m.id] || testing[m.id] === 'testing'}
                    className="px-2 py-1.5 rounded text-[10px] border border-panel-border text-gray-400 hover:text-panel-accent hover:border-panel-accent disabled:opacity-30 transition-colors whitespace-nowrap">
                    {testing[m.id] === 'testing' ? <Loader2 size={11} className="animate-spin" /> : T('test')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Model toggle */}
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{T('modelToggle')}</h3>
            {models.map((m) => (
              <div key={m.id} className="flex items-center gap-2 mb-1.5">
                <input type="checkbox" checked={m.enabled} onChange={() => toggleModel(m.id)} className="accent-panel-accent" />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-xs text-gray-300">{m.name}</span>
                <span className="text-[10px] text-gray-600 ml-auto">{m.modelId}</span>
              </div>
            ))}
          </div>

          {/* Custom models */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{T('customModels')}</h3>
              <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 text-[10px] text-panel-accent hover:underline">
                <Plus size={11} />{T('addCustom')}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-panel-bg border border-panel-border rounded-lg p-3 mb-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={newModel.name} onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder={T('modelName') + ' *'} className="bg-panel-card border border-panel-border rounded px-2 py-1 text-[10px] outline-none focus:border-panel-accent text-gray-300" />
                  <input value={newModel.provider} onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                    placeholder={T('providerName')} className="bg-panel-card border border-panel-border rounded px-2 py-1 text-[10px] outline-none focus:border-panel-accent text-gray-300" />
                </div>
                <input value={newModel.modelId} onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
                  placeholder={T('modelId') + ' *'} className="w-full bg-panel-card border border-panel-border rounded px-2 py-1 text-[10px] outline-none focus:border-panel-accent text-gray-300" />
                <div className="flex gap-2">
                  <input value={newModel.baseUrl} onChange={(e) => setNewModel({ ...newModel, baseUrl: e.target.value })}
                    placeholder={T('apiUrl')} className="flex-1 bg-panel-card border border-panel-border rounded px-2 py-1 text-[10px] outline-none focus:border-panel-accent text-gray-300" />
                  <select value={newModel.apiType} onChange={(e) => setNewModel({ ...newModel, apiType: e.target.value as any })}
                    className="bg-panel-card border border-panel-border rounded px-2 py-1 text-[10px] text-gray-300 outline-none">
                    <option value="openai">OpenAI Compatible</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddCustom} disabled={!newModel.name || !newModel.modelId}
                    className="flex-1 py-1.5 bg-panel-accent text-white rounded text-[10px] font-medium disabled:opacity-30 hover:opacity-90">{T('confirm')}</button>
                  <button onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 border border-panel-border rounded text-[10px] text-gray-500 hover:text-gray-300">{T('cancel')}</button>
                </div>
              </div>
            )}

            {customModels.length === 0 && !showAddForm && (
              <p className="text-[10px] text-gray-600 italic">{T('noCustomModels')}</p>
            )}
            <div className="space-y-1">
              {customModels.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-panel-bg rounded px-2 py-1.5">
                  <input type="checkbox" checked={m.enabled} onChange={() => toggleModel(m.id)} className="accent-panel-accent" />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs text-gray-300 flex-1">{m.name}</span>
                  <span className="text-[9px] text-gray-600">{m.modelId}</span>
                  <button onClick={() => removeCustomModel(m.id)} className="text-gray-700 hover:text-panel-danger"><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
