import type { Experiment, ExperimentGroup } from 'lib/types'

// Older projects, demoted and reframed. 1-2 sentences each (doc section 18).
export const experiments: Experiment[] = [
  {
    title: 'ByteSize',
    year: '2024',
    group: 'AI / Search',
    summary:
      'Semantic document search built at UMD\u2019s Bitcamp, before ChatGPT made this obvious. Search documents by meaning and related terms instead of verbatim matches.',
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
      'A CLI tool for developer communication: message code snippets from the terminal, with semantic search over message history using BERT embeddings and a vector database.',
    tags: ['devtools', 'embeddings', 'fastapi'],
  },
  {
    title: 'Music Similarity Search',
    group: 'AI / Search',
    summary:
      'Audio embeddings and vector search for music discovery \u2014 finding songs by how they sound rather than how they\u2019re tagged.',
    tags: ['audio', 'embeddings'],
  },
  {
    title: 'Movie Success Prediction',
    year: '2024',
    group: 'AI / Search',
    summary:
      'A first real pass at data science: EDA, feature engineering, and an XGBoost classifier predicting whether a film would be a hit or a flop.',
    tags: ['ml', 'xgboost', 'data-science'],
  },
  {
    title: 'Unix-like Shell in C',
    year: '2024',
    group: 'Systems',
    summary:
      'A small command-line shell in C with tokenization into a command tree, supporting pipes, file redirection, boolean operators, and process control.',
    tags: ['c', 'systems', 'os'],
  },
  {
    title: 'YOLO Parking Pass Detector',
    year: '2022',
    group: 'Computer Vision',
    summary:
      'A computer-vision system that detected vehicle parking passes at ~96% accuracy using YOLOv3 for detection and Google OCR for reading pass numbers.',
    tags: ['cv', 'yolo', 'ocr'],
  },
  {
    title: 'Platonic Rotation',
    year: '2021',
    group: 'Computer Vision',
    summary:
      'A visualization of applied linear algebra: rotating and projecting platonic solids from 3D to 2D with transformation matrices in OpenCV.',
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
