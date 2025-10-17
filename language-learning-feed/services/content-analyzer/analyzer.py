"""
Content Difficulty Analyzer Microservice
Uses spaCy + CEFR word frequency lists to analyze content difficulty
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import spacy
from collections import Counter
import json

app = FastAPI(title="Content Analyzer")

# Load spaCy models (install with: python -m spacy download en_core_web_sm es_core_news_sm)
# In production, load models for all supported languages
nlp_models = {}

try:
    nlp_models['en'] = spacy.load('en_core_web_sm')
    nlp_models['es'] = spacy.load('es_core_news_sm')
except:
    print("Warning: spaCy models not installed. Install with: python -m spacy download [model]")

# CEFR word frequency data (simplified - would load from comprehensive database)
# Format: {word: CEFR_level}
CEFR_WORD_LISTS = {
    'es': {
        'el': 'A1', 'la': 'A1', 'de': 'A1', 'que': 'A1', 'y': 'A1',
        'a': 'A1', 'en': 'A1', 'un': 'A1', 'ser': 'A1', 'se': 'A1',
        'no': 'A1', 'haber': 'A1', 'por': 'A1', 'con': 'A1', 'su': 'A1',
        # ... would include thousands of words per level
    },
    'en': {
        'the': 'A1', 'be': 'A1', 'to': 'A1', 'of': 'A1', 'and': 'A1',
        'a': 'A1', 'in': 'A1', 'that': 'A1', 'have': 'A1', 'i': 'A1',
        # ... would include thousands of words per level
    }
}

# CEFR level rankings
CEFR_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']


class AnalyzeRequest(BaseModel):
    text: str
    language: str
    content_type: str = "article"


class WordInfo(BaseModel):
    word: str
    lemma: str
    frequency: int
    cefrLevel: str
    position: int
    context: Optional[str] = None


class AnalysisResult(BaseModel):
    difficulty_score: float
    cefr_level: str
    unique_word_count: int
    total_word_count: int
    comprehensibility_score: float
    words: List[WordInfo]
    topics: List[str]


def get_cefr_level(word: str, language: str) -> str:
    """Get CEFR level for a word"""
    word_lower = word.lower()
    word_lists = CEFR_WORD_LISTS.get(language, {})
    
    # Check if word is in known lists
    if word_lower in word_lists:
        return word_lists[word_lower]
    
    # Estimate based on word length and frequency (very simplified)
    # In production, use comprehensive frequency dictionaries
    if len(word) <= 3:
        return 'A1'
    elif len(word) <= 5:
        return 'A2'
    elif len(word) <= 7:
        return 'B1'
    elif len(word) <= 9:
        return 'B2'
    else:
        return 'C1'


def calculate_difficulty_score(words: List[Dict], language: str) -> tuple[float, str]:
    """
    Calculate overall difficulty score and CEFR level
    Returns: (score 0-1, CEFR level)
    """
    if not words:
        return 0.5, 'A2'
    
    # Count words by CEFR level
    level_counts = Counter(word['cefrLevel'] for word in words)
    total_words = sum(level_counts.values())
    
    # Calculate weighted average
    level_weights = {'A0': 0, 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
    weighted_sum = sum(level_counts[level] * level_weights.get(level, 3) for level in level_counts)
    avg_weight = weighted_sum / total_words if total_words > 0 else 3
    
    # Normalize to 0-1 scale
    difficulty_score = avg_weight / 6
    
    # Determine primary CEFR level
    if difficulty_score < 0.16:
        cefr_level = 'A1'
    elif difficulty_score < 0.33:
        cefr_level = 'A2'
    elif difficulty_score < 0.5:
        cefr_level = 'B1'
    elif difficulty_score < 0.66:
        cefr_level = 'B2'
    elif difficulty_score < 0.83:
        cefr_level = 'C1'
    else:
        cefr_level = 'C2'
    
    return difficulty_score, cefr_level


def extract_topics(doc, language: str) -> List[str]:
    """Extract main topics from text using NER and noun chunks"""
    topics = set()
    
    # Named entities
    for ent in doc.ents:
        if ent.label_ in ['PERSON', 'ORG', 'GPE', 'EVENT', 'PRODUCT']:
            topics.add(ent.text.lower())
    
    # Most common nouns
    nouns = [token.lemma_.lower() for token in doc if token.pos_ == 'NOUN' and len(token.text) > 3]
    noun_freq = Counter(nouns)
    for noun, count in noun_freq.most_common(5):
        topics.add(noun)
    
    return list(topics)[:10]  # Max 10 topics


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_content(request: AnalyzeRequest):
    """
    Analyze content difficulty and extract linguistic features
    """
    language = request.language
    text = request.text
    
    if language not in nlp_models:
        raise HTTPException(status_code=400, detail=f"Language {language} not supported")
    
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Process text with spaCy
    nlp = nlp_models[language]
    doc = nlp(text)
    
    # Extract words with metadata
    words = []
    word_positions = {}
    
    for i, token in enumerate(doc):
        # Skip punctuation and spaces
        if token.is_punct or token.is_space:
            continue
        
        word = token.text
        lemma = token.lemma_
        
        # Track frequency and position
        if lemma not in word_positions:
            word_positions[lemma] = {
                'word': word,
                'lemma': lemma,
                'frequency': 1,
                'position': i,
                'cefrLevel': get_cefr_level(lemma, language),
                'context': token.sent.text if token.sent else None
            }
        else:
            word_positions[lemma]['frequency'] += 1
    
    # Convert to list
    words = list(word_positions.values())
    
    # Calculate difficulty
    difficulty_score, cefr_level = calculate_difficulty_score(words, language)
    
    # Extract topics
    topics = extract_topics(doc, language)
    
    # Calculate comprehensibility (what % of words are A1-B1)
    easy_words = sum(1 for w in words if w['cefrLevel'] in ['A1', 'A2', 'B1'])
    comprehensibility = easy_words / len(words) if words else 0
    
    return AnalysisResult(
        difficulty_score=round(difficulty_score, 3),
        cefr_level=cefr_level,
        unique_word_count=len(words),
        total_word_count=len([t for t in doc if not t.is_punct and not t.is_space]),
        comprehensibility_score=round(comprehensibility, 3),
        words=[WordInfo(**w) for w in words[:100]],  # Return top 100 for performance
        topics=topics
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": list(nlp_models.keys())
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


