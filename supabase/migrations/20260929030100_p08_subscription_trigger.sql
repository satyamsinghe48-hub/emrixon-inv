create trigger businesses_create_free_subscription
  after insert on public.businesses
  for each row execute function public.ensure_free_subscription();
