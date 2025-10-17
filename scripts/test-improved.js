// IMPROVED Assessment scoring test
function calc(responses) {
    let score = 0;
    responses.forEach(r => {
        const pts = {'A1': 10, 'A2': 20, 'B1': 30, 'B2': 40, 'C1': 50, 'C2': 60};
        if (r.correct) score += pts[r.difficulty] || 20;
        if (r.responseTime < 3000 && r.correct) score += 2; // Reduced from +5
    });

    let level;
    if (score < 25) level = 'A1';
    else if (score < 50) level = 'A2';
    else if (score < 85) level = 'B1';
    else if (score < 125) level = 'B2';
    else if (score < 160) level = 'C1';
    else level = 'C2';

    return { level, score };
}

const tests = [
    { name: 'Beginner', responses: [
        {difficulty: 'A1', correct: true, responseTime: 5000},
        {difficulty: 'A2', correct: false, responseTime: 8000},
        {difficulty: 'A2', correct: false, responseTime: 7000},
        {difficulty: 'B1', correct: false, responseTime: 10000},
        {difficulty: 'B2', correct: false, responseTime: 6000}
    ], expected: 'A1' },
    { name: 'Elementary', responses: [
        {difficulty: 'A1', correct: true, responseTime: 2000},
        {difficulty: 'A2', correct: true, responseTime: 2500},
        {difficulty: 'A2', correct: true, responseTime: 1500},
        {difficulty: 'B1', correct: false, responseTime: 8000},
        {difficulty: 'B2', correct: false, responseTime: 7000}
    ], expected: 'A2' },
    { name: 'Intermediate', responses: [
        {difficulty: 'A1', correct: true, responseTime: 1000},
        {difficulty: 'A2', correct: true, responseTime: 1500},
        {difficulty: 'A2', correct: true, responseTime: 1200},
        {difficulty: 'B1', correct: true, responseTime: 2800},
        {difficulty: 'B2', correct: false, responseTime: 6000}
        ], expected: 'B1' },
    { name: 'Upper-Int', responses: [
        {difficulty: 'A1', correct: true, responseTime: 800},
        {difficulty: 'A2', correct: true, responseTime: 1000},
        {difficulty: 'A2', correct: true, responseTime: 900},
        {difficulty: 'B1', correct: true, responseTime: 1800},
        {difficulty: 'B2', correct: true, responseTime: 2500}
    ], expected: 'B2' },
    { name: 'Advanced', responses: [
        {difficulty: 'A1', correct: true, responseTime: 500},
        {difficulty: 'A2', correct: true, responseTime: 800},
        {difficulty: 'A2', correct: true, responseTime: 700},
        {difficulty: 'B1', correct: true, responseTime: 1200},
        {difficulty: 'B2', correct: true, responseTime: 1500}
    ], expected: 'C1' }
];

console.log('🧪 IMPROVED ASSESSMENT TEST\n');
let passed = 0;
tests.forEach(t => {
    const r = calc(t.responses);
    const ok = r.level === t.expected;
    if (ok) passed++;
    console.log((ok ? '✅' : '❌') + ' ' + t.name + ': ' + r.level + ' (score: ' + r.score + ') expected: ' + t.expected);
});
console.log('\n📊 Results: ' + passed + '/5 (' + Math.round(passed/5*100) + '% accuracy)\n');
