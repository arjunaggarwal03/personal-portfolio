import type { WorkItem } from 'lib/types'

// Reverse-chronological. Narrative summaries, not resume bullets.
// Lightfield claims should be fact-checked before merge (ownership + public-safety).
export const work: WorkItem[] = [
  {
    company: 'Lightfield',
    role: 'Founding Engineer',
    location: 'San Francisco',
    startDate: '2025',
    current: true,
    summary:
      "I work across the product and systems behind Lightfield's CRM. I've helped turn product operations into a public API and Python SDK used by our own agent, built tools for creating and editing CRM tasks, and worked on workflow automation, human review, notifications, and core product surfaces. The recurring challenge is translating an ambiguous request into a change that is understandable to the user and correct in the product.",
    homeSummary:
      'Helped turn product operations into a public API and Python SDK used by Lightfield’s own agent, while building the task, review, and workflow systems around it.',
    tags: ['AI products', 'APIs', 'workflows', 'CRM'],
  },
  {
    company: 'Google / YouTube',
    role: 'Software Engineer',
    startDate: '2025',
    summary:
      "I joined YouTube's Living Room team and left after a week to join Lightfield. I wanted more ownership and a shorter distance between a product decision and the customer affected by it. It was also a high-variance bet made with limited information; that was part of the appeal.",
    tags: ['consumer product', 'connected TV'],
  },
  {
    company: 'Plato',
    role: 'Co-founder',
    startDate: '2024',
    endDate: '2025',
    summary:
      'We built an intelligent service catalog for internal engineering knowledge: natural-language service search, organized documentation spaces, and a support agent grounded in team documentation. We applied to Y Combinator but did not turn Plato into a lasting company. It was my first attempt to choose the problem, build the product, and convince other people it should exist.',
    tags: ['developer tools', 'search', 'knowledge systems'],
  },
  {
    company: 'Amazon Web Services',
    role: 'Software Development Engineer Intern',
    location: 'Seattle',
    startDate: '2024',
    summary:
      'I built reporting and reconciliation infrastructure for roughly ten million financial events a month. The system used SNS, SQS, Lambda, DynamoDB, EventBridge, S3, and CloudWatch to trace events across services and preserve reporting completeness through retries and partial failures.',
    homeSummary:
      'Built reporting and reconciliation infrastructure for roughly ten million financial events a month, designed around retries, partial failures, and reporting completeness.',
    tags: ['distributed systems', 'financial events', 'AWS'],
  },
  {
    company: 'Capital One',
    role: 'Machine Learning Engineering Intern',
    location: 'College Park',
    startDate: '2023',
    summary:
      'I worked with a roughly 900-million-edge graph representing relationships in card data. I rewrote motif queries with GraphFrames, improving their performance by about six times and making relationship queries practical at the dataset’s scale.',
    homeSummary:
      'Improved motif-query performance by roughly 6× on a 900-million-edge card graph using GraphFrames.',
    tags: ['graph systems', 'Spark', 'machine learning'],
  },
  {
    company: 'Bank of America',
    role: 'Software Engineering Intern',
    location: 'Jersey City',
    startDate: '2023',
    summary:
      'I automated part of an internal risk-testing workflow with Python and SQL, reducing its runtime by roughly 85 percent while preserving the checks analysts used to inspect the result.',
    tags: ['automation', 'Python', 'risk systems'],
  },
  {
    company: 'Mindgrasp',
    role: 'Software Engineer',
    location: 'College Park',
    startDate: '2022',
    summary:
      'I joined Mindgrasp before the product had traction and worked directly with the founders from their first UMD office. We were applying OCR and language models to lectures and study materials before most students had used a conversational AI product. It was my first close look at models becoming a product rather than remaining a demo or research result.',
    tags: ['applied AI', 'OCR', 'early-stage startups'],
  },
]

export function workDateRange(item: WorkItem): string {
  if (item.current) return `${item.startDate}–present`
  if (item.endDate && item.endDate !== item.startDate)
    return `${item.startDate}–${item.endDate}`
  return item.startDate
}
