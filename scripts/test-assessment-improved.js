// IMPROVED Assessment scoring (after calibration)
function calculateUserLevel(responses) {
    let score = 0;
    
    responses.forEach(r => {
        const difficultyPoints = {
            'A1': 10, 'A2': 20, 'B1': 30,
            'B2': 40, 'C1': 50, 'C2': 60
        };
        
        if (r.correct) {
            score += difficultyPoints[r.difficulty] || 20;
        }
        
        // REDUCED bonus from +5 to +2
        if (r.responseTime < 3000 && r.correct) {
            score += 2;
        }
    });
    
    // ADJUSTED THRESHOLDS
    let level, frequencyPosition;
    
    if (score < 25) {
        level = 'A1';
        frequencyPosition = 'Words 1-500';
    } else if (score < 50) {
        level = 'A2';
        frequencyPosition = 'Words 500-1000';
    } else if (score < 85) {
        level = 'B1';
        frequencyPosition = 'Words 1000-2000';
    } else if (score < 125) {
        level = 'B2';
        frequencyPosition = 'Words 2000-3500';
    } else if (score < 160) {
        level = 'C1';
        frequencyPosition = 'Words 3500-5000';
    } else {
        level = 'C2';
        frequencyPosition = 'Words 5000-10000';
    }
    
    return { level, score, frequencyPosition };
}

const tests = [
    {
        name: 'Complete Beginner',
        responses: [
            { difficulty: 'A1', correct: true, responseTime: 5000 },
            { difficulty: 'A2', correct: false, responseTime: 8000 },
            { difficulty: 'A2', correct: false, responseTime: 7000 },
            { difficulty: 'B1', correct: false, responseTime: 10000 },
            { difficulty: 'B2', correct: false, responseTime: 6000 }
        ],
        expected: 'A1'
    },
    {
        name: 'Elementary (3 months)',
        responses: [
            { difficulty: 'A1', correct: true, responseTime: 2000 },
            { difficulty: 'A2', correct: true, responseTime: 2500 },
            { difficulty: 'A2', correct: true, responseTime: 1500 },
            { difficulty: 'B1', correct: false, responseTime: 8000 },
            { difficulty: 'B2', correct: false, responseTime: 7000 }
        ],
        expected: 'A2'
    },
    {
        name: 'Intermediate (1 year)',
        responses: [
            { difficulty: 'A1', correct: true, responseTime: 1000 },
            { difficulty: 'A2', correct: true, responseTime: 1500 },
            { difficulty: 'A2', correct: true, responseTime: 1200 },
            { difficulty: 'B1', correct: true, responseTime: 2800 },
            { difficulty: 'B2', correct: false, responseTime: 6000 }
        ],
        expected: 'B1'
    },
    {
        name: 'Upper-Intermediate (2 years)',
        responses: [
            { difficulty: 'A1', correct: true, responseTime: 800 },
            { difficulty: 'A2', correct: true, responseTime: 1000 },
            { difficulty: 'A2', correct: true, responseTime: 900 },
            { difficulty: 'B1', correct: true, responseTime: 1800 },
            { difficulty: 'B2', correct: true, responseTime: 2500 }
        ],
        expected: 'B2'
    },
    {
        name: 'Advanced (5+ years)',
        responses: [
            { difficulty: 'A1', correct: true, responseTime: 500 },
            { difficulty: 'A2', correct: true, responseTime: 800 },
            { difficulty: 'A2', correct: true, responseTime: 700 },
            { difficulty: 'B1', correct: true, responseTime: 1200 },
            { difficulty: 'B2', correct: true, responseTime: 1500 }
        ],
        expected: 'C1'
    }
];

console.log('\n🧪 IMPROVED ASSESSMENT TEST\n');
let passed = 0;

tests.forEach(test => {
    const result = calculateUserLevel(test.responses);
    const match = result.level === test.expected;
    if (match) passed++;
    
    console.log(`${match ? '✅' : '❌'} ${test.name}`);
    console.log(`   Got: ${result.level} (Score: ${result.score})`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Frequency: ${result.frequencyPosition}\n`);
});

console.log(`\n📊 Results: ${passed}/5 (${Math.round(passed/5*100)}% accuracy)\n`);
