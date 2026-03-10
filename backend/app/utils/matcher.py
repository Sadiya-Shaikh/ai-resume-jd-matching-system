"""
Core Matching Algorithm - Resume to JD matching using AI
"""
from app.utils.tfidf_vectorizer import calculate_cosine_similarity, calculate_keyword_density
from app.utils.skill_extractor import compare_skills


def generate_verdict(score: float) -> str:
    """Generate hiring verdict based on match score"""
    if score >= 75:
        return "Highly Recommended"
    elif score >= 60:
        return "Recommended"
    elif score >= 50:
        return "Consider"
    else:
        return "Not Recommended"


def generate_recommendations(missing_skills: list, score: float) -> str:
    """Generate improvement recommendations"""
    if not missing_skills:
        return "Excellent match! Candidate meets all requirements."

    top_missing = missing_skills[:5]  # top 5 missing skills

    if score >= 75:
        return f"Strong candidate. Consider upskilling in: {', '.join(top_missing)}"
    elif score >= 60:
        return f"Good candidate. Should develop skills in: {', '.join(top_missing)}"
    elif score >= 50:
        return f"Moderate match. Significant gaps in: {', '.join(top_missing)}. Training required."
    else:
        return f"Poor match. Major skill gaps: {', '.join(top_missing)}. Not suitable for this role."


def match_resume_to_jd(resume_text: str, jd_text: str) -> dict:
    """
    Main matching function - compares resume against job description
    
    Args:
        resume_text: Extracted text from resume
        jd_text: Job description text
        
    Returns:
        Complete matching result with score, verdict and recommendations
    """
    if not resume_text or not jd_text:
        return {
            "match_score": 0.0,
            "cosine_similarity": 0.0,
            "skill_match_percentage": 0.0,
            "keyword_density": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "verdict": "Not Recommended",
            "recommendations": "Insufficient data to evaluate."
        }

    # --- Step 1: Calculate text similarity (60% weight) ---
    cosine_sim = calculate_cosine_similarity(resume_text, jd_text)

    # --- Step 2: Calculate skill match (30% weight) ---
    skill_comparison = compare_skills(resume_text, jd_text)
    skill_match_pct = skill_comparison["skill_match_percentage"] / 100  # normalize to 0-1

    # --- Step 3: Calculate keyword density (10% weight) ---
    keyword_density = calculate_keyword_density(resume_text, jd_text)

    # --- Step 4: Weighted final score ---
    final_score = (
        (cosine_sim * 0.60) +
        (skill_match_pct * 0.30) +
        (keyword_density * 0.10)
    ) * 100  # convert to percentage

    final_score = round(min(final_score, 100.0), 2)

    # --- Step 5: Generate verdict and recommendations ---
    verdict = generate_verdict(final_score)
    recommendations = generate_recommendations(
        skill_comparison["missing_skills"],
        final_score
    )

    return {
        "match_score": final_score,
        "cosine_similarity": round(cosine_sim * 100, 2),
        "skill_match_percentage": skill_comparison["skill_match_percentage"],
        "keyword_density": round(keyword_density * 100, 2),
        "matched_skills": skill_comparison["matched_skills"],
        "missing_skills": skill_comparison["missing_skills"],
        "verdict": verdict,
        "recommendations": recommendations
    }
