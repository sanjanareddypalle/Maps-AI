from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class FeedbackCreateRequest(BaseModel):
    trip_id: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    written_feedback: Optional[str] = ""
    quick_tags: List[str] = Field(default_factory=list)  # e.g., ["Helpful", "Accurate", "Overpriced", "Incorrect Route"]
    issues: List[str] = Field(default_factory=list)  # e.g., ["incorrect_route", "unavailable_transport", "unrealistic_budget", "irrelevant_destinations", "missing_info"]
    category_ratings: Dict[str, int] = Field(default_factory=dict)  # {"route_quality": 4, "transport": 3, "cost_accuracy": 5, "recommendations": 4}
    origin: Optional[str] = None
    destination: Optional[str] = None

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    trip_id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = "Traveler"
    rating: int
    written_feedback: Optional[str] = ""
    quick_tags: List[str] = Field(default_factory=list)
    issues: List[str] = Field(default_factory=list)
    category_ratings: Dict[str, Any] = Field(default_factory=dict)
    origin: Optional[str] = None
    destination: Optional[str] = None
    created_at: Optional[datetime] = None

class RecurringIssueItem(BaseModel):
    issue_code: str
    label: str
    count: int
    percentage: float
    impact_level: str  # "high", "medium", "low"
    remedy_action: str

class FeedbackAnalysisResponse(BaseModel):
    total_reviews: int
    average_overall_rating: float
    rating_breakdown: Dict[int, int]
    category_averages: Dict[str, float]
    recurring_issues: List[RecurringIssueItem]
    top_positive_highlights: List[str]
    ai_improvement_summary: str
    actionable_recommendations: List[str]
