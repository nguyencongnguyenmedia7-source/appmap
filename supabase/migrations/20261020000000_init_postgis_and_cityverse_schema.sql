-- ==============================================================================
-- CITYVERSE POSTGIS & APPLICATION SCHEMA MIGRATION
-- Standard EPSG:4326 (WGS84) Geography with GiST Indexes and RLS Policies
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerations & Types
DO $$ BEGIN
    CREATE TYPE verification_status_type AS ENUM ('pending', 'verified', 'rejected', 'needs_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE friendship_status_type AS ENUM ('pending', 'accepted', 'declined', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_profile_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Places Table (Core Geospatial Entity)
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    province_code TEXT,
    administrative_metadata JSONB,
    -- Geography Point in WGS84 (EPSG:4326)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    entrance_location GEOGRAPHY(Point, 4326),
    location_accuracy_meters NUMERIC(6, 2) DEFAULT 10.0,
    data_source TEXT NOT NULL DEFAULT 'CITYVERSE', -- 'CITYVERSE', 'OSM', 'COMMUNITY', 'MAPBOX'
    external_source_id TEXT,
    verification_status verification_status_type NOT NULL DEFAULT 'verified',
    opening_hours JSONB,
    phone TEXT,
    website TEXT,
    cover_image_url TEXT,
    checkin_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    rating_average NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Spatial GiST Index for ultra-fast spatial search
CREATE INDEX IF NOT EXISTS idx_places_location ON public.places USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places (category);
CREATE INDEX IF NOT EXISTS idx_places_verification_status ON public.places (verification_status);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON public.places (is_active);

-- 5. Place Suggestions Table (Community submitted POIs)
CREATE TABLE IF NOT EXISTS public.place_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status verification_status_type NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_place_suggestions_location ON public.place_suggestions USING GIST (location);

-- 6. Check-ins Table
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    user_location GEOGRAPHY(Point, 4326) NOT NULL,
    gps_accuracy_meters NUMERIC(6, 2) NOT NULL,
    is_verified_proximity BOOLEAN NOT NULL DEFAULT FALSE,
    photo_url TEXT,
    caption TEXT,
    xp_awarded INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.checkins (user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_place_id ON public.checkins (place_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON public.checkins (created_at DESC);

-- 7. Posts and Media Tables
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    is_location_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_place_id ON public.posts (place_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Likes and Comments
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status friendship_status_type NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 10. Events and Attendees
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    cover_image_url TEXT,
    attendee_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 11. Challenges & Gamification
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon_url TEXT,
    category TEXT NOT NULL DEFAULT 'all',
    required_checkins INTEGER NOT NULL DEFAULT 5,
    xp_reward INTEGER NOT NULL DEFAULT 200,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    current_progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('place', 'post', 'comment', 'event', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_location_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy_meters NUMERIC(6, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 12. POSTGIS SPATIAL RPC FUNCTIONS
-- ==============================================================================

-- A. Query Places within Map Viewport Bounding Box (Debounced Viewport API)
CREATE OR REPLACE FUNCTION public.get_places_in_viewport(
    min_lng DOUBLE PRECISION,
    min_lat DOUBLE PRECISION,
    max_lng DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    p_categories TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    category TEXT,
    address TEXT,
    province_code TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    location_accuracy_meters NUMERIC,
    data_source TEXT,
    verification_status verification_status_type,
    cover_image_url TEXT,
    checkin_count INTEGER,
    post_count INTEGER,
    rating_average NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.category,
        p.address,
        p.province_code,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        p.location_accuracy_meters,
        p.data_source,
        p.verification_status,
        p.cover_image_url,
        p.checkin_count,
        p.post_count,
        p.rating_average
    FROM public.places p
    WHERE p.is_active = TRUE
      -- PostGIS Bounding Box Intersect (fast GiST indexed check)
      AND ST_Contains(
            ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326),
            p.location::geometry
      )
      AND (p_categories IS NULL OR p.category = ANY(p_categories))
    ORDER BY p.checkin_count DESC, p.rating_average DESC
    LIMIT LEAST(p_limit, 100);
END;
$$;

-- B. Query Places Nearby User's Coordinates
CREATE OR REPLACE FUNCTION public.get_places_nearby(
    p_lng DOUBLE PRECISION,
    p_lat DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION DEFAULT 2000,
    p_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    address TEXT,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    verification_status verification_status_type,
    cover_image_url TEXT,
    checkin_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_origin GEOGRAPHY(Point, 4326);
BEGIN
    v_origin := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.category,
        p.address,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        ST_Distance(p.location, v_origin) AS distance_meters,
        p.verification_status,
        p.cover_image_url,
        p.checkin_count
    FROM public.places p
    WHERE p.is_active = TRUE
      AND ST_DWithin(p.location, v_origin, p_radius_meters)
    ORDER BY distance_meters ASC
    LIMIT LEAST(p_limit, 50);
END;
$$;

-- C. Perform Server-Verified Check-in with Anti-Cheat & XP Calculation
CREATE OR REPLACE FUNCTION public.perform_verified_checkin(
    p_place_id UUID,
    p_user_lng DOUBLE PRECISION,
    p_user_lat DOUBLE PRECISION,
    p_accuracy NUMERIC,
    p_photo_url TEXT DEFAULT NULL,
    p_caption TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_place RECORD;
    v_user_location GEOGRAPHY(Point, 4326);
    v_distance DOUBLE PRECISION;
    v_is_verified BOOLEAN := FALSE;
    v_xp_to_award INTEGER := 50;
    v_last_checkin TIMESTAMPTZ;
    v_checkin_id UUID;
    v_new_level INTEGER;
    v_total_xp INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Vui lòng đăng nhập để check-in.';
    END IF;

    -- Anti-cheat: Check rate limit (at least 30 mins between check-ins at same place)
    SELECT created_at INTO v_last_checkin
    FROM public.checkins
    WHERE user_id = v_user_id AND place_id = p_place_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_last_checkin IS NOT NULL AND (NOW() - v_last_checkin) < INTERVAL '30 minutes' THEN
        RAISE EXCEPTION 'Bạn đã check-in tại địa điểm này gần đây. Hãy quay lại sau 30 phút!';
    END IF;

    -- Fetch place location
    SELECT id, name, location INTO v_place
    FROM public.places
    WHERE id = p_place_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Địa điểm không tồn tại hoặc đã ngừng hoạt động.';
    END IF;

    -- Calculate physical distance between user GPS and Place
    v_user_location := ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography;
    v_distance := ST_Distance(v_place.location, v_user_location);

    -- Strict verification within 200m or adjusted for weak accuracy
    IF v_distance <= 200.0 THEN
        v_is_verified := TRUE;
        v_xp_to_award := v_xp_to_award + 25; -- Proximity bonus
    ELSIF p_accuracy > 50 AND v_distance <= 400.0 AND p_accuracy <= 150.0 THEN
        v_is_verified := TRUE;
        v_xp_to_award := v_xp_to_award + 10;
    ELSE
        v_is_verified := FALSE;
    END IF;

    -- Photo bonus
    IF p_photo_url IS NOT NULL AND length(p_photo_url) > 0 THEN
        v_xp_to_award := v_xp_to_award + 25;
    END IF;

    -- Insert check-in record
    INSERT INTO public.checkins (
        user_id,
        place_id,
        user_location,
        gps_accuracy_meters,
        is_verified_proximity,
        photo_url,
        caption,
        xp_awarded
    )
    VALUES (
        v_user_id,
        p_place_id,
        v_user_location,
        p_accuracy,
        v_is_verified,
        p_photo_url,
        p_caption,
        v_xp_to_award
    )
    RETURNING id INTO v_checkin_id;

    -- Update place checkin counter
    UPDATE public.places
    SET checkin_count = checkin_count + 1,
        updated_at = NOW()
    WHERE id = p_place_id;

    -- Record XP Transaction
    INSERT INTO public.xp_transactions (
        user_id,
        amount,
        reason,
        reference_id
    )
    VALUES (
        v_user_id,
        v_xp_to_award,
        'Check-in tại ' || v_place.name,
        v_checkin_id
    );

    -- Recalculate user XP & Level (1 level per 500 XP)
    UPDATE public.profiles
    SET xp = xp + v_xp_to_award,
        level = 1 + FLOOR((xp + v_xp_to_award) / 500),
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE id = v_user_id
    RETURNING xp, level INTO v_total_xp, v_new_level;

    RETURN jsonb_build_object(
        'success', TRUE,
        'checkin_id', v_checkin_id,
        'distance_meters', ROUND(v_distance::numeric, 1),
        'is_verified', v_is_verified,
        'xp_awarded', v_xp_to_award,
        'total_xp', v_total_xp,
        'current_level', v_new_level
    );
END;
$$;

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_location_shares ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, user can update only own profile (cannot alter XP/level directly)
CREATE POLICY "Profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile fields" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Places: Public read for active places, admin/service insert & update
CREATE POLICY "Places are readable by all users" ON public.places FOR SELECT USING (is_active = TRUE);

-- Place suggestions: Anyone authenticated can submit, users can read own
CREATE POLICY "Authenticated users can submit place suggestions" ON public.place_suggestions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can view their own place suggestions" ON public.place_suggestions FOR SELECT USING (auth.uid() = submitted_by);

-- Checkins: Public read, users can insert only for themselves
CREATE POLICY "Checkins are readable by all" ON public.checkins FOR SELECT USING (true);
CREATE POLICY "Users can create checkins" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts: Public read, creator can modify/delete
CREATE POLICY "Posts are readable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post media: Read public, insert matches post author
CREATE POLICY "Media is readable by everyone" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "Post author can insert media" ON public.post_media FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- Likes: Read public, insert/delete own
CREATE POLICY "Likes readable by all" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can toggle own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Read public, insert/delete own
CREATE POLICY "Comments readable by all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Friendships: Only participants can read or update
CREATE POLICY "Users can view friendships involving them" ON public.friendships FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send friendship requests" ON public.friendships FOR INSERT 
    WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update friendship status" ON public.friendships FOR UPDATE 
    USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Events: Public read, organizer manage
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Event Attendees: Public read, user manage own RSVP
CREATE POLICY "Event attendees viewable by all" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can RSVP to events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change RSVP status" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);

-- Challenges: Active challenges viewable by all
CREATE POLICY "Challenges viewable by all" ON public.challenges FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Users can view own challenge progress" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);

-- XP Transactions: User can only read own
CREATE POLICY "Users can read own XP transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- Notifications: User can only read and update own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications as read" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports: Authenticated user can submit reports
CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Location Shares: Only accepted friends can read live location
CREATE POLICY "Friends can view live location" ON public.user_location_shares FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
          AND ((f.sender_id = auth.uid() AND f.receiver_id = user_id) OR
               (f.receiver_id = auth.uid() AND f.sender_id = user_id))
    )
);
CREATE POLICY "Users can update own location share" ON public.user_location_shares FOR ALL USING (auth.uid() = user_id);
