-- Papai Forte: acesso por lista de convidados + laudos privados + apagar dados.
-- Rodado no SQL Editor do Supabase (projeto papai-forte). Pode rodar de novo sem problema.

-- 1) Lista de convidados (ninguém lê pela API; só as regras do banco consultam)
create table if not exists public.allowed_emails (
  email text primary key,
  added_at timestamptz not null default now()
);
alter table public.allowed_emails enable row level security;
revoke all on public.allowed_emails from anon, authenticated;
-- (o e-mail do dono foi inserido direto no SQL Editor; não fica no repositório, que é público)
-- insert into public.allowed_emails (email) values ('SEU_EMAIL@gmail.com') on conflict do nothing;

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_emails a where a.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_allowed() from public, anon;
grant execute on function public.is_allowed() to authenticated;

-- 2) Dados do app: cada pessoa só vê e mexe nos próprios dados, e só se for convidada
drop policy if exists "so o dono le" on public.app_state;
drop policy if exists "so o dono cria" on public.app_state;
drop policy if exists "so o dono altera" on public.app_state;
drop policy if exists "dono le" on public.app_state;
drop policy if exists "dono cria" on public.app_state;
drop policy if exists "dono altera" on public.app_state;
drop policy if exists "dono apaga" on public.app_state;
create policy "dono le" on public.app_state for select to authenticated using (auth.uid() = user_id and public.is_allowed());
create policy "dono cria" on public.app_state for insert to authenticated with check (auth.uid() = user_id and public.is_allowed());
create policy "dono altera" on public.app_state for update to authenticated using (auth.uid() = user_id and public.is_allowed()) with check (auth.uid() = user_id and public.is_allowed());
create policy "dono apaga" on public.app_state for delete to authenticated using (auth.uid() = user_id and public.is_allowed());
grant select, insert, update, delete on public.app_state to authenticated;

-- 3) Laudos médicos: pasta privada por pessoa (<id do usuário>/arquivo), até 10 MB, foto ou PDF
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('laudos', 'laudos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do nothing;
drop policy if exists "laudo dono le" on storage.objects;
drop policy if exists "laudo dono envia" on storage.objects;
drop policy if exists "laudo dono apaga" on storage.objects;
create policy "laudo dono le" on storage.objects for select to authenticated using (bucket_id = 'laudos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_allowed());
create policy "laudo dono envia" on storage.objects for insert to authenticated with check (bucket_id = 'laudos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_allowed());
create policy "laudo dono apaga" on storage.objects for delete to authenticated using (bucket_id = 'laudos' and (storage.foldername(name))[1] = auth.uid()::text and public.is_allowed());

-- Para convidar alguém (troque o e-mail):
-- insert into public.allowed_emails (email) values ('email.do.convidado@gmail.com');
