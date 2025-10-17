/**
 * 🔥 Firecrawl MCP Smart Scraping Examples
 * 
 * These examples show how to use Firecrawl MCP for intelligent web scraping,
 * competitor analysis, and code extraction.
 * 
 * Usage: FIRECRAWL_API_KEY=your-key node mcp-examples/firecrawl-smart-scraping.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Configuration
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
if (!FIRECRAWL_API_KEY) {
    console.error('❌ Error: FIRECRAWL_API_KEY environment variable is required');
    console.error('Set it in .env file or run: FIRECRAWL_API_KEY=your-key node mcp-examples/firecrawl-smart-scraping.js');
    process.exit(1);
}
const RESEARCH_DIR = path.join(__dirname, '../research-data');
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots/firecrawl');

// Ensure directories exist
[RESEARCH_DIR, SCREENSHOTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Example 1: Scrape TikTok Feed Implementation
 * 
 * Use with MCP:
 * "Use Firecrawl to analyze TikTok's feed implementation and extract scroll behavior"
 */
const tiktokFeedAnalysis = {
  name: 'TikTok Feed Implementation',
  url: 'https://www.tiktok.com',
  target: 'feed',
  
  extract: {
    structure: 'DOM structure of video cards',
    css: 'Scroll container styles and animations',
    javascript: 'Scroll physics and snap behavior',
    interactions: 'Like, share, comment button patterns'
  },
  
  focusAreas: [
    'Scroll container (.tiktok-main-container)',
    'Video card layout (.video-feed-item)',
    'Progress indicators',
    'Swipe gesture handling',
    'Video loading strategy',
    'Subtitle positioning'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/tiktok-feed-analysis.json`,
    screenshots: `${SCREENSHOTS_DIR}/tiktok-feed/`,
    notes: 'Focus on scroll physics and snap points'
  }
};

/**
 * Example 2: Duolingo Gamification Patterns
 * 
 * Use with MCP:
 * "Crawl Duolingo and extract their gamification UI patterns"
 */
const duolingoGamificationAnalysis = {
  name: 'Duolingo Gamification Analysis',
  url: 'https://www.duolingo.com',
  
  extract: {
    streakSystem: {
      ui: 'Streak display and animations',
      logic: 'Streak counting mechanism',
      rewards: 'Reward notifications'
    },
    
    xpSystem: {
      ui: 'XP progress bars',
      animations: 'XP gain animations',
      badges: 'Achievement badges'
    },
    
    lessonFlow: {
      structure: 'Lesson card layouts',
      progression: 'Path visualization',
      feedback: 'Success/error feedback patterns'
    }
  },
  
  focusAreas: [
    'Streak flame icon and counter',
    'XP progress animations',
    'Lesson completion celebrations',
    'Daily goal UI',
    'Achievement popups'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/duolingo-gamification.json`,
    screenshots: `${SCREENSHOTS_DIR}/duolingo/`,
    components: `${RESEARCH_DIR}/duolingo-components/`
  }
};

/**
 * Example 3: Instagram Reels Video Player
 * 
 * Use with MCP:
 * "Extract Instagram Reels video player implementation and controls"
 */
const instagramReelsAnalysis = {
  name: 'Instagram Reels Player',
  url: 'https://www.instagram.com/reels',
  
  extract: {
    videoPlayer: {
      controls: 'Play/pause, sound toggle',
      gestures: 'Tap to pause, double-tap to like',
      autoplay: 'Autoplay logic and timing'
    },
    
    overlay: {
      interactions: 'Like, comment, share buttons',
      positioning: 'Button layout and spacing',
      animations: 'Button press animations'
    },
    
    scrollBehavior: {
      physics: 'Vertical scroll implementation',
      preloading: 'Video preload strategy',
      buffering: 'Loading indicators'
    }
  },
  
  focusAreas: [
    'Video container structure',
    'Control button SVGs',
    'Scroll snap CSS',
    'Preload logic',
    'Sound toggle implementation'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/instagram-reels.json`,
    code: `${RESEARCH_DIR}/instagram-code/`,
    assets: `${RESEARCH_DIR}/instagram-assets/`
  }
};

/**
 * Example 4: YouTube Shorts Architecture
 * 
 * Use with MCP:
 * "Crawl YouTube Shorts and analyze their architecture"
 */
const youtubeShortsAnalysis = {
  name: 'YouTube Shorts Architecture',
  url: 'https://www.youtube.com/shorts',
  
  extract: {
    player: {
      initialization: 'Player setup and configuration',
      controls: 'Custom control implementation',
      quality: 'Adaptive quality switching'
    },
    
    comments: {
      drawer: 'Comments drawer UI',
      interaction: 'Comment interaction patterns',
      loading: 'Lazy loading strategy'
    },
    
    recommendations: {
      algorithm: 'Related shorts loading',
      prefetch: 'Prefetching strategy',
      infinite: 'Infinite scroll implementation'
    }
  },
  
  focusAreas: [
    'Player container',
    'Comment drawer animation',
    'Infinite scroll logic',
    'Video queue management',
    'Thumbnail generation'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/youtube-shorts.json`,
    screenshots: `${SCREENSHOTS_DIR}/youtube-shorts/`,
    analysis: `${RESEARCH_DIR}/youtube-shorts-analysis.md`
  }
};

