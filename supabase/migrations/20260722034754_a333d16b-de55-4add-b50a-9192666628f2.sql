
CREATE TABLE public.harvest_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  params JSONB NOT NULL,
  target_weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvest_scenarios TO authenticated;
GRANT ALL ON public.harvest_scenarios TO service_role;

ALTER TABLE public.harvest_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scenarios"
  ON public.harvest_scenarios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_harvest_scenarios_updated_at
  BEFORE UPDATE ON public.harvest_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_harvest_scenarios_user ON public.harvest_scenarios(user_id, created_at DESC);
