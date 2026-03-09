import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArtifactsList } from '@/components/console/artifacts-list'
import type { Artifact } from '@/lib/api/contracts/agent'

describe('ArtifactsList (CONS-11)', () => {
  const sampleArtifacts: Artifact[] = [
    { format: 'markdown', path: '/output/report.md' },
    { format: 'json', path: '/output/data.json' },
  ]

  it('returns null when no artifacts (undefined)', () => {
    const { container } = render(<ArtifactsList artifacts={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when empty array', () => {
    const { container } = render(<ArtifactsList artifacts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all artifacts when provided', () => {
    const { container } = render(<ArtifactsList artifacts={sampleArtifacts} />)

    expect(screen.getByText('Artifacts')).toBeInTheDocument()
    // Text is split across spans, so check for text content presence
    expect(container.textContent).toContain('markdown')
    expect(container.textContent).toContain('/output/report.md')
    expect(container.textContent).toContain('json')
    expect(container.textContent).toContain('/output/data.json')
  })

  it('displays format and path for each artifact', () => {
    const { container } = render(<ArtifactsList artifacts={sampleArtifacts} />)

    // Check that each list item contains both format and path
    const listItems = container.querySelectorAll('li')
    expect(listItems[0].textContent).toContain('markdown')
    expect(listItems[0].textContent).toContain('/output/report.md')
    expect(listItems[1].textContent).toContain('json')
    expect(listItems[1].textContent).toContain('/output/data.json')
  })

  it('renders artifacts in a list structure', () => {
    const { container } = render(<ArtifactsList artifacts={sampleArtifacts} />)

    // Should have list items
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(2)
  })
})
