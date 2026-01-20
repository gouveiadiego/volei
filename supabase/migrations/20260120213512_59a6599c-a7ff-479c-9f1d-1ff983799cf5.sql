-- Create table for casual players (jogadores avulsos)
CREATE TABLE public.casual_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  phone TEXT,
  game_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.casual_players ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view their own casual players"
ON public.casual_players
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own casual players"
ON public.casual_players
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own casual players"
ON public.casual_players
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own casual players"
ON public.casual_players
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_casual_players_user_id ON public.casual_players(user_id);
CREATE INDEX idx_casual_players_game_date ON public.casual_players(game_date);