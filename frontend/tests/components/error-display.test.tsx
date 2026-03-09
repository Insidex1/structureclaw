import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorDisplay } from '@/components/console/error-display'
import type { AgentError } from '@/lib/api/contracts/agent'

/**
 * ErrorDisplay Component Tests
 *
 * Tests for error display component with accessibility features:
 * - role="alert" for screen reader announcement
 * - aria-live="assertive" for immediate announcement
 * - Focus management when error appears
 */
describe('ErrorDisplay', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('returns null when no error is provided', () => {
      render(<ErrorDisplay error={null} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('renders error message when error is provided', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('renders error code when provided', () => {
      const error: AgentError = { message: 'Test error', code: 'ERR_001' }
      render(<ErrorDisplay error={error} />)
      expect(screen.getByText(/Code: ERR_001/)).toBeInTheDocument()
    })

    it('renders error details when provided', () => {
      const error: AgentError = {
        message: 'Test error',
        details: { field: 'value' },
      }
      render(<ErrorDisplay error={error} />)
      expect(screen.getByText(/field/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="alert"', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('has aria-live="assertive"', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('has tabIndex={-1} to allow programmatic focus', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('tabIndex', '-1')
    })

    it('has aria-hidden="true" on the icon (decorative)', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const icon = screen.getByRole('alert').querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('focus management', () => {
    it('receives focus when error appears', () => {
      const error: AgentError = { message: 'Test error message' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveFocus()
    })
  })

  describe('styling', () => {
    it('uses destructive styling classes', () => {
      const error: AgentError = { message: 'Test error' }
      render(<ErrorDisplay error={error} />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('bg-destructive')
    })

    it('accepts custom className', () => {
      const error: AgentError = { message: 'Test error' }
      render(<ErrorDisplay error={error} className="custom-class" />)
      const alert = screen.getByRole('alert')
      expect(alert.className).toContain('custom-class')
    })
  })
})
