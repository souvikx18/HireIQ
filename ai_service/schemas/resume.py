from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SkillGapItem(BaseModel):
    skill: str
    category: str = "General"
    status: str = "missing"  # "matched" | "partial" | "missing"
    importance: str = "medium"  # "critical" | "high" | "medium" | "low"


class ATSScoreBreakdown(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    skills_match: int = Field(..., ge=0, le=100)
    experience_relevance: int = Field(..., ge=0, le=100)
    structure_and_formatting: int = Field(..., ge=0, le=100)
    ats_readability: int = Field(..., ge=0, le=100)


class ResumeAnalyzeRequest(BaseModel):
    raw_text: Optional[str] = Field(None, description="Optional pre-extracted text if not uploading binary")
    candidate_name: Optional[str] = None
    target_role: Optional[str] = None
    required_skills: Optional[List[str]] = Field(default_factory=list)


class ResumeAnalyzeResponse(BaseModel):
    candidate_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    experience_years: str = "0+"
    education: Optional[str] = None
    detected_skills: List[str] = Field(default_factory=list)
    ats_score: int = Field(..., ge=0, le=100)
    score_breakdown: ATSScoreBreakdown
    skill_gaps: List[SkillGapItem] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    full_text_excerpt: Optional[str] = None


class JobMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=10)
    job_description: str = Field(..., min_length=10)
    job_title: Optional[str] = "Target Role"
    required_skills: Optional[List[str]] = Field(default_factory=list)


class JobMatchResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100)
    ats_score: int = Field(..., ge=0, le=100)
    skill_coverage: float = Field(..., ge=0.0, le=100.0)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    verdict: str  # "Strong Fit", "Potential Fit", "Not a Fit"
    explanation: str
