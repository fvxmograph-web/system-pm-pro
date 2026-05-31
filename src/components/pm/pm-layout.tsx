'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { PMViewRouter } from './pm-view-router'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TooltipProvider } from '@/components/ui/tooltip'

const SIDEBAR_WIDTH = 280
const SIDEBAR_WIDTH_COLLAPSED = 68
const SIDEBAR_TRANSITION = 'width 250ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1)'

export function PMLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setMobileMenuOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }, [isMobile])

  const currentWidth = isMobile ? 0 : sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              'hidden md:flex flex-col shrink-0 border-r border-border h-full',
              'transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]'
            )}
            style={{ width: currentWidth }}
          >
            <AppSidebar collapsed={sidebarCollapsed} />
          </aside>
        )}

        {/* Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              className={cn(
                'fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] border-r border-border',
                'animate-in slide-in-from-left duration-250 ease-out'
              )}
            >
              <AppSidebar collapsed={false} />
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <AppHeader onToggleSidebar={toggleSidebar} />

          <ScrollArea className="flex-1">
            <main className="p-6 max-w-[1600px] mx-auto w-full">
              <PMViewRouter />
            </main>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  )
}
