import type { Artifact } from '@/lib/api/contracts/agent'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ArtifactsListProps {
  artifacts: Artifact[] | undefined
}

/**
 * Displays a list of execution artifacts with format and path
 * Returns null if no artifacts to display
 */
export function ArtifactsList({ artifacts }: ArtifactsListProps) {
  // Return null if no artifacts or empty array
  if (!artifacts || artifacts.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Artifacts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {artifacts.map((artifact, index) => (
            <li key={index} className="font-mono">
              <span className="text-muted-foreground">{artifact.format}:</span>{' '}
              <span>{artifact.path}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
