alter table public.profiles
add column preferred_gender text check (preferred_gender is null or char_length(preferred_gender) <= 40);