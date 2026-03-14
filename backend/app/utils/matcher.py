"""
matcher.py  — UPGRADED VERSION with BERT hybrid scoring
────────────────────────────────────────────────────────────────
Replace your existing app/utils/matcher.py with this file.
No other files need to change — the API response gains 3 new fields:
  • bert_score
  • tfidf_score  
  • scoring_method

These appear in your Matching page automatically.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.semantic_matcher import compute_hybrid_score   # ← NEW import


def get_verdict(score: float) -> str:
    if score >= 75:
        return "Highly Recommended"
    elif score >= 60:
        return "Recommended"
    elif score >= 50:
        return "Consider"
    else:
        return "Not Recommended"


def calculate_keyword_density(resume_text: str, jd_text: str) -> float:
    """How frequently do JD keywords appear in the resume."""
    jd_words = set(jd_text.lower().split())
    resume_words = resume_text.lower().split()
    if not resume_words:
        return 0.0
    matches = sum(1 for w in resume_words if w in jd_words)
    return min(matches / len(resume_words) * 10, 1.0)  # normalise to 0–1


def match_resume_to_jd(
    resume_text: str,
    jd_text: str,
    resume_skills: list,
    jd_required_skills: list,
) -> dict:
    """
    Master matching function.
    Returns full score breakdown including BERT semantic score.
    """
    # ── 1. TF-IDF Cosine Similarity ──────────────────────────────────────────
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    try:
        tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
        tfidf_cosine = float(cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0])
    except Exception:
        tfidf_cosine = 0.0

    # ── 2. Skill Matching ─────────────────────────────────────────────────────
    resume_skills_lower = {s.lower() for s in resume_skills}
    jd_skills_lower     = {s.lower() for s in jd_required_skills}

    matched_skills  = list(resume_skills_lower & jd_skills_lower)
    missing_skills  = list(jd_skills_lower - resume_skills_lower)
    skill_match_pct = len(matched_skills) / len(jd_skills_lower) if jd_skills_lower else 0.0

    # ── 3. Keyword Density ────────────────────────────────────────────────────
    keyword_density = calculate_keyword_density(resume_text, jd_text)

    # ── 4. Hybrid Score (TF-IDF + BERT) ──────────────────────────────────────
    scores = compute_hybrid_score(
        tfidf_cosine=tfidf_cosine,
        skill_match_pct=skill_match_pct,
        keyword_density=keyword_density,
        resume_text=resume_text,
        jd_text=jd_text,
    )

    # ── 5. Verdict & Recommendations ─────────────────────────────────────────
    verdict = get_verdict(scores["final_score"])

    recommendations = []
    if missing_skills:
        recommendations.append(
            f"Consider adding these skills to strengthen your profile: {', '.join(missing_skills[:5])}"
        )
    if scores["skill_match_pct"] < 0.5:
        recommendations.append(
            "Resume covers less than 50% of required skills. Significant skill gaps exist."
        )
    if scores["bert_score"] < 0.4:
        recommendations.append(
            "Resume content is not semantically aligned with the job description. "
            "Consider rewriting the summary/objective section to mirror JD language."
        )

    return {
        # ── Core result ───────────────────────────────────────────────────────
        "match_score":          scores["final_score"],
        "verdict":              verdict,
        "recommendations":      " | ".join(recommendations),

        # ── Score breakdown (shown in Matching page) ──────────────────────────
        "cosine_similarity":    scores["tfidf_score"],
        "bert_score":           scores["bert_score"],       # ← NEW
        "scoring_method":       scores["scoring_method"],   # ← NEW
        "skill_match_percentage": scores["skill_match_pct"] * 100,
        "keyword_density_score":  scores["keyword_density"],

        # ── Skill detail ──────────────────────────────────────────────────────
        "matched_skills":       matched_skills,
        "missing_skills":       missing_skills,
    }
