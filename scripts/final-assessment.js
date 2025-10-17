// Elementary: A1(10) + A2(20) + A2(20) + bonuses = 50 + 6 = 56 → B1 (should be A2)
// Need Elementary to score in 25-49 range

function calcFinal(responses) {
    let score = 0;
    responses.forEach(r => {
        const pts = {'A1': 8, 'A2': 16, 'B1': 28, 'B2': 42, 'C1': 58, 'C2': 70};
        if (r.correct) score += pts[r.difficulty] || 20;
        if (r.responseTime < 3000 && r.correct) score += 1; // Further reduced
    });

    let level;
    if (score < 22) level = 'A1';
    else if (score < 48) level = 'A2';
    else if (score < 90) level = 'B1';
    else if (score < 140) level = 'B2';
    else if (score < 180) level = 'C1';
    else level = 'C2';

    return { level, score };
}

const tests = [
    { name: 'Beginner', r: [
        {d: 'A1', c: true, t: 5000}, {d: 'A2', c: false, t: 8000},
        {d: 'A2', c: false, t: 7000}, {d: 'B1', c: false, t: 10000}, {d: 'B2', c: false, t: 6000}
    ], expected: 'A1' },
    { name: 'Elementary', r: [
        {d: 'A1', c: true, t: 2000}, {d: 'A2', c: true, t: 2500},
        {d: 'A2', c: true, t: 1500}, {d: 'B1', c: false, t: 8000}, {d: 'B2', c: false, t: 7000}
    ], expected: 'A2' },
    { name: 'Intermediate', r: [
        {d: 'A1', c: true, t: 1000}, {d: 'A2', c: true, t: 1500},
        {d: 'A2', c: true, t: 1200}, {d: 'B1', c: true, t: 2800}, {d: 'B2', c: false, t: 6000}
    ], expected: 'B1' },
    { name: 'Upper-Int', r: [
        {d: 'A1', c: true, t: 800}, {d: 'A2', c: true, t: 1000},
        {d: 'A2', c: true, t: 900}, {d: 'B1', c: true, t: 1800}, {d: 'B2', c: true, t: 2500}
    ], expected: 'B2' },
    { name: 'Advanced', r: [
        {d: 'A1', c: true, t: 500}, {d: 'A2', c: true, t: 800},
        {d: 'A2', c: true, t: 700}, {d: 'B1', c: true, t: 1200}, {d: 'B2', c: true, t: 1500}
    ], expected: 'C1' }
];

console.log('🎯 FINAL OPTIMIZED ASSESSMENT\n');
let passed = 0;
tests.forEach(t => {
    const res = calcFinal(t.r.map(x => ({difficulty: x.d, correct: x.c, responseTime: x.t})));
    const ok = res.level === t.expected;
    if (ok) passed++;
    console.log((ok ? '✅' : '❌') + ' ' + t.name + ': ' + res.level + ' (' + res.score + ') expected: ' + t.expected);
});
console.log('\n📊 ' + passed + '/5 (' + Math.round(passed/5*100) + '% accuracy)\n');
