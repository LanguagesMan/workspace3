'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type DependencyList,
  type ReactNode,
} from 'react'
import ActionTray, { type ActionTrayProps } from '@/components/navigation/ActionTray'

export type BackgroundVariant = 'plain' | 'hero' | 'dim'

const backgroundMap: Record<BackgroundVariant, string> = {
  plain: 'bg-brand-surface',
  hero: 'bg-brand-surface bg-[radial-gradient(circle_at_20%_20%,rgba(139,130,255,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,115,183,0.16),transparent_55%)]',
  dim: 'bg-[#05050F]',
}

interface ChromeState {
  topBar: ReactNode | null
  actionTray: ActionTrayProps | null
  backgroundVariant: BackgroundVariant
  vignette: boolean
}

interface ChromeContextValue {
  state: ChromeState
  defaults: ChromeState
  updateChrome: (patch: Partial<ChromeState>) => void
  resetChrome: (keys?: Array<keyof ChromeState>) => void
}

const MobileShellContext = createContext<ChromeContextValue | null>(null)

export interface MobileShellProps {
  children: ReactNode
  defaultBackground?: BackgroundVariant
  defaultVignette?: boolean
}

export default function MobileShell({
  children,
  defaultBackground = 'plain',
  defaultVignette = true,
}: MobileShellProps) {
  const defaultState = useMemo<ChromeState>(
    () => ({
      topBar: null,
      actionTray: null,
      backgroundVariant: defaultBackground,
      vignette: defaultVignette,
    }),
    [defaultBackground, defaultVignette]
  )

  const [state, setState] = useState<ChromeState>(defaultState)

  const updateChrome = useCallback((patch: Partial<ChromeState>) => {
    setState((prev) => ({
      ...prev,
      ...patch,
    }))
  }, [])

  const resetChrome = useCallback(
    (keys?: Array<keyof ChromeState>) => {
      setState((prev) => {
        if (!keys || keys.length === 0) {
          return defaultState
        }
        const next = { ...prev }
        for (const key of keys) {
          next[key] = defaultState[key]
        }
        return next
      })
    },
    [defaultState]
  )

  const value = useMemo<ChromeContextValue>(
    () => ({
      state,
      defaults: defaultState,
      updateChrome,
      resetChrome,
    }),
    [state, defaultState, updateChrome, resetChrome]
  )

  return (
    <MobileShellContext.Provider value={value}>
      <ShellFrame>{children}</ShellFrame>
    </MobileShellContext.Provider>
  )
}

function ShellFrame({ children }: { children: ReactNode }) {
  const context = useMobileShellContext()
  const { state } = context
  const { topBar, actionTray, backgroundVariant, vignette } = state

  return (
    <div
      className={`relative min-h-screen overflow-hidden text-brand-textPrimary transition-colors duration-500 ${backgroundMap[backgroundVariant]}`}
    >
      {vignette && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.65),transparent_60%)] transition-opacity duration-500"
        />
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        {topBar && (
          <div className="z-30 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
            {topBar}
          </div>
        )}

        <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+96px)]">{children}</main>
      </div>

      {actionTray && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] transition-transform duration-300">
          <ActionTray {...actionTray} className="pointer-events-auto" />
        </div>
      )}
    </div>
  )
}

export function useMobileShellChrome(config: Partial<ChromeState>, deps: DependencyList = []) {
  const context = useMobileShellContext()

  useEffect(() => {
    if (!context) return
    context.updateChrome(config)
    const keys = Object.keys(config) as Array<keyof ChromeState>
    return () => {
      context.resetChrome(keys)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, ...deps])
}

export function useMobileShellState() {
  const context = useMobileShellContext()
  return context.state
}

function useMobileShellContext() {
  const context = useContext(MobileShellContext)
  if (!context) {
    throw new Error('useMobileShellChrome must be used within MobileShell')
  }
  return context
}

