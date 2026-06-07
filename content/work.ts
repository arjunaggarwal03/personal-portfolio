import type { WorkItem } from 'lib/types'

// Reverse-chronological. Narrative summaries, not resume bullets (doc 13.4).
export const work: WorkItem[] = [
  {
    company: 'Lightfield',
    role: 'Founding Engineer',
    location: 'San Francisco',
    startDate: '2025',
    current: true,
    summary:
      'Building infrastructure for agentic CRM: public APIs, workflow automation, agent tools, human-in-the-loop review, notifications, and core customer-facing product surfaces. The work is about making customer context actionable for both people and agents.',
    tags: ['agents', 'apis', 'workflow', 'crm'],
  },
  {
    company: 'Google / YouTube',
    role: 'Software Engineer',
    startDate: '2025',
    summary:
      'Joined YouTube Living Room / Connected Experience, then left early for Lightfield to work closer to founders, move faster, and take on more ownership.',
    tags: ['frontend', 'tv', 'consumer'],
  },
  {
    company: 'Plato',
    role: 'Founder',
    startDate: '2024',
    endDate: '2025',
    summary:
      'Co-founded an intelligent service catalog for internal engineering knowledge: natural-language service search, organized documentation spaces, and a support agent grounded in team docs. We applied to YC with the idea.',
    tags: ['devtools', 'search', 'agents'],
  },
  {
    company: 'Amazon Web Services',
    role: 'SDE Intern',
    startDate: '2024',
    summary:
      'Built financial reconciliation infrastructure for high-volume payment events. The work was about reliable systems: tracing failures, preserving reporting completeness, and making financial data trustworthy as it moved across services.',
    tags: ['payments', 'infra', 'reliability'],
  },
  {
    company: 'Capital One',
    role: 'ML Engineering Intern',
    startDate: '2023',
    summary:
      'Worked on graph ML infrastructure for large-scale card and customer relationship data. I spent a lot of that internship studying how Twitter and Facebook modeled social graphs, especially systems like TAO, and started to see how much product intelligence comes from making relationship data queryable. This is where the context-graph thread started.',
    tags: ['graph-ml', 'infra', 'context'],
  },
  {
    company: 'Bank of America',
    role: 'Software Engineering Intern',
    startDate: '2023',
    summary:
      'Worked in Enterprise Risk & Finance Technology, automating internal risk workflows with Python, SQL, and data-processing jobs: taking manual analyst work and making it faster, cleaner, and less painful to repeat.',
    tags: ['automation', 'python', 'enterprise'],
  },
  {
    company: 'Mindgrasp',
    role: 'Software Engineer',
    startDate: '2022',
    summary:
      'Joined early, before the product had traction, working directly with the founders out of their first UMD office. It was my first close-up look at an AI-native product: early OCR and language models applied to lectures and study materials. Mindgrasp has since grown into an AI study platform used by millions of students.',
    tags: ['ai', 'ocr', 'nlp', 'early-stage'],
  },
]

export function workDateRange(item: WorkItem): string {
  if (item.current) return `${item.startDate}–present`
  if (item.endDate && item.endDate !== item.startDate)
    return `${item.startDate}–${item.endDate}`
  return item.startDate
}
