"""
Smart Content Recommendation Engine
Multi-factor ranking system for personalized feed generation
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np

app = FastAPI(title="Recommender Service")


class UserProfile(BaseModel):
    userId: str
    targetLanguage: str
    currentLevel: str  # A1, A2, B1, etc.
    comprehensionScore: float  # 0-1
    engagementScore: float  # 0-1
    preferredDifficulty: float = 0.96  # Target % known words
    knownWords: List[str]
    dueForReview: List[str]


class ContentItem(BaseModel):
    contentId: str
    type: str
    cefrLevel: str
    difficultyScore: float
    dopamineScore: float
    words: List[str]
    topics: List[str]
    viewCount: int
    likeCount: int
    averageTimeSpent: float


class RecommendationRequest(BaseModel):
    user: UserProfile
    candidates: List[ContentItem]
    limit: int = 10


class ScoredContent(BaseModel):
    contentId: str
    score: float
    reasons: List[str]
    knownPercentage: float
    difficulty: str


class RecommendationResponse(BaseModel):
    recommendations: List[ScoredContent]


# CEFR level adjacency
CEFR_LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']


def calculate_difficulty_match_score(
    content: ContentItem,
    user: UserProfile
) -> tuple[float, float, str]:
    """
    Calculate how well content difficulty matches user level
    Returns: (score, known_percentage, difficulty_label)
    """
    # Calculate % of known words
    content_words = set(content.words)
    known_words = set(user.knownWords)
    
    if not content_words:
        return 0.0, 0.0, 'unknown'
    
    known_count = len(content_words & known_words)
    known_percentage = known_count / len(content_words)
    
    # Check against preferred difficulty (i+1 principle)
    target = user.preferredDifficulty
    tolerance = 0.05
    
    if known_percentage >= target + tolerance:
        difficulty = 'too_easy'
        # Still valuable, but lower score
        score = 0.6
    elif known_percentage < target - tolerance * 2:
        difficulty = 'too_hard'
        # Save for later
        score = 0.3
    else:
        difficulty = 'perfect'
        # Ideal zone (96% known, 4% new)
        score = 1.0
    
    # Bonus for being in flow state
    if 0.92 <= known_percentage <= 0.98:
        score = min(1.0, score + 0.2)
    
    return score, known_percentage, difficulty


def calculate_interest_alignment_score(
    content: ContentItem,
    user: UserProfile,
    recent_interactions: Optional[List[Dict]] = None
) -> float:
    """
    Calculate how well content aligns with user interests
    Based on engagement history and content metadata
    """
    # Base score from content's global engagement
    engagement_score = min(1.0, (content.likeCount / max(content.viewCount, 1)) * 2)
    
    # Adjust by content's dopamine score
    dopamine_factor = content.dopamineScore
    
    # Factor in user's engagement tendency
    user_engagement_factor = user.engagementScore
    
    # Combined interest score
    score = (engagement_score * 0.4 + dopamine_factor * 0.4 + user_engagement_factor * 0.2)
    
    # Would incorporate topic matching with user's historical preferences
    # For now, simplified
    
    return score


def calculate_variety_score(
    content: ContentItem,
    recent_types: List[str],
    recent_topics: List[str]
) -> float:
    """
    Ensure variety in content types and topics
    Prevents user from getting same type repeatedly
    """
    # Check type diversity
    type_count = recent_types.count(content.type) if recent_types else 0
    type_penalty = min(0.5, type_count * 0.1)
    
    # Check topic diversity
    topic_overlap = len(set(content.topics) & set(recent_topics))
    topic_penalty = min(0.3, topic_overlap * 0.1)
    
    variety_score = 1.0 - type_penalty - topic_penalty
    return max(0.1, variety_score)


def calculate_srs_reinforcement_score(
    content: ContentItem,
    user: UserProfile
) -> float:
    """
    Boost content that contains words due for SRS review
    Integrates spaced repetition naturally into feed
    """
    if not user.dueForReview:
        return 0.0
    
    due_words = set(user.dueForReview)
    content_words = set(content.words)
    
    # Count how many review words are in content
    review_words = due_words & content_words
    
    if not review_words:
        return 0.0
    
    # Score based on number of review words
    # More review words = higher score (but cap to avoid overwhelming)
    score = min(1.0, len(review_words) / 5)
    
    return score


def calculate_adaptive_difficulty_adjustment(
    user: UserProfile,
    content: ContentItem
) -> float:
    """
    Adaptively adjust difficulty based on user's comprehension trends
    Secretly pushes users to higher difficulty when they're ready
    """
    # If user consistently shows high comprehension, nudge difficulty up
    if user.comprehensionScore > 0.8:
        # Bonus for content slightly above their level
        user_level_idx = CEFR_LEVELS.index(user.currentLevel) if user.currentLevel in CEFR_LEVELS else 2
        content_level_idx = CEFR_LEVELS.index(content.cefrLevel) if content.cefrLevel in CEFR_LEVELS else 2
        
        if content_level_idx == user_level_idx + 1:
            return 0.2  # Bonus for next level up
        elif content_level_idx == user_level_idx + 2:
            return 0.1  # Small bonus for two levels up
    
    # If user is struggling, prefer easier content
    elif user.comprehensionScore < 0.5:
        user_level_idx = CEFR_LEVELS.index(user.currentLevel) if user.currentLevel in CEFR_LEVELS else 2
        content_level_idx = CEFR_LEVELS.index(content.cefrLevel) if content.cefrLevel in CEFR_LEVELS else 2
        
        if content_level_idx == user_level_idx - 1:
            return 0.2  # Bonus for easier content
    
    return 0.0


@app.post("/recommend", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    """
    Generate personalized content recommendations
    
    Scoring weights:
    - Difficulty matching: 40%
    - Interest alignment: 30%
    - Variety: 15%
    - SRS reinforcement: 15%
    """
    user = request.user
    candidates = request.candidates
    limit = request.limit
    
    if not candidates:
        return RecommendationResponse(recommendations=[])
    
    # For variety calculation (would come from recent history in production)
    recent_types = []
    recent_topics = []
    
    scored_content = []
    
    for content in candidates:
        # Calculate individual scores
        difficulty_score, known_pct, difficulty_label = calculate_difficulty_match_score(content, user)
        interest_score = calculate_interest_alignment_score(content, user)
        variety_score = calculate_variety_score(content, recent_types, recent_topics)
        srs_score = calculate_srs_reinforcement_score(content, user)
        adaptive_bonus = calculate_adaptive_difficulty_adjustment(user, content)
        
        # Weighted combination
        total_score = (
            difficulty_score * 0.40 +
            interest_score * 0.30 +
            variety_score * 0.15 +
            srs_score * 0.15 +
            adaptive_bonus
        )
        
        # Build reasoning
        reasons = []
        if difficulty_label == 'perfect':
            reasons.append('Perfect difficulty for you')
        if srs_score > 0.3:
            reasons.append('Contains words you\'re learning')
        if interest_score > 0.7:
            reasons.append('Highly engaging content')
        if adaptive_bonus > 0:
            reasons.append('Ready for this challenge')
        
        scored_content.append(ScoredContent(
            contentId=content.contentId,
            score=round(total_score, 3),
            reasons=reasons,
            knownPercentage=round(known_pct, 3),
            difficulty=difficulty_label
        ))
    
    # Sort by score and return top N
    scored_content.sort(key=lambda x: x.score, reverse=True)
    
    return RecommendationResponse(
        recommendations=scored_content[:limit]
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)


