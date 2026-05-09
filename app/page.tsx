'use client'

import { useEffect, useState } from 'react'
import StatusBar from '@/components/StatusBar'
import ChatPanel from '@/components/ChatPanel'
import OrchPanel from '@/components/OrchPanel'
import OrchSetup from '@/components/OrchSetup'
import RulesPanel from '@/components/RulesPanel'
import ModelSelector from '@/components/ModelSelector'
import SetupWizard from '@/components/SetupWizard'
import SettingsPanel from '@/components/SettingsPanel'
import { useChatStore } from '@/lib/store'
import { Settings2, Wrench, Radio, GitBranch, Languages } from 'lucide-react'
import { t } from '@/lib/i18n'

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const wizardDone = useChatStore((s) => s.wizardDone)
  const lang = useChatStore((s) => s.lang)
  const toggleLang = useChatStore((s) => s.toggleLang)
  const ruleBook = useChatStore((s) => s.ruleBook)
  const apiKeys = useChatStore((s) => s.apiKeys)
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)
  const [showRules, setShowRules] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showOrchSetup, setShowOrchSetup] = useState(mode === 'orchestrate')

  const T = (k: keyof typeof import('@/lib/i18n').zh, p?: Record<string, string | number>) => t(lang, k, p)

  useEffect(() => { setHydrated(true) }, [])
  useEffect(() => { if (mode === 'orchestrate') setShowOrchSetup(true) }, [mode])

  if (!hydrated) return null

  const activeRules = ruleBook.rules.filter((r) => r.enabled && r.content).length
  const configured = Object.values(apiKeys).filter(Boolean).length

  return (
    <>
      {!wizardDone && <SetupWizard onDone={() => {}} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <div className="flex h-screen flex-col bg-surface">
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0 select-none bg-surface-secondary/50 backdrop-blur">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-accent" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-text-primary">
              AI Playbook
            </span>
          </div>

          {/* Mode switch */}
          <div className="flex items-center bg-surface-card border border-border rounded-md p-0.5 ml-2">
            <button onClick={() => setMode('broadcast')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-medium transition-all ${
                mode === 'broadcast' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
              <Radio size={13} />{T('broadcast')}
            </button>
            <button onClick={() => setMode('orchestrate')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-medium transition-all ${
                mode === 'orchestrate' ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
              <GitBranch size={13} />{T('orchestrate')}
            </button>
          </div>

          {/* Model selector */}
          <div className="flex-1 flex justify-center">
            <ModelSelector />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button onClick={toggleLang}
              className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
              title="Language">
              <Languages size={15} />
            </button>

            {mode === 'orchestrate' && (
              <button onClick={() => setShowOrchSetup(!showOrchSetup)}
                className={`h-8 px-2.5 flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-all ${
                  showOrchSetup ? 'bg-accent-soft text-accent' : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}>
                <GitBranch size={13} />{T('configure')}
              </button>
            )}

            <button onClick={() => setShowRules(!showRules)}
              className={`h-8 px-2.5 flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-all ${
                showRules ? 'bg-accent-soft text-accent' : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}>
              <Settings2 size={13} />{T('rules')}
              {activeRules > 0 && (
                <span className="bg-accent text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none">{activeRules}</span>
              )}
            </button>

            <button onClick={() => setShowSettings(true)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors">
              <Wrench size={15} />
            </button>
          </div>
        </header>

        <StatusBar />

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`border-r border-border overflow-hidden transition-all duration-200 bg-surface-secondary ${
            showRules || (mode === 'orchestrate' && showOrchSetup) ? 'w-80 shrink-0' : 'w-0'
          }`}>
            {mode === 'broadcast' && showRules && <RulesPanel />}
            {mode === 'orchestrate' && showOrchSetup && (
              showRules ? (
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-border px-1">
                    <button onClick={() => { setShowOrchSetup(true); setShowRules(false) }}
                      className={`flex-1 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                        !showRules ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
                      {T('configure')}
                    </button>
                    <button onClick={() => { setShowRules(true); setShowOrchSetup(false) }}
                      className={`flex-1 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                        showRules && !showOrchSetup ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
                      {T('rules')}
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden"><OrchSetup /></div>
                </div>
              ) : <OrchSetup />
            )}
            {mode === 'orchestrate' && showRules && !showOrchSetup && (
              <div className="flex flex-col h-full">
                <div className="flex border-b border-border px-1">
                  <button onClick={() => { setShowOrchSetup(true); setShowRules(false) }}
                    className="flex-1 py-2 text-[12px] font-medium border-b-2 border-transparent text-text-muted hover:text-text-secondary transition-colors">
                    {T('configure')}
                  </button>
                  <button onClick={() => { setShowRules(true); setShowOrchSetup(false) }}
                    className="flex-1 py-2 text-[12px] font-medium border-b-2 border-accent text-text-primary transition-colors">
                    {T('rules')}
                  </button>
                </div>
                <div className="flex-1 overflow-hidden"><RulesPanel /></div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {mode === 'broadcast' ? <ChatPanel /> : <OrchPanel />}
          </div>
        </div>
      </div>
    </>
  )
}
