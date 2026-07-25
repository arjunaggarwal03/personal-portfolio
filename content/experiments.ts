import type { Experiment, ExperimentGroup } from 'lib/types'

// Older projects, demoted and reframed. 1-2 sentences each.
export const experiments: Experiment[] = [
  {
    title: 'ByteSize',
    year: '2024',
    group: 'AI / Search',
    summary:
      'A Bitcamp prototype for semantic document search: query a collection by meaning and related language rather than exact wording.',
    tags: ['nlp', 'semantic-search'],
    links: [
      { label: 'GitHub', url: 'https://github.com/arjunaggarwal03/bytesize' },
    ],
  },
  {
    title: 'Hermes',
    year: '2024',
    group: 'AI / Search',
    summary:
      'A command-line tool for sending code snippets and searching message history by meaning. I used it to experiment with BERT embeddings, vector search, and a developer workflow that stayed inside the terminal.',
    tags: ['devtools', 'embeddings', 'fastapi'],
  },
  {
    title: 'Music Similarity Search',
    group: 'AI / Search',
    summary:
      'An experiment in finding songs by how they sound rather than how they are labeled, using learned audio representations and vector search.',
    tags: ['audio', 'embeddings'],
  },
  {
    title: 'Movie Success Prediction',
    year: '2024',
    group: 'AI / Search',
    summary:
      'An early data-science project using exploratory analysis, feature engineering, and XGBoost to predict whether a film would be commercially successful.',
    tags: ['ml', 'xgboost', 'data-science'],
  },
  {
    title: 'Unix-like Shell in C',
    year: '2024',
    group: 'Systems',
    summary:
      'A small shell with tokenization into a command tree, pipes, file redirection, boolean operators, and process control. Building it made operating-system abstractions considerably less abstract.',
    tags: ['c', 'systems', 'os'],
  },
  {
    title: 'YOLO Parking Pass Detector',
    year: '2022',
    group: 'Computer Vision',
    summary:
      'A computer-vision system that detected vehicle parking passes at roughly 96 percent accuracy, then used OCR to read the pass number.',
    tags: ['cv', 'yolo', 'ocr'],
  },
  {
    id: 'platonic-rotation',
    title: 'Platonic Rotation',
    year: '2021',
    group: 'Computer Vision',
    summary:
      'A visualization of linear algebra: rotate Platonic solids in three dimensions and project them into two using transformation matrices and OpenCV.',
    tags: ['graphics', 'opencv', 'linear-algebra'],
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/arjunaggarwal03/platonic-rotation',
      },
    ],
  },
]

export const experimentGroupOrder: ExperimentGroup[] = [
  'AI / Search',
  'Systems',
  'Computer Vision',
  'Other',
]
