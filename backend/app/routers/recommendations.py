from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.core.database import get_database
from app.core.security import get_current_user_payload
from app.models.recommendation import AIRecommendationResponse

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.get("", response_model=AIRecommendationResponse)
async def get_ai_recommendation(
    city: str = Query("Mumbai"),
    weather_hint: Optional[str] = Query(None),
    hour_hint: Optional[int] = Query(None),
    day_hint: Optional[str] = Query(None)
):
    """
    Intelligent rule-based recommendation engine taking weather, hour of day, and day of week.
    Returns targeted theme, contextual narrative copy, and recommended add-ons.
    """
    db = get_database()
    now = datetime.now()
    current_hour = hour_hint if hour_hint is not None else now.hour
    weekday_idx = now.weekday()  # 0=Mon, 4=Fri, 5=Sat, 6=Sun
    is_weekend = (day_hint in ("saturday", "sunday")) or (weekday_idx in (4, 5, 6))

    # Determine environmental condition
    weather = (weather_hint or "").lower()
    if not weather:
        if current_hour >= 19 or current_hour < 5:
            weather = "starry night"
        elif 16 <= current_hour < 19:
            weather = "golden sunset"
        else:
            weather = "breezy"

    # Rules Engine
    if "rain" in weather or "monsoon" in weather:
        # Comfort Drive for rainy days
        theme_slug = "comfort-drive"
        badge = "Weather Suggestion"
        trigger = "weather"
        headline = "Raindrops & Warm Roasts"
        message = f"Drizzly Mumbai weather calls for acoustic warmth. Sink into heated loungers with single-estate pour-overs while the city glides past."
        addons = ["Sandalwood & Bergamot Aroma Mist", "Heated Shiatsu Massage Setting"]
        temp = 24.5
        cond = "Gentle Monsoon Rain"

    elif current_hour >= 18 or "romantic" in weather or "sunset" in weather:
        # Romantic Date for late afternoon / evening
        theme_slug = "romantic-date"
        badge = "Evening Sanctuary"
        trigger = "time"
        headline = "Golden Hour to Starlight"
        message = "Twilight over Marine Drive is best shared in privacy. Reserve our burgundy velvet lounge with crystal flutes and bespoke candlelight."
        addons = ["Mini Theatre", "Candlelight & Fresh Red Roses"]
        temp = 27.0
        cond = "Pleasant Coastal Breeze"

    elif is_weekend:
        # Birthday / Celebration for weekends
        theme_slug = "birthday-celebration"
        badge = "Weekend Euphoria"
        trigger = "day"
        headline = "Turn Streets Into Your VIP Lounge"
        message = "The weekend has arrived. Celebrate milestones in majestic champagne gold with custom balloon canopies and 24K gold truffle cake."
        addons = ["24K Gold Leaf Belgian Truffle Cake (1kg)", "Custom Champagne Balloon Garland"]
        temp = 28.5
        cond = "Clear Skies"

    else:
        # Daytime / General Comfort Drive
        theme_slug = "comfort-drive"
        badge = "Midweek Rejuvenation"
        trigger = "mood"
        headline = "A Private Moving Sanctuary"
        message = "Step away from the fast pace. Experience a tranquil mobile workspace and espresso lounge with high-speed connectivity."
        addons = ["Organic Herbal Tea & Pour-Over Bar", "Zero-Gravity Reclining Chairs"]
        temp = 26.0
        cond = "Sunny & Mild"

    # Fetch theme details from database
    theme = None
    if db is not None:
        theme = await db.themes.find_one({"slug": theme_slug})
    
    theme_id = str(theme["_id"]) if theme else theme_slug
    theme_name = theme.get("name", "Luxury Theme") if theme else "Comfort Drive"
    hero_image = (theme.get("hero_images", [""])[0]) if theme and theme.get("hero_images") else "/assets/renders/cinematic_3d_render_of_the_comfort_drive_theme_inside_a_luxury_van._cozy_plush.png"

    return AIRecommendationResponse(
        theme_id=theme_id,
        theme_slug=theme_slug,
        theme_name=theme_name,
        theme_hero_image=hero_image,
        trigger_type=trigger,
        badge_label=badge,
        headline=headline,
        message=message,
        suggested_addons=addons,
        weather_condition=cond,
        temperature_c=temp,
        cta_label=f"Book {theme_name}"
    )
