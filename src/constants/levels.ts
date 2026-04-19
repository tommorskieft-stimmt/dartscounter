import type { PlayerLevel } from '@/types/domain'

export interface LevelCopy {
  id: PlayerLevel
  title: string
  description: string
}

// Level metadata — titles + blurbs shown in onboarding step 3 and the
// profile level sheet. Matches the iOS app's PlayerLevel copy.
export const LEVEL_COPY: readonly LevelCopy[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Just starting out. Still learning the board.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Comfortable with scoring. Working on doubles.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Reliable on common finishes. Hunting consistency.',
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Regularly out in 15 darts or fewer.',
  },
] as const

export function levelTitle(id: PlayerLevel): string {
  return LEVEL_COPY.find((l) => l.id === id)?.title ?? 'Beginner'
}
