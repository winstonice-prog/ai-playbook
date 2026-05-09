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
import { Shield, Settings2, Wrench, Radio, GitBranch, Languages } from 'lucide-react'
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

  const T = (key: keyof typeof import('@/lib/i18n').zh, params?: Record<string, string | number>) =>
    t(lang, key, params)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (mode === 'orchestrate') setShowOrchSetup(true)
  }, [mode])

  if (!hydrated) return null

  const activeRules = ruleBook.rules.filter((r) => r.enabled && r.content).length
  const configuredModels = Object.values(apiKeys).filter(Boolean).length

  return (
    <>
      {!wizardDone && <SetupWizard onDone={() => {}} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <div className="flex h-screen flex-col bg-panel-bg">
        {/* Header */}
        <header className="border-b border-panel-border px-4 py-2 flex items-center gap-3 select-none">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-panel-accent" />
            <span className="text-sm font-semibold tracking-wide hidden sm:inline">{T('appTitle')}</span>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center bg-panel-card border border-panel-border rounded-lg p-0.5">
            <button onClick={() => setMode('broadcast')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all ${
                mode === 'broadcast' ? 'bg-panel-accent text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Radio size={12} />{T('broadcast')}
            </button>
            <button onClick={() => setMode('orchestrate')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all ${
                mode === 'orchestrate' ? 'bg-panel-accent text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <GitBranch size={12} />{T('orchestrate')}
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <ModelSelector />
          </div>

          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button onClick={toggleLang}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
              title="Switch Language">
              <Languages size={13} />
              <span className="hidden sm:inline text-[10px]">{lang === 'zh' ? 'EN' : '中'}</span>
            </button>

            {/* Orchestrate config */}
            {mode === 'orchestrate' && (
              <button onClick={() => setShowOrchSetup(!showOrchSetup)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all ${
                  showOrchSetup ? 'bg-panel-accent-soft text-panel-accent' : 'text-gray-500 hover:text-gray-300'}`}
                title="Workflow Config">
                <GitBranch size={13} />
                <span className="hidden sm:inline">{T('configure')}</span>
              </button>
            )}

            {/* Rules - always available */}
            <button onClick={() => setShowRules(!showRules)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all ${
                showRules ? 'bg-panel-accent-soft text-panel-accent' : 'text-gray-500 hover:text-gray-300'}`}>
              <Settings2 size={13} />
              <span className="hidden sm:inline">{T('rules')}</span>
              {activeRules > 0 && (
                <span className="bg-panel-accent text-white text-[9px] px-1 rounded-full min-w-[16px] text-center">{activeRules}</span>
              )}
            </button>

            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-300 transition-colors">
              <Wrench size={13} />
              <span className="hidden sm:inline">{T('settings')}</span>
              {configuredModels > 0 && (
                <span className="bg-panel-success/20 text-panel-success text-[9px] px-1 rounded-full">{configuredModels}</span>
              )}
            </button>
          </div>
        </header>

        <StatusBar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          <div className={`border-r border-panel-border overflow-hidden transition-all duration-200 ${
            showRules || (mode === 'orchestrate' && showOrchSetup) ? 'w-80 flex-shrink-0' : 'w-0'
          }`}>
            {mode === 'broadcast' && showRules && <RulesPanel />}
            {mode === 'orchestrate' && showOrchSetup && (
              showRules ? (
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-panel-border">
                    <button onClick={() => setShowOrchSetup(true)}
                      className={`flex-1 py-1.5 text-[10px] font-medium ${showOrchSetup ? 'text-panel-accent border-b border-panel-accent' : 'text-gray-600'}`}>
                      {T('configure')}
                    </button>
                    <button onClick={() => setShowRules(true)}
                      className={`flex-1 py-1.5 text-[10px] font-medium ${!showOrchSetup ? 'text-panel-accent border-b border-panel-accent' : 'text-gray-600'}`}>
                      {T('rules')}
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <OrchSetup />
                  </div>
                </div>
              ) : (
                <OrchSetup />
              )
            )}
            {mode === 'orchestrate' && !showOrchSetup && showRules && <RulesPanel />}
          </div>

          {/* Main panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {mode === 'broadcast' ? <ChatPanel /> : <OrchPanel />}
          </div>
        </div>
      </div>
    </>
  )
}
