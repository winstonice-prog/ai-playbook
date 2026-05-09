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

  return (
    <div className="p-4 h-full overflow-y-auto bg-surface-secondary">
      <h2 className="text-[15px] font-bold text-text-primary mb-1">{T('orchWorkflow')}</h2>
      <p className="text-[12px] text-text-muted mb-4">{T('orchDesc')}</p>

      <textarea value={task} onChange={(e) => setTask(e.target.value)} placeholder={T('taskPlaceholder')} rows={2}
        disabled={orchRunning || brainstormRunning}
        className="w-full bg-surface-card border border-border rounded-xl p-3 text-[13px] outline-none focus:border-accent/30 resize-none text-text-primary placeholder:text-text-muted/50 mb-3 disabled:opacity-50" />

      <button onClick={() => task.trim() && startBrainstorm(task.trim())}
        disabled={!task.trim() || brainstormRunning || orchRunning}
        className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 bg-accent-soft text-accent border border-accent/10 rounded-xl text-[13px] font-semibold hover:bg-accent hover:text-white disabled:opacity-30 transition-all">
        {brainstormRunning ? <><Loader2 size={14} className="animate-spin" />{T('brainstorming')}</>
          : brainstormDone ? <><RotateCcw size={14} />{T('rebrainstorm')}</>
          : <><Brain size={14} />{T('brainstorm')}</>}
      </button>

      {brainstormDone && (
        <div className="mb-4 border border-accent/10 rounded-xl bg-accent-soft/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-green" />
            <span className="text-[13px] font-semibold text-text-primary">{T('brainstormResult')}</span>
          </div>
          <div className="space-y-2 mb-3">
            {Object.entries(brainstormProposals).map(([modelId, proposal]) => {
              const model = allModels.find((m) => m.id === modelId)
              return (
                <div key={modelId} className="bg-surface/50 rounded-lg p-3 text-[12px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: model?.color }} />
                    <span className="font-semibold text-text-primary">{model?.name}</span>
                    <ArrowRight size={11} className="text-text-muted" />
                    <span className="text-accent font-semibold">{proposal.roleName}</span>
                  </div>
                  <p className="text-text-muted ml-5">{proposal.reason}</p>
                </div>
              )
            })}
          </div>
          <button onClick={() => { applyBrainstorm(); clearBrainstorm() }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity">
            <Check size={14} />{T('confirmAssign')}
          </button>
        </div>
      )}

      {brainstormRunning && brainstormThread.length > 0 && (
        <div className="mb-4 border border-border rounded-xl p-4 max-h-60 overflow-y-auto bg-surface-card">
          <p className="text-[12px] text-accent font-semibold mb-2">{T('brainstorming')}…</p>
          {brainstormThread.map((msg) => {
            const model = allModels.find((m) => m.id === msg.from)
            return (
              <div key={msg.id} className="mb-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: model?.color }} />
                  <span className="text-[12px] font-medium text-text-primary">{msg.fromName}</span>
                  {msg.status === 'streaming' && <Loader2 size={11} className="animate-spin text-accent" />}
                </div>
                <p className="text-[12px] text-text-muted whitespace-pre-wrap ml-3">{msg.content || 'Thinking…'}</p>
              </div>
            )
          })}
        </div>
      )}

      {activeRoles.length > 0 && (
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">{T('jobPositions')}</label>
          <div className="space-y-1.5">
            {activeRoles.map((role, idx) => {
              const model = allModels.find((m) => m.id === role.modelId)
              return (
                <div key={role.modelId} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                  className={`bg-surface-card border rounded-xl p-3 transition-all ${dragIdx === idx ? 'border-accent bg-accent-soft/20' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <button className="text-text-muted hover:text-text-secondary cursor-grab"><GripVertical size={14} /></button>
                    <span className="text-[11px] font-bold text-text-muted w-4">{idx + 1}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model?.color }} />
                    <span className="text-[13px] font-semibold text-text-primary">{role.roleName}</span>
                    <span className="text-[11px] text-text-muted ml-auto">{model?.name}</span>
                    <button onClick={() => setOrchRole(role.modelId, { enabled: false })} className="text-text-muted hover:text-red"><Trash2 size={13} /></button>
                  </div>
                  <div className="text-[12px] text-text-muted ml-7">{role.instructions}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {enabledModels.filter((m) => !orchRoles.find((r) => r.modelId === m.id && r.enabled)).length > 0 && (
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">{T('availableModels')}</label>
          <div className="flex flex-wrap gap-1.5">
            {enabledModels.filter((m) => !orchRoles.find((r) => r.modelId === m.id && r.enabled)).map((m) => (
              <button key={m.id} onClick={() => setOrchRole(m.id, { roleName: m.name, instructions: '', enabled: true })}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border text-text-muted hover:border-border-light hover:text-text-secondary transition-colors">+ {m.name}</button>
            ))}
          </div>
        </div>
      )}

      {activeRoles.length > 0 && (
        <button onClick={() => task.trim() && startOrchestrate(task.trim())}
          disabled={!task.trim() || orchRunning}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:opacity-90 disabled:opacity-30 shadow-sm transition-opacity">
          <Play size={15} />{orchRunning ? T('running') : T('startOrchestrate')}
        </button>
      )}
    </div>
  )
}