/**
 * Example 5: Babbel Learning Interface
 * 
 * Use with MCP:
 * "Scrape Babbel's learning interface and lesson structure"
 */
const babbelLearningAnalysis = {
  name: 'Babbel Learning Interface',
  url: 'https://www.babbel.com',
  
  extract: {
    lessonTypes: {
      vocabulary: 'Vocabulary learning patterns',
      grammar: 'Grammar explanation UI',
      conversation: 'Conversation practice interface'
    },
    
    feedback: {
      correct: 'Success feedback animations',
      incorrect: 'Error feedback patterns',
      hints: 'Hint system implementation'
    },
    
    progress: {
      tracking: 'Progress bar designs',
      completion: 'Lesson completion UI',
      review: 'Review reminder system'
    }
  },
  
  focusAreas: [
    'Exercise card layouts',
    'Audio player controls',
    'Answer feedback animations',
    'Progress tracking UI',
    'Spaced repetition hints'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/babbel-learning.json`,
    patterns: `${RESEARCH_DIR}/babbel-patterns/`,
    ui: `${SCREENSHOTS_DIR}/babbel/`
  }
};

/**
 * Example 6: GitHub Trending Repos - Video Players
 * 
 * Use with MCP:
 * "Find top React video player repos on GitHub and extract implementations"
 */
const githubVideoPlayersSearch = {
  name: 'GitHub Video Player Implementations',
  urls: [
    'https://github.com/topics/video-player?l=javascript',
    'https://github.com/topics/react-video-player',
    'https://github.com/CookPete/react-player',
    'https://github.com/video-dev/hls.js',
    'https://github.com/sampotts/plyr'
  ],
  
  extract: {
    implementation: 'Core video player logic',
    features: 'Feature set and capabilities',
    customization: 'Customization options',
    examples: 'Code examples and demos'
  },
  
  focusAreas: [
    'Subtitle support implementation',
    'Mobile responsive design',
    'Gesture controls',
    'Quality switching',
    'Playback speed control',
    'Keyboard shortcuts'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/github-video-players.json`,
    code: `${RESEARCH_DIR}/video-player-examples/`,
    comparison: `${RESEARCH_DIR}/video-player-comparison.md`
  }
};

/**
 * Example 7: Dribbble Design Patterns
 * 
 * Use with MCP:
 * "Crawl Dribbble for modern video player designs and UI patterns"
 */
const dribbbleDesignAnalysis = {
  name: 'Dribbble Video Player Designs',
  url: 'https://dribbble.com/search/video-player-mobile',
  
  extract: {
    designs: 'Top video player design concepts',
    patterns: 'Common UI patterns',
    colors: 'Color scheme trends',
    typography: 'Typography styles',
    interactions: 'Interaction design patterns'
  },
  
  focusAreas: [
    'Mobile-first designs',
    'Control placement',
    'Subtitle styling',
    'Progress bar designs',
    'Action button layouts'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/dribbble-designs.json`,
    screenshots: `${SCREENSHOTS_DIR}/dribbble/`,
    moodboard: `${RESEARCH_DIR}/design-inspiration/`
  }
};

/**
 * Example 8: Awwwards Site of the Day
 * 
 * Use with MCP:
 * "Scrape Awwwards for best web animation and interaction patterns"
 */
const awwwardsAnalysis = {
  name: 'Awwwards Animation Patterns',
  url: 'https://www.awwwards.com/websites/animation/',
  
  extract: {
    animations: 'Scroll animations',
    transitions: 'Page transitions',
    interactions: 'Micro-interactions',
    performance: 'Performance optimization techniques'
  },
  
  focusAreas: [
    'Smooth scroll implementations',
    'Loading animations',
    'Hover effects',
    'Transition timing',
    'Performance budgets'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/awwwards-animations.json`,
    code: `${RESEARCH_DIR}/animation-examples/`,
    inspiration: `${SCREENSHOTS_DIR}/awwwards/`
  }
};

