
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habits TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.task_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rewards TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.parties TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.party_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coin_transfers TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

