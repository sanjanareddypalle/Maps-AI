from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.database.session import get_db
from app.database.models import User, TripFeedback
from app.schemas.feedback import FeedbackCreateRequest, FeedbackResponse, FeedbackAnalysisResponse
from app.auth.security import get_optional_current_user
from app.services.feedback_analyzer import feedback_analyzer

router = APIRouter(prefix="/feedback", tags=["User Reviews & Continuous Improvement"])

DEMO_SEED_REVIEWS = [
    {
        "user_name": "Rohan Deshmukh",
        "rating": 5,
        "written_feedback": "The last-mile transfer options from Goa Mopa airport to Calangute were super helpful! Saved me ₹800 by taking the Kadamba AC shuttle instead of airport counter cab.",
        "quick_tags": ["Helpful", "Accurate", "Smooth Transfer"],
        "issues": [],
        "category_ratings": {"route_quality": 5, "transport": 5, "cost_accuracy": 5, "recommendations": 5},
        "origin": "Mumbai",
        "destination": "Goa"
    },
    {
        "user_name": "Priya Sharma",
        "rating": 4,
        "written_feedback": "Great scenic route from Bangalore to Adiyogi Coimbatore. The Thoppur ghat stop was stunning. Would love even more budget hotel alternatives.",
        "quick_tags": ["Accurate", "Scenic Routes"],
        "issues": ["unrealistic_budget"],
        "category_ratings": {"route_quality": 5, "transport": 4, "cost_accuracy": 3, "recommendations": 5},
        "origin": "Bangalore",
        "destination": "Coimbatore Adiyogi"
    },
    {
        "user_name": "Vikram Patel",
        "rating": 4,
        "written_feedback": "Directions and waypoint navigation on Google Maps worked without a hitch. Adding direct Ola/Uber links made airport arrival stress-free.",
        "quick_tags": ["Helpful", "Accurate"],
        "issues": [],
        "category_ratings": {"route_quality": 4, "transport": 4, "cost_accuracy": 4, "recommendations": 4},
        "origin": "Hyderabad",
        "destination": "Hampi"
    }
]

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback_in: FeedbackCreateRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits user review and feedback for an AI-generated trip plan.
    Supports authenticated users and guest/demo travelers.
    """
    user_id = current_user.id if current_user else None
    user_name = current_user.full_name if current_user else "Traveler"

    new_fb = TripFeedback(
        trip_id=feedback_in.trip_id,
        user_id=user_id,
        user_name=user_name,
        rating=feedback_in.rating,
        quick_tags=feedback_in.quick_tags,
        issues=feedback_in.issues,
        category_ratings=feedback_in.category_ratings,
        written_feedback=feedback_in.written_feedback,
        origin=feedback_in.origin,
        destination=feedback_in.destination,
    )

    db.add(new_fb)
    await db.commit()
    await db.refresh(new_fb)
    return FeedbackResponse.model_validate(new_fb)

@router.get("", response_model=List[FeedbackResponse])
async def list_feedback(
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves recent traveler reviews."""
    res = await db.execute(
        select(TripFeedback).order_by(TripFeedback.created_at.desc()).limit(limit)
    )
    feedbacks = res.scalars().all()
    if not feedbacks:
        # Return seeded demo reviews so UI isn't empty
        return [
            FeedbackResponse(
                id=f"demo_fb_{idx}",
                user_name=d["user_name"],
                rating=d["rating"],
                written_feedback=d["written_feedback"],
                quick_tags=d["quick_tags"],
                issues=d["issues"],
                category_ratings=d["category_ratings"],
                origin=d["origin"],
                destination=d["destination"],
            )
            for idx, d in enumerate(DEMO_SEED_REVIEWS)
        ]
    return [FeedbackResponse.model_validate(fb) for fb in feedbacks]

@router.get("/analysis", response_model=FeedbackAnalysisResponse)
async def get_feedback_analysis(
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregates all user feedback, computes sentiment, identifies recurring issues,
    and returns AI-synthesized continuous improvement actions.
    """
    res = await db.execute(select(TripFeedback))
    feedbacks = res.scalars().all()

    # If database is fresh, supplement with seed reviews
    all_reviews = list(feedbacks)
    if not all_reviews:
        for idx, d in enumerate(DEMO_SEED_REVIEWS):
            all_reviews.append(
                type("SeedFB", (), {
                    "rating": d["rating"],
                    "quick_tags": d["quick_tags"],
                    "issues": d["issues"],
                    "category_ratings": d["category_ratings"],
                })()
            )

    return feedback_analyzer.analyze_feedback(all_reviews)
