import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { ClarificationPrompt } from '@/components/console/clarification-prompt'
import type { Clarification } from '@/lib/api/contracts/agent'

describe('ClarificationPrompt (CONS-16)', () => {
  const mockClarification: Clarification = {
    question: 'What type of analysis would you like?',
    missingFields: ['beamLength', 'loadMagnitude'],
  }

  it('returns null when no clarification', () => {
    const { container } = render(createElement(ClarificationPrompt, { clarification: undefined }))
    expect(container.firstChild).toBeNull()
  })

  it('returns null when clarification has no question', () => {
    const clarificationWithoutQuestion: Clarification = {
      missingFields: ['field1'],
    }
    const { container } = render(
      createElement(ClarificationPrompt, { clarification: clarificationWithoutQuestion })
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders question when present', () => {
    render(createElement(ClarificationPrompt, { clarification: mockClarification }))
    expect(screen.getByText('What type of analysis would you like?')).toBeInTheDocument()
  })

  it('renders missing fields as list when present', () => {
    render(createElement(ClarificationPrompt, { clarification: mockClarification }))
    expect(screen.getByText('beamLength')).toBeInTheDocument()
    expect(screen.getByText('loadMagnitude')).toBeInTheDocument()
  })

  it('uses warning styling', () => {
    const { container } = render(createElement(ClarificationPrompt, { clarification: mockClarification }))
    const card = container.firstChild
    expect(card).toHaveClass('bg-amber-100')
  })

  it('shows clarification section title', () => {
    render(createElement(ClarificationPrompt, { clarification: mockClarification }))
    expect(screen.getByText('Clarification Required')).toBeInTheDocument()
  })

  it('shows missing fields section title when fields present', () => {
    render(createElement(ClarificationPrompt, { clarification: mockClarification }))
    expect(screen.getByText('Missing Fields')).toBeInTheDocument()
  })

  it('hides missing fields section when not present', () => {
    const clarificationWithoutFields: Clarification = {
      question: 'Just a question?',
    }
    render(createElement(ClarificationPrompt, { clarification: clarificationWithoutFields }))
    expect(screen.queryByText('Missing Fields')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      createElement(ClarificationPrompt, { clarification: mockClarification, className: 'custom-class' })
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
