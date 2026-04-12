-- ============================================================
-- LEAVE MANAGEMENT SYSTEM - DATABASE FIX & SEED SCRIPT
-- Actual leave_balances schema: user_id, total, used_days, balance, year
-- ============================================================

-- STEP 1: RESET PROFILES TABLE
-- Wipe and reset to avoid stale PK conflicts
TRUNCATE public.profiles CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Fix full_name column: ensure it's TEXT not ARRAY
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='full_name' AND data_type='ARRAY'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN full_name TYPE text USING full_name[1];
    END IF;
END $$;

-- Ensure updated_at column exists on profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- STEP 2: FIX LEAVE_REQUESTS TABLE
-- Ensure 'days' column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='leave_requests' AND column_name='days'
    ) THEN
        ALTER TABLE public.leave_requests ADD COLUMN days INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;

-- STEP 3: FIX LEAVE_BALANCES TABLE
-- Ensure 'used_days' column exists (leave 'total' and 'balance' as-is since they exist in the DB)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='leave_balances' AND column_name='used_days'
    ) THEN
        ALTER TABLE public.leave_balances ADD COLUMN used_days INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- STEP 4: CREATE TRIGGER TO AUTO-UPDATE used_days AND balance
-- The trigger keeps both 'used_days' and 'balance' in sync when leave requests are approved/unapproved/deleted.
CREATE OR REPLACE FUNCTION public.sync_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Increase used_days & decrease balance when a request gets approved
    IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status != 'approved') THEN
        UPDATE public.leave_balances
        SET 
            used_days = used_days + NEW.days,
            balance = balance - NEW.days
        WHERE user_id = NEW.user_id AND year = EXTRACT(YEAR FROM NEW.start_date::date);
    
    -- Decrease used_days & increase balance if approval is reversed
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved') THEN
        UPDATE public.leave_balances
        SET 
            used_days = used_days - OLD.days,
            balance = balance + OLD.days
        WHERE user_id = OLD.user_id AND year = EXTRACT(YEAR FROM OLD.start_date::date);
    
    -- Handle deletion of an approved request
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'approved') THEN
        UPDATE public.leave_balances
        SET 
            used_days = used_days - OLD.days,
            balance = balance + OLD.days
        WHERE user_id = OLD.user_id AND year = EXTRACT(YEAR FROM OLD.start_date::date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_leave_request_sync ON public.leave_requests;
CREATE TRIGGER on_leave_request_sync
AFTER UPDATE OR DELETE ON public.leave_requests
FOR EACH ROW EXECUTE PROCEDURE public.sync_leave_balance();

-- STEP 5: SEED BALANCES
-- Initialize a balance row for 2026 for all profiles (uses actual column names: total, balance)
INSERT INTO public.leave_balances (user_id, total, used_days, balance, year)
SELECT id, 21, 0, 21, 2026
FROM public.profiles
ON CONFLICT (user_id, year) DO NOTHING;

-- STEP 6: SYNC EXISTING DATA
-- Recalculate used_days and balance from actual approved requests (in case data exists)
UPDATE public.leave_balances b
SET 
    used_days = COALESCE((
        SELECT SUM(r.days) 
        FROM public.leave_requests r 
        WHERE r.user_id = b.user_id 
          AND r.status = 'approved' 
          AND EXTRACT(YEAR FROM r.start_date::date) = b.year
    ), 0),
    balance = b.total - COALESCE((
        SELECT SUM(r.days) 
        FROM public.leave_requests r 
        WHERE r.user_id = b.user_id 
          AND r.status = 'approved' 
          AND EXTRACT(YEAR FROM r.start_date::date) = b.year
    ), 0)
WHERE b.year = 2026;

-- STEP 7: FORCE API SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
