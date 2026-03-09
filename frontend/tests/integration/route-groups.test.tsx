import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import MarketingLayout from '@/app/(marketing)/layout'

describe('Route Groups (LAYT-03)', () => {
  describe('Marketing Layout', () => {
    it('marketing layout exists at app/(marketing)/layout.tsx', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/(marketing)/layout.tsx')
      expect(existsSync(layoutPath)).toBe(true)
    })

    it('marketing layout renders children', () => {
      render(
        <MarketingLayout>
          <div data-testid="child-content">Test Content</div>
        </MarketingLayout>
      )
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('marketing layout has minimal header without sidebar', () => {
      render(
        <MarketingLayout>
          <div>Content</div>
        </MarketingLayout>
      )
      // Should have header element
      expect(screen.getByRole('banner')).toBeInTheDocument()
      // Should have navigation to console
      expect(screen.getByRole('link', { name: /console/i })).toBeInTheDocument()
    })
  })

  describe('Console Layout', () => {
    it('console layout exists at app/(console)/layout.tsx', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/(console)/layout.tsx')
      expect(existsSync(layoutPath)).toBe(true)
    })

    it('console layout includes SidebarProvider', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/(console)/layout.tsx')
      const content = readFileSync(layoutPath, 'utf-8')
      expect(content).toContain('SidebarProvider')
    })

    it('console layout includes AppSidebar component', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/(console)/layout.tsx')
      const content = readFileSync(layoutPath, 'utf-8')
      expect(content).toContain('AppSidebar')
    })

    it('console layout includes Header component', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/(console)/layout.tsx')
      const content = readFileSync(layoutPath, 'utf-8')
      expect(content).toContain('Header')
    })
  })

  describe('Route Group URLs', () => {
    it('marketing page exists at app/(marketing)/page.tsx for / route', () => {
      const pagePath = path.join(process.cwd(), 'src/app/(marketing)/page.tsx')
      expect(existsSync(pagePath)).toBe(true)
    })

    it('console page exists at app/(console)/console/page.tsx for /console route', () => {
      const pagePath = path.join(process.cwd(), 'src/app/(console)/console/page.tsx')
      expect(existsSync(pagePath)).toBe(true)
    })
  })
})