/**
 * Batch Scraping Configuration
 * 
 * Use with MCP:
 * "Run batch analysis on all language learning apps"
 */
const batchLanguageAppsAnalysis = {
  name: 'Batch Language Learning Apps Analysis',
  
  apps: [
    {
      name: 'Duolingo',
      url: 'https://www.duolingo.com',
      focus: ['gamification', 'lesson-flow', 'streak-system']
    },
    {
      name: 'Babbel',
      url: 'https://www.babbel.com',
      focus: ['conversation-practice', 'grammar-explanations', 'review-system']
    },
    {
      name: 'Busuu',
      url: 'https://www.busuu.com',
      focus: ['social-learning', 'community-features', 'progress-tracking']
    },
    {
      name: 'Memrise',
      url: 'https://www.memrise.com',
      focus: ['spaced-repetition', 'meme-learning', 'native-speaker-videos']
    },
    {
      name: 'Rosetta Stone',
      url: 'https://www.rosettastone.com',
      focus: ['immersion-method', 'speech-recognition', 'lesson-structure']
    }
  ],
  
  compareAreas: [
    'Onboarding flow',
    'Lesson structure',
    'Progress visualization',
    'Gamification elements',
    'Social features',
    'Pricing pages',
    'Mobile app screenshots'
  ],
  
  output: {
    file: `${RESEARCH_DIR}/language-apps-comparison.json`,
    screenshots: `${SCREENSHOTS_DIR}/language-apps/`,
    report: `${RESEARCH_DIR}/competitive-analysis-report.md`
  }
};

/**
 * Code Extraction Patterns
 * 
 * Use with MCP:
 * "Extract specific code patterns from competitor sites"
 */
const codeExtractionPatterns = {
  
  scrollPhysics: {
    description: 'Extract scroll physics implementations',
    targets: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
    lookFor: [
      'CSS scroll-snap properties',
      'Touch event handlers',
      'Velocity calculations',
      'Momentum scrolling',
      'Snap point logic'
    ]
  },
  
  videoLoadingStrategies: {
    description: 'Extract video loading and buffering strategies',
    targets: ['YouTube', 'Netflix', 'TikTok'],
    lookFor: [
      'Preload strategies',
      'Buffer management',
      'Quality adaptation',
      'Network detection',
      'Cache policies'
    ]
  },
  
  subtitleSynchronization: {
    description: 'Extract subtitle sync implementations',
    targets: ['YouTube', 'Netflix', 'TED'],
    lookFor: [
      'WebVTT parsing',
      'Time synchronization',
      'Subtitle positioning',
      'Multi-language support',
      'Styling options'
    ]
  },
  
  progressTracking: {
    description: 'Extract progress tracking UIs',
    targets: ['Duolingo', 'Khan Academy', 'Coursera'],
    lookFor: [
      'Progress bar designs',
      'Milestone animations',
      'Achievement systems',
      'XP calculations',
      'Streak tracking'
    ]
  }
};

/**
 * MCP Usage Examples (Natural Language)
 * 
 * Copy these prompts directly into Cursor with Firecrawl MCP enabled:
 */
