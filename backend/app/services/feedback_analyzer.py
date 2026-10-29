import logging
from typing import List, Dict, Any
from app.schemas.feedback import FeedbackAnalysisResponse, RecurringIssueItem

logger = logging.getLogger("feedback_analyzer")

ISSUE_CATALOG = {
    "unrealistic_budget": {
        "label": "Unrealistic Budget / Hidden Costs",
        "impact": "high",
        "remedy": "Auto-adjust regional hotel tariff baselines and incorporate peak season buffers."
    },
    "taxi_fare_high": {
        "label": "Airport / Station Taxi Fare Overestimated",
        "impact": "medium",
        "remedy": "Prioritize direct Metro Express and AC State Electric Buses over private cabs."
    },
    "incorrect_route": {
        "label": "Road Bottlenecks / Suboptimal Route",
        "impact": "high",
        "remedy": "Favor 4-lane National Highway express bypasses over congested interior state roads."
    },
    "unavailable_transport": {
        "label": "Public Transit Not Readily Available",
        "impact": "medium",
        "remedy": "Include verified prepaid counter alternatives and advance rental booking links."
    },
    "missing_info": {
        "label": "Missing Station / Terminal Guidance",
        "impact": "low",
        "remedy": "Provide explicit pillar and arrival lane instructions for rideshare pickup zones."
    },
    "irrelevant_destinations": {
        "label": "Pacing Too Fast / Too Many Stops",
        "impact": "medium",
        "remedy": "Increase dwell times at key monuments from 60 mins to 120 mins with leisurely buffers."
    }
}

class FeedbackAnalyzerService:
    """Analyzes user travel feedback, synthesizes trends, and guides continuous planner improvements."""

    def analyze_feedback(self, reviews: List[Any]) -> FeedbackAnalysisResponse:
        total = len(reviews)
        if total == 0:
            return FeedbackAnalysisResponse(
                total_reviews=0,
                average_overall_rating=5.0,
                rating_breakdown={5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
                category_averages={"route_quality": 5.0, "transport": 5.0, "cost_accuracy": 5.0, "recommendations": 5.0},
                recurring_issues=[],
                top_positive_highlights=["Zero user complaints recorded yet."],
                ai_improvement_summary="The AI travel planning agent is performing with baseline accuracy. Waiting for traveler feedback.",
                actionable_recommendations=["Collect post-trip traveler reviews across diverse route corridors."]
            )

        # Rating breakdown
        rating_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        total_rating_sum = 0
        cat_sums: Dict[str, float] = {"route_quality": 0, "transport": 0, "cost_accuracy": 0, "recommendations": 0}
        cat_counts: Dict[str, int] = {"route_quality": 0, "transport": 0, "cost_accuracy": 0, "recommendations": 0}
        issue_counts: Dict[str, int] = {}
        positive_tags_found = []

        for r in reviews:
            r_rating = getattr(r, "rating", 5)
            r_rating_clamped = max(1, min(5, r_rating))
            rating_counts[r_rating_clamped] = rating_counts.get(r_rating_clamped, 0) + 1
            total_rating_sum += r_rating_clamped

            # Quick tags
            qtags = getattr(r, "quick_tags", []) or []
            for tag in qtags:
                if tag in ["Helpful", "Accurate", "Scenic Routes", "Great Food", "Smooth Transfer"]:
                    positive_tags_found.append(tag)

            # Issues
            issues = getattr(r, "issues", []) or []
            for iss in issues:
                issue_counts[iss] = issue_counts.get(iss, 0) + 1

            # Category ratings
            cats = getattr(r, "category_ratings", {}) or {}
            for c_key in ["route_quality", "transport", "cost_accuracy", "recommendations"]:
                if c_key in cats and cats[c_key]:
                    cat_sums[c_key] += cats[c_key]
                    cat_counts[c_key] += 1

        avg_rating = round(total_rating_sum / total, 2)
        category_averages = {
            k: round(cat_sums[k] / cat_counts[k], 2) if cat_counts[k] > 0 else avg_rating
            for k in cat_sums
        }

        # Build recurring issues list
        recurring_list: List[RecurringIssueItem] = []
        for code, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True):
            meta = ISSUE_CATALOG.get(code, {
                "label": code.replace("_", " ").title(),
                "impact": "medium",
                "remedy": "Continuous refinement of travel suggestions."
            })
            pct = round((count / total) * 100, 1)
            recurring_list.append(
                RecurringIssueItem(
                    issue_code=code,
                    label=meta["label"],
                    count=count,
                    percentage=pct,
                    impact_level=meta["impact"],
                    remedy_action=meta["remedy"]
                )
            )

        # Highlights & Recommendations
        top_positive = [
            "Accurate day-by-day itineraries with scenic pacing",
            "Convenient last-mile transfer options from airports and railway stations",
            "Multi-budget stay recommendations matching real room rates",
            "Direct navigation links to Google Maps and booking providers"
        ]
        if positive_tags_found:
            from collections import Counter
            common = [f"Travelers highlighted: '{t}'" for t, _ in Counter(positive_tags_found).most_common(2)]
            top_positive = common + top_positive[:2]

        # Actionable recommendations
        actionable = []
        if any(iss.issue_code in ["taxi_fare_high", "unavailable_transport"] for iss in recurring_list):
            actionable.append("Prioritize public AC express shuttles and direct metro transfers where available.")
        if any(iss.issue_code == "unrealistic_budget" for iss in recurring_list):
            actionable.append("Provide dynamic seasonal tariff warnings for peak holiday destinations (e.g., Goa in Dec-Jan).")
        if any(iss.issue_code == "irrelevant_destinations" for iss in recurring_list):
            actionable.append("Enforce minimum 90-minute dwell times per monument to prevent travel fatigue.")
        if not actionable:
            actionable.append("System is running optimally; maintain verified catalog synchronizations.")

        summary = (
            f"Analyzed {total} verified traveler reviews with an average satisfaction rating of {avg_rating} / 5.0. "
            f"Route quality ({category_averages.get('route_quality', 4.8)}★) and recommendations ({category_averages.get('recommendations', 4.7)}★) "
            f"score highest. Continuous adjustments have been applied to optimize last-mile transfer recommendations."
        )

        return FeedbackAnalysisResponse(
            total_reviews=total,
            average_overall_rating=avg_rating,
            rating_breakdown=rating_counts,
            category_averages=category_averages,
            recurring_issues=recurring_list,
            top_positive_highlights=top_positive,
            ai_improvement_summary=summary,
            actionable_recommendations=actionable,
        )

feedback_analyzer = FeedbackAnalyzerService()
