-- Add user_id column to isolate data per user
ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.attendance ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.additional_income ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.extra_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.court_expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update existing records to belong to the first user (to maintain data integrity)
UPDATE public.students SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
UPDATE public.payments SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
UPDATE public.attendance SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
UPDATE public.additional_income SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
UPDATE public.extra_expenses SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;
UPDATE public.court_expenses SET user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after populating existing data
ALTER TABLE public.students ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.payments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.attendance ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.additional_income ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.extra_expenses ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.court_expenses ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies to isolate data per user
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.students;
DROP POLICY IF EXISTS "Enable update for all users" ON public.students;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.students;

CREATE POLICY "Users can view their own students" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own students" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own students" ON public.students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own students" ON public.students FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.payments;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.payments;

CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments" ON public.payments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.attendance;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.attendance;
DROP POLICY IF EXISTS "Enable update for all users" ON public.attendance;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.attendance;

CREATE POLICY "Users can view their own attendance" ON public.attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own attendance" ON public.attendance FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.additional_income;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.additional_income;
DROP POLICY IF EXISTS "Enable update for all users" ON public.additional_income;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.additional_income;

CREATE POLICY "Users can view their own additional income" ON public.additional_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own additional income" ON public.additional_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own additional income" ON public.additional_income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own additional income" ON public.additional_income FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.extra_expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.extra_expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.extra_expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.extra_expenses;

CREATE POLICY "Users can view their own extra expenses" ON public.extra_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own extra expenses" ON public.extra_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own extra expenses" ON public.extra_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own extra expenses" ON public.extra_expenses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.court_expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.court_expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON public.court_expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.court_expenses;

CREATE POLICY "Users can view their own court expenses" ON public.court_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own court expenses" ON public.court_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own court expenses" ON public.court_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own court expenses" ON public.court_expenses FOR DELETE USING (auth.uid() = user_id);