const mcpPromptExamples = [
  // Competitor Analysis
  "Use Firecrawl to crawl TikTok's mobile web version and extract their video feed scroll implementation. Focus on the CSS scroll-snap, touch handlers, and video preloading strategy. Save the results with screenshots.",
  
  // Design Research
  "Crawl Dribbble and Awwwards for modern video player designs. Extract screenshots of the top 10 mobile video player UIs and create a design inspiration document.",
  
  // Code Examples
  "Use Firecrawl to find and extract React video player implementations from GitHub's trending repos. Get code examples for subtitle support, gesture controls, and quality switching.",
  
  // Batch Analysis
  "Batch crawl these language learning apps with Firecrawl: Duolingo, Babbel, Busuu, Memrise. Extract their gamification patterns, progress tracking UIs, and lesson structures. Create a comparison report with screenshots.",
  
  // Specific Feature
  "Crawl Instagram Reels and extract their double-tap to like animation. Get the CSS, JavaScript, and any related assets. Provide code examples I can adapt.",
  
  // UI Patterns
  "Use Firecrawl to analyze YouTube Shorts' comment drawer implementation. Extract the slide-up animation, lazy loading logic, and interaction patterns.",
  
  // Performance
  "Crawl Netflix and extract their video player optimization techniques. Focus on adaptive streaming, buffering strategies, and performance metrics.",
  
  // Documentation
  "Scrape React documentation for best practices on video player implementation, focusing on refs, performance optimization, and mobile considerations."
];

/**
 * Integration with Playwright MCP
 * 
 * Combine Firecrawl with Playwright for complete analysis:
 */
const combinedMCPWorkflow = {
  name: 'Complete Competitor Analysis Workflow',
  
  steps: [
    {
      tool: 'Firecrawl',
      action: 'Crawl competitor site structure and extract code',
      command: 'Use Firecrawl to extract TikTok feed implementation'
    },
    {
      tool: 'Playwright',
      action: 'Capture interactive screenshots and test behavior',
      command: 'Use Playwright to screenshot TikTok feed interactions'
    },
    {
      tool: 'Firecrawl',
      action: 'Extract specific components and assets',
      command: 'Use Firecrawl to download icon assets and CSS'
    },
    {
      tool: 'Playwright',
      action: 'Test implementation in our app',
      command: 'Test our feed implementation with Playwright'
    },
    {
      tool: 'Both',
      action: 'Generate comparison report',
      command: 'Create side-by-side comparison with screenshots'
    }
  ],
  
  prompt: "Complete workflow: Use Firecrawl to analyze TikTok's feed, extract their code and assets, then use Playwright to capture screenshots of their UX. Implement similar features in our app, test with Playwright, and create a before/after comparison report."
};

/**
 * Output Templates
 */
const outputTemplates = {
  
  competitorAnalysis: {
    filename: 'competitor-analysis-[NAME]-[DATE].json',
    structure: {
      site: 'Competitor name',
      url: 'URL analyzed',
      timestamp: 'Analysis timestamp',
      focusAreas: ['List of analyzed areas'],
      findings: {
        structure: 'DOM structure notes',
        styles: 'CSS patterns',
        scripts: 'JavaScript patterns',
        assets: 'Assets catalog'
      },
      screenshots: ['Screenshot paths'],
      code: ['Extracted code snippets'],
      recommendations: ['Implementation suggestions']
    }
  },
  
  designInspiration: {
    filename: 'design-inspiration-[TOPIC]-[DATE].md',
    structure: `
# Design Inspiration: [TOPIC]

## Source
- **Site**: [Name]
- **URL**: [URL]
- **Date**: [Date]

## Key Patterns
1. Pattern 1
2. Pattern 2

## Screenshots
![Screenshot 1](path/to/screenshot1.png)
![Screenshot 2](path/to/screenshot2.png)

## Implementation Ideas
- Idea 1
- Idea 2

## Code Examples
\`\`\`javascript
// Example code
\`\`\`
    `
  }
};

// Export for use with MCP
module.exports = {
  RESEARCH_DIR,
  SCREENSHOTS_DIR,
  FIRECRAWL_API_KEY,
  
  analyses: {
    tiktokFeedAnalysis,
    duolingoGamificationAnalysis,
    instagramReelsAnalysis,
    youtubeShortsAnalysis,
    babbelLearningAnalysis,
    githubVideoPlayersSearch,
    dribbbleDesignAnalysis,
    awwwardsAnalysis,
    batchLanguageAppsAnalysis
  },
  
  codeExtractionPatterns,
  mcpPromptExamples,
  combinedMCPWorkflow,
  outputTemplates
};

console.log('🔥 Firecrawl MCP Examples loaded');
console.log('📚 Use the mcpPromptExamples for ready-to-use prompts');
console.log('🎯 Copy any prompt directly into Cursor with Firecrawl MCP enabled');

