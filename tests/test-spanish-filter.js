// Test Spanish filter with actual API data

const testTexts = [
    "Kvarner is a European Region of Gastronomy for 2026, and the laid-back islands of Lošinj and Cres are great places to explore its cuisine",
    "El español es una lengua romance que evolucionó del latín vulgar en la península ibérica",
    "España es un país fascinante con una rica historia y cultura vibrante",
    "The weather is nice today",
    "Hello world"
];

function isSpanish(text) {
    // Count English vs Spanish indicators
    const englishWords = text.match(/\b(the|is|are|was|were|have|has|and|or|but|of|in|to|for|on|at|with|from|by|as|this|that|it|be|not|will|can|would|could|should|may|might|must|an|a)\b/gi) || [];
    const spanishWords = text.match(/\b(el|la|los|las|una|de|del|al|que|para|con|por|este|esta|como|más|año|está|son|ser|en|y|o|pero|si|no|muy|bien|mal|todo|todos|cómo|qué|cuál|dónde|cuándo|quién|español|española|españoles|país|países|ciudad|ciudades|vida|personas|tiempo|mundo|día|días|años|cosas|forma|parte|lugar|momento)\b/gi) || [];

    console.log(`  English words: ${englishWords.length}, Spanish words: ${spanishWords.length}`);

    // REJECT if more than 5 English words detected
    if (englishWords.length > 5) {
        console.log(`❌ REJECTED: Too many English words (${englishWords.length} > 5)`);
        return false;
    }

    // REJECT if English words > Spanish words (shows it's primarily English)
    if (englishWords.length > spanishWords.length && spanishWords.length < 3) {
        console.log(`❌ REJECTED: More English than Spanish`);
        return false;
    }

    // ACCEPT only if Spanish characteristics present
    const hasSpanishChars = /[¿¡ñáéíóúüÑÁÉÍÓÚÜ]/.test(text);
    const hasSpanishWords = spanishWords.length >= 5; // At least 5 Spanish words

    if (!hasSpanishChars && !hasSpanishWords) {
        console.log(`❌ REJECTED: No Spanish characteristics`);
        return false;
    }

    console.log(`✅ ACCEPTED: Spanish detected`);
    return true;
}

console.log('🧪 Testing Spanish Filter\n');

testTexts.forEach((text, i) => {
    console.log(`\nTest ${i + 1}: "${text.substring(0, 60)}..."`);
    isSpanish(text);
});
