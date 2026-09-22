import logging
from datetime import datetime
from app.core.database import get_database
from app.core.security import hash_password

logger = logging.getLogger("cafe_on_wheels.seed")

async def seed_initial_data():
    db = get_database()
    if db is None:
        logger.warning("Database not available for seeding.")
        return

    # 1. Seed Users
    users_count = await db.users.count_documents({})
    if users_count == 0:
        logger.info("Seeding initial users (admin, customer, driver)...")
        users = [
            {
                "email": "admin@cafeonwheels.com",
                "name": "Velvet Admin",
                "phone": "+91 98200 11223",
                "password_hash": hash_password("admin123"),
                "role": "admin",
                "saved_themes": [],
                "saved_payment_methods": [],
                "preferences": {
                    "favorite_cuisines": ["Coffee & Beverages", "Bakery & Desserts"],
                    "favorite_moods": ["romantic", "comfort"],
                    "notify_weather": True,
                    "notify_events": True,
                    "notify_day": True
                },
                "created_at": datetime.utcnow()
            },
            {
                "email": "customer@cafeonwheels.com",
                "name": "Aarav Sharma",
                "phone": "+91 98190 44556",
                "password_hash": hash_password("customer123"),
                "role": "customer",
                "saved_themes": ["romantic-date"],
                "saved_payment_methods": [
                    {"type": "card", "masked_details": "HDFC Infinia **** 4242", "is_default": True}
                ],
                "preferences": {
                    "favorite_cuisines": ["Bakery & Desserts", "Full Meals"],
                    "favorite_moods": ["romantic", "celebration"],
                    "notify_weather": True,
                    "notify_events": True,
                    "notify_day": True
                },
                "created_at": datetime.utcnow()
            },
            {
                "email": "driver@cafeonwheels.com",
                "name": "Rajesh Kumar (Chauffeur)",
                "phone": "+91 98765 43210",
                "password_hash": hash_password("driver123"),
                "role": "driver",
                "saved_themes": [],
                "saved_payment_methods": [],
                "preferences": {
                    "favorite_cuisines": [],
                    "favorite_moods": [],
                    "notify_weather": False,
                    "notify_events": False,
                    "notify_day": False
                },
                "created_at": datetime.utcnow()
            }
        ]
        await db.users.insert_many(users)

    # 2. Seed Themes
    themes_count = await db.themes.count_documents({})
    if themes_count == 0:
        logger.info("Seeding themes...")
        themes = [
            {
                "name": "Romantic Date",
                "slug": "romantic-date",
                "tagline": "An intimate cocoon of velvet, candlelight, and cinematic views.",
                "description": "Designed for unforgettable evenings. Dimmed champagne sconces, plush burgundy velvet upholstery, private partition, and crystal champagne flutes create an exquisite atmosphere for two.",
                "mood_tags": ["romantic", "anniversary", "intimate", "evening"],
                "base_price_inr": 3499.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png"
                ],
                "gallery_images": [
                    "/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png",
                    "/assets/renders/the_van_interior_details.png"
                ],
                "tour_360_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80",
                "tour_360_hotspots": [
                    {"id": "hs-1", "pitch": -5, "yaw": 20, "title": "Velvet Reclining Loungers", "description": "Custom hand-stitched Italian leather and burgundy velvet."},
                    {"id": "hs-2", "pitch": 15, "yaw": 90, "title": "Starlight Fibre-Optic Ceiling", "description": "Twinkling constellation lighting matching Mumbai's night sky."},
                    {"id": "hs-3", "pitch": 0, "yaw": -45, "title": "Bar & Espresso Counter", "description": "Temperature controlled champagne bucket and La Marzocco espresso station."},
                    {"id": "hs-4", "pitch": 10, "yaw": 180, "title": "Cinematic Retractable Screen", "description": "4K Ultra-short throw projector with Bowers & Wilkins audio."}
                ],
                "add_ons": [
                    {"name": "Mini Theatre", "description": "Transform the space into your private cinema with a fold-down projector screen setup.", "price_inr": 1499.0, "type": "toggle", "default_config": {}},
                    {"name": "Candlelight & Fresh Red Roses", "description": "Warm flameless flickering LED candles paired with 50 Dutch red roses.", "price_inr": 999.0, "type": "toggle", "default_config": {}},
                    {"name": "Curated Romantic Vinyl Playlist", "description": "Dedicated curated jazz & acoustic playlist tuned to the van's acoustics.", "price_inr": 399.0, "type": "toggle", "default_config": {}}
                ],
                "is_active": True,
                "accent_color": "#6E1F2B",
                "suggested_music": "Lo-Fi Jazz / Intimate Acoustic Soul",
                "ideal_for": "Couples, Anniversaries, Proposals",
                "created_at": datetime.utcnow()
            },
            {
                "name": "Birthday Celebration",
                "slug": "birthday-celebration",
                "tagline": "Glamour, gold accents, sparkling confetti, and private revelry.",
                "description": "Celebrate your milestone in majestic fashion. Champagne gold accents, custom balloon installations, artisan dessert presentations, and surround sound turn city streets into your party lounge.",
                "mood_tags": ["celebration", "birthday", "party", "festive"],
                "base_price_inr": 3999.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "/assets/renders/cinematic_3d_render_of_the_birthday_celebration_theme_inside_a_luxury_van.png"
                ],
                "gallery_images": [
                    "/assets/renders/cinematic_3d_render_of_the_birthday_celebration_theme_inside_a_luxury_van.png",
                    "/assets/renders/a_set_of_3d_miniature_figurine_style_characters_high_end_collectible_toy.png"
                ],
                "tour_360_url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80",
                "tour_360_hotspots": [
                    {"id": "bhs-1", "pitch": 0, "yaw": 0, "title": "Celebration Gold Canopy", "description": "Champagne & emerald balloon installation tailored to your initials."},
                    {"id": "bhs-2", "pitch": -10, "yaw": 60, "title": "Dessert Pedestal", "description": "Illuminated acrylic stand for cake cutting moments."},
                    {"id": "bhs-3", "pitch": 5, "yaw": -70, "title": "Party Audio Stage", "description": "Club-grade surround sound with customizable RGB ambience."}
                ],
                "add_ons": [
                    {"name": "24K Gold Leaf Belgian Truffle Cake (1kg)", "description": "Artisan single-origin dark chocolate cake adorned with edible 24K gold foil.", "price_inr": 1599.0, "type": "toggle", "default_config": {}},
                    {"name": "Custom Champagne Balloon Garland", "description": "Organic balloon garland in champagne gold, chrome, and matte black.", "price_inr": 1299.0, "type": "toggle", "default_config": {}},
                    {"name": "Cold Sparkler Entrance", "description": "Indoor-safe cold pyrotechnic sparkler fountain for pickup ceremony.", "price_inr": 799.0, "type": "toggle", "default_config": {}}
                ],
                "is_active": True,
                "accent_color": "#C9A667",
                "suggested_music": "Upbeat Deep House / Modern Disco",
                "ideal_for": "Birthdays, Promotions, Bachelorettes",
                "created_at": datetime.utcnow()
            },
            {
                "name": "Comfort Drive",
                "slug": "comfort-drive",
                "tagline": "Unwind, breathe, and let the city rhythm glide past in tranquility.",
                "description": "Escape the sensory overload of daily life. Calming amber illumination, cashmere throws, essential oil aroma diffusers, and warm single-estate pour-overs restore your stillness.",
                "mood_tags": ["comfort", "chill", "peaceful", "rainy", "evening"],
                "base_price_inr": 2999.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "/assets/renders/cinematic_3d_render_of_the_comfort_drive_theme_inside_a_luxury_van._cozy_plush.png"
                ],
                "gallery_images": [
                    "/assets/renders/cinematic_3d_render_of_the_comfort_drive_theme_inside_a_luxury_van._cozy_plush.png",
                    "/assets/renders/the_van_interior_details.png"
                ],
                "tour_360_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80",
                "tour_360_hotspots": [
                    {"id": "chs-1", "pitch": 0, "yaw": 10, "title": "Zero-Gravity Reclining Chairs", "description": "Heated ergonomic seating designed for decompression."},
                    {"id": "chs-2", "pitch": -5, "yaw": -40, "title": "Organic Herbal Tea & Pour-Over Bar", "description": "Freshly brewed chamomile, blue pea tea, or estate Arabica."},
                    {"id": "chs-3", "pitch": 20, "yaw": 120, "title": "Sandalwood Aroma Diffuser", "description": "Natural therapeutic grade botanical mist."}
                ],
                "add_ons": [
                    {"name": "Sandalwood & Bergamot Aroma Mist", "description": "Therapeutic botanical diffusion to calm the senses.", "price_inr": 599.0, "type": "toggle", "default_config": {}},
                    {"name": "Heated Shiatsu Massage Setting", "description": "Activates deep tissue massage functions in rear loungers.", "price_inr": 899.0, "type": "toggle", "default_config": {}},
                    {"name": "Cashmere Blanket & Silk Eye Mask Set", "description": "Premium take-home pure silk sleep mask and ultra-soft fleece.", "price_inr": 999.0, "type": "toggle", "default_config": {}}
                ],
                "is_active": True,
                "accent_color": "#0E3B2E",
                "suggested_music": "Ambient Soundscapes / Rainy Jazz",
                "ideal_for": "Solo Decompression, Midnight Drives, Deep Conversations",
                "created_at": datetime.utcnow()
            }
        ]
        await db.themes.insert_many(themes)

    # 3. Seed Vehicles
    vehicles_count = await db.vehicles.count_documents({})
    if vehicles_count == 0:
        logger.info("Seeding luxury vehicles...")
        vehicles = [
            {
                "name": "Velvet Voyager I",
                "model": "Mercedes-Benz Sprinter 319 CDI Luxury Custom",
                "seating_capacity": 6,
                "status": "available",
                "current_location": {
                    "lat": 19.0596,
                    "lng": 72.8295,
                    "address": "Bandra Bandstand, Mumbai"
                },
                "render_image_url": "/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png",
                "floor_plan_image_url": "/assets/renders/a_clean_premium_3d_floor_plan_cutaway_of_a_luxury_van_interior._styled_in.png",
                "features": [
                    "Individual Captain Recliners",
                    "Acoustic Double Glazing",
                    "Custom Velvet & Leather Trim",
                    "4K Cinema Projector",
                    "Integrated Espresso Bar"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Champagne Sovereign",
                "model": "Mercedes-Benz Sprinter Executive Lounge",
                "seating_capacity": 7,
                "status": "available",
                "current_location": {
                    "lat": 18.9220,
                    "lng": 72.8347,
                    "address": "Colaba / Marine Drive, Mumbai"
                },
                "render_image_url": "/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png",
                "floor_plan_image_url": "/assets/renders/a_clean_premium_3d_floor_plan_cutaway_of_a_luxury_van_interior._styled_in.png",
                "features": [
                    "Starlight Ceiling Constellation",
                    "Champagne Bar Station",
                    "High-Speed 5G Starlink Wi-Fi",
                    "Bowers & Wilkins High-End Sound",
                    "Privacy Smart Glass"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Nocturne Elegance",
                "model": "Mercedes-Benz V-Class Maybach Edition",
                "seating_capacity": 6,
                "status": "available",
                "current_location": {
                    "lat": 19.1075,
                    "lng": 72.8263,
                    "address": "Juhu Tara Road, Mumbai"
                },
                "render_image_url": "/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png",
                "floor_plan_image_url": "/assets/renders/a_clean_premium_3d_floor_plan_cutaway_of_a_luxury_van_interior._styled_in.png",
                "features": [
                    "Zero-Gravity Heated Massaging Chairs",
                    "Artisanal Coffee Bar",
                    "Ambient Underglow & Sconces",
                    "Noise-Cancelling Acoustic Cabin",
                    "Climate Controlled Air Purifier"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        await db.vehicles.insert_many(vehicles)

    # 4. Seed Menu Items
    menu_count = await db.menu_items.count_documents({})
    if menu_count == 0:
        logger.info("Seeding artisanal menu items...")
        menu_items = [
            # Coffee & Beverages
            {
                "name": "Velvet Gold Espresso",
                "category": "Coffee & Beverages",
                "description": "Double ristretto pulled with single-origin Ethiopian Yirgacheffe, finished with gold dust.",
                "price_inr": 349.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Signature", "Hot"]
            },
            {
                "name": "Sparkling Hibiscus Cold Brew",
                "category": "Coffee & Beverages",
                "description": "18-hour cold brew infused with organic hibiscus, tonic water, and dried orange slice.",
                "price_inr": 399.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Iced", "Refreshing"]
            },
            {
                "name": "Belgian Hot Chocolate & Marshmallows",
                "category": "Coffee & Beverages",
                "description": "70% Callebaut chocolate melted in steamed whole milk with torched artisanal vanilla bean marshmallow.",
                "price_inr": 449.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Warm", "Decadent"]
            },

            # Bakery & Desserts
            {
                "name": "Artisan Cheese & Charcuterie Board",
                "category": "Bakery & Desserts",
                "description": "Truffle gouda, aged brie, smoked cheddar, kalamata olives, dried figs, and sourdough crackers.",
                "price_inr": 899.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Chef Special", "Pairing"]
            },
            {
                "name": "Hazelnut Praline Cruffin",
                "category": "Bakery & Desserts",
                "description": "Flaky French croissant-muffin hybrid injected with roasted Piedmont hazelnut praline creme.",
                "price_inr": 379.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Freshly Baked"]
            },
            {
                "name": "Opera Cake with Gold Leaf",
                "category": "Bakery & Desserts",
                "description": "Almond sponge soaked in coffee syrup, layered with ganache, coffee buttercream, and 24K leaf.",
                "price_inr": 499.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Luxury", "Bestseller"]
            },

            # Breakfast
            {
                "name": "Truffle Scrambled Brioche",
                "category": "Breakfast",
                "description": "Silky free-range scrambled eggs with black summer truffle oil on toasted French butter brioche.",
                "price_inr": 549.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Gourmet Breakfast"]
            },
            {
                "name": "Avocado & Burrata Tartine",
                "category": "Breakfast",
                "description": "Hass avocado mousse, Italian burrata, heirloom tomatoes, and aged balsamic on seeded multigrain.",
                "price_inr": 599.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Healthy", "Vegetarian"]
            },

            # Full Meals
            {
                "name": "Wild Mushroom & Truffle Risotto",
                "category": "Full Meals",
                "description": "Carnaroli rice slow cooked with porcini and shimeji mushrooms, aged parmesan, and truffle butter.",
                "price_inr": 799.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Warm Meal"]
            },
            {
                "name": "Charred Rosemary Smoked Paneer Platter",
                "category": "Full Meals",
                "description": "Malai paneer infused with smoked rosemary, served with saffron pilaf and microgreens.",
                "price_inr": 749.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Chef Signature"]
            },

            # Regional Cuisine
            {
                "name": "Coastal Malabar Coconut Sliders",
                "category": "Regional Cuisine",
                "description": "Crisp spiced raw banana patty with tempered curry leaf coconut reduction inside slider buns.",
                "price_inr": 499.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Fusion", "Spicy"]
            },

            # Vegan/Vegetarian
            {
                "name": "Berry Acai Smoothie Bowl",
                "category": "Vegan/Vegetarian",
                "description": "Amazonian acai puree topped with chia seeds, toasted coconut flakes, kiwi, and blueberries.",
                "price_inr": 449.0,
                "is_veg": True,
                "image_url": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80",
                "is_available": True,
                "tags": ["Superfood", "Vegan"]
            }
        ]
        await db.menu_items.insert_many(menu_items)

    # 5. Seed Offers
    offers_count = await db.offers.count_documents({})
    if offers_count == 0:
        logger.info("Seeding promotional offers...")
        offers = [
            {
                "code": "VELVET10",
                "discount_type": "percentage",
                "value": 10.0,
                "max_discount_inr": 1000.0,
                "min_order_value_inr": 2500.0,
                "description": "10% off on any luxury themed ride experience (up to ₹1,000).",
                "is_active": True,
                "usage_limit": 1000,
                "times_used": 14,
                "created_at": datetime.utcnow()
            },
            {
                "code": "WELCOME500",
                "discount_type": "flat",
                "value": 500.0,
                "max_discount_inr": 500.0,
                "min_order_value_inr": 3000.0,
                "description": "Flat ₹500 discount on your inaugural sanctuary on wheels.",
                "is_active": True,
                "usage_limit": 500,
                "times_used": 28,
                "created_at": datetime.utcnow()
            },
            {
                "code": "ROMANCE20",
                "discount_type": "percentage",
                "value": 20.0,
                "max_discount_inr": 1500.0,
                "min_order_value_inr": 3400.0,
                "description": "20% off exclusively on Romantic Date theme bookings.",
                "is_active": True,
                "usage_limit": 200,
                "times_used": 9,
                "created_at": datetime.utcnow()
            }
        ]
        await db.offers.insert_many(offers)

    logger.info("Database seeding complete!")
