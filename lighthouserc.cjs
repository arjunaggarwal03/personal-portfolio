module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start -- -p 3100',
      startServerReadyPattern: 'Ready',
      numberOfRuns: 3,
      url: [
        'http://localhost:3100/',
        'http://localhost:3100/work',
        'http://localhost:3100/writing/why-this-site-exists',
        'http://localhost:3100/log',
        'http://localhost:3100/log/fixture-image-gallery',
        'http://localhost:3100/log/fixture-video-gallery',
        'http://localhost:3100/now',
      ],
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage',
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.03 }],
        'total-blocking-time': ['error', { maxNumericValue: 100 }],
        'speed-index': ['error', { maxNumericValue: 2000 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
}
