'use client'

import { useChatStore } from '@/lib/store'
import { GripVertical, Trash2, Plus, Play, Brain, Check, ArrowRight, Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { t } from '@/lib/i18n'

export default function OrchSetup() {
  const lang = useChatStore((s) => s.lang)
  const models = useChatStore((s) => s.models)
  const customModels = useChatStore((s) => s.customModels)
  const orchRoles = useChatStore((s) => s.orchRoles)
  const setOrchRole = useChatStore((s) => s.setOrchRole)
  const reorderOrchRoles = useChatStore((s) => s.reorderOrchRoles)
  const startOrchestrate = useChatStore((s) => s.startOrchestrate)
  const orchRunning = useChatStore((s) => s.orchRunning)
  const brainstormThread = useChatStore((s) => s.brainstormThread)
  const brainstormRunning = useChatStore((s) => s.brainstormRunning)
  const brainstormDone = useChatStore((s) => s.brainstormDone)
  const brainstormProposals = useChatStore((s) => s.brainstormProposals)
  const startBrainstorm = useChatStore((s) => s.startBrainstorm)
  const applyBrainstorm = useChatStore((s) => s.applyBrainstorm)
  const clearBrainstorm = useChatStore((s) => s.clearBrainstorm)
  const [task, setTask] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const allModels = [...models, ...customModels]
  const enabledModels = allModels.filter((m) => m.enabled)
  const activeRoles = orchRoles.filter((r) => r.enabled)
  const T = (k: Parameters<typeof t>[1], p?: Record<string, string | number>) => t(lang, k, p)

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) { reorderOrchRoles(dragIdx, idx); setDragIdx(idx) } }
  const handleDragEnd = () => setDragIdx(null)

  const autoFillRoles = () => {
    const defaults = [
      { roleName: T('researcher'), instructions: T('researcherDesc') },
      { roleName: T('analyst'), instructions: T('analystDesc') },
      { roleName: T('reviewer'), instructions: T('reviewerDesc') },
    ]
    enabledModels.forEach((m, i) => {
      if (i < defaults.length) setOrchRole(m.id, { roleName: defaults[i].roleName, instructions: defaults[i].instructions, enabled: true })
    })
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-sm font-semibold text-panel-accent mb-1">{T('orchWorkflow')}</h2>
      <p className="text-[11px] text-gray-600 mb-4">{T('orchDesc')}</p>

      <div className="mb-3">
        <textarea value={task} onChange={(e) => setTask(e.target.value)}
          placeholder={T('taskPlaceholder')} rows={2} disabled={orchRunning || brainstormRunning}
          className="w-full bg-panel-bg border border-panel-border rounded p-2 text-xs outline-none focus:border-panel-accent resize-none text-gray-300 placeholder-gray-600 disabled:opacity-50" />
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => task.trim() && startBrainstorm(task.trim())}
          disabled={!task.trim() || brainstormRunning || orchRunning}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-panel-accent-soft text-panel-accent border border-panel-accent/30 rounded-lg text-xs font-medium hover:bg-panel-accent hover:text-white disabled:opacity-30 transition-all">
          {brainstormRunning ? <><Loader2 size={13} className="animate-spin" />{T('brainstorming')}</>
            : brainstormDone ? <><RotateCcw size={13} />{T('rebrainstorm')}</>
            : <><Brain size={13} />{T('brainstorm')}</>}
        </button>
      </div>

      {brainstormDone && (
        <div className="mb-4 border border-panel-accent/30 rounded-lg bg-panel-accent-soft/30 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Check size={12} className="text-panel-success" />
            <span className="text-[11px] font-medium text-panel-accent">{T('brainstormResult')}</span>
          </div>
          <div className="space-y-2 mb-3">
            {Object.entries(brainstormProposals).map(([modelId, proposal]) => {
              const model = allModels.find((m) => m.id === modelId)
              return (
                <div key={modelId} className="text-[10px] bg-panel-bg/50 rounded p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model?.color }} />
                    <span className="font-medium text-gray-200">{model?.name}</span>
                    <ArrowRight size={10} className="text-gray-600" />
                    <span className="text-panel-accent font-medium">{proposal.roleName}</span>
                  </div>
                  <p className="text-gray-500 ml-5">{proposal.reason}</p>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { applyBrainstorm(); clearBrainstorm() }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-panel-success text-white rounded text-[11px] font-medium hover:opacity-90">
              <Check size={12} />{T('confirmAssign')}
            </button>
          </div>
        </div>
      )}

      {brainstormRunning && brainstormThread.length > 0 && (
        <div className="mb-4 border border-panel-border rounded-lg p-3 max-h-60 overflow-y-auto">
          <p className="text-[10px] text-panel-accent mb-2 font-medium">{T('brainstorming')}</p>
          <div className="space-y-2">
            {brainstormThread.map((msg) => {
              const model = allModels.find((m) => m.id === msg.from)
              return (
                <div key={msg.id} className="text-[10px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: model?.color }} />
                    <span className="text-gray-300 font-medium">{msg.fromName}</span>
                    {msg.status === 'streaming' && <Loader2 size={9} className="animate-spin text-panel-accent" />}
                  </div>
                  <p className="text-gray-500 whitespace-pre-wrap pl-3">{msg.content || (lang === 'zh' ? '思考中...' : 'Thinking...')}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeRoles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">{T('jobPositions')}</label>
            {activeRoles.length === 0 && (
              <button onClick={autoFillRoles} className="text-[10px] text-panel-accent hover:underline">{T('quickFill')}</button>
            )}
          </div>
          <div className="space-y-1">
            {activeRoles.map((role, idx) => {
              const model = allModels.find((m) => m.id === role.modelId)
              return (
                <div key={role.modelId} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                  className={`border rounded p-2 text-xs transition-all ${dragIdx === idx ? 'border-panel-accent bg-panel-accent-soft' : 'border-panel-border'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <button className="text-gray-700 hover:text-gray-400 cursor-grab"><GripVertical size={12} /></button>
                    <span className="text-[10px] font-bold text-gray-500 w-3">{idx + 1}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model?.color }} />
                    <span className="text-gray-200 font-medium text-[11px]">{role.roleName}</span>
                    <span className="text-[10px] text-gray-600 ml-auto">{model?.name}</span>
                    <button onClick={() => setOrchRole(role.modelId, { enabled: false })} className="text-gray-700 hover:text-panel-danger"><Trash2 size={12} /></button>
                  </div>
                  <div className="text-[10px] text-gray-500 ml-6">{role.instructions}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {enabledModels.filter((m) => !orchRoles.find((r) => r.modelId === m.id && r.enabled)).length > 0 && (
        <div className="mb-4">
          <label className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 block">{T('availableModels')}</label>
          <div className="flex flex-wrap gap-1">
            {enabledModels.filter((m) => !orchRoles.find((r) => r.modelId === m.id && r.enabled)).map((m) => (
              <button key={m.id} onClick={() => setOrchRole(m.id, { roleName: m.name, instructions: '', enabled: true })}
                className="px-2 py-1 rounded text-[10px] border border-panel-border text-gray-500 hover:border-gray-500 hover:text-gray-200">
                + {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeRoles.length > 0 && (
        <button onClick={() => task.trim() && startOrchestrate(task.trim())}
          disabled={!task.trim() || orchRunning}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-panel-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-30">
          <Play size={14} />{orchRunning ? T('running') : T('startOrchestrate')}
        </button>
      )}
    </div>
  )
}
