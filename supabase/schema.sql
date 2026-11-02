-- Agenda Virtual de la UTN (FRH) — esquema de base de datos para Supabase.
-- Pegalo entero en Supabase > SQL Editor > New query > Run. Se puede correr más de una vez.

-- ───────────────────────── Perfiles ─────────────────────────
create table if not exists public.perfiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  nombre         text check (char_length(nombre) <= 80),
  carrera_id     text,
  -- Privado por defecto. Si es true, cualquiera con el enlace ve el progreso y las notas.
  perfil_publico boolean not null default false,
  -- Reservado para competencias entre grupos (opt-in explícito, separado del perfil público).
  participa_competencias boolean not null default false,
  creado         timestamptz not null default now(),
  actualizado    timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse.
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_registrarse on auth.users;
create trigger al_registrarse after insert on auth.users
  for each row execute function public.crear_perfil();

-- ─────────────────── Estado de cada materia ───────────────────
create table if not exists public.materias_estado (
  user_id     uuid not null references auth.users (id) on delete cascade,
  carrera_id  text not null,
  materia_n   smallint not null,
  estado      text not null check (estado in ('regularizada', 'aprobada')),
  nota        smallint check (nota between 1 and 10),
  actualizado timestamptz not null default now(),
  primary key (user_id, carrera_id, materia_n),
  constraint nota_solo_aprobada check (nota is null or estado = 'aprobada')
);

-- ───────────────────────── Electivas ─────────────────────────
create table if not exists public.electivas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  carrera_id  text not null,
  nombre      text not null check (char_length(nombre) between 1 and 120),
  horas       smallint not null check (horas between 1 and 500),
  estado      text not null check (estado in ('cursando', 'regularizada', 'aprobada')),
  nota        smallint check (nota between 1 and 10),
  creado      timestamptz not null default now(),
  constraint nota_solo_aprobada check (nota is null or estado = 'aprobada')
);
create index if not exists electivas_user on public.electivas (user_id, carrera_id);

-- ─────────────────── Seguridad (RLS) ───────────────────
alter table public.perfiles        enable row level security;
alter table public.materias_estado enable row level security;
alter table public.electivas       enable row level security;

-- Perfiles: cada uno ve y edita el suyo; los públicos los puede ver cualquiera.
drop policy if exists "perfil: leer" on public.perfiles;
create policy "perfil: leer" on public.perfiles for select
  using (id = auth.uid() or perfil_publico);
drop policy if exists "perfil: editar el propio" on public.perfiles;
create policy "perfil: editar el propio" on public.perfiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "perfil: crear el propio" on public.perfiles;
create policy "perfil: crear el propio" on public.perfiles for insert
  with check (id = auth.uid());

-- Materias y electivas: el dueño hace todo; si el perfil es público, los demás solo pueden leer.
drop policy if exists "materias: dueño" on public.materias_estado;
create policy "materias: dueño" on public.materias_estado for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "materias: perfil público" on public.materias_estado;
create policy "materias: perfil público" on public.materias_estado for select
  using (exists (select 1 from public.perfiles p where p.id = user_id and p.perfil_publico));

drop policy if exists "electivas: dueño" on public.electivas;
create policy "electivas: dueño" on public.electivas for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "electivas: perfil público" on public.electivas;
create policy "electivas: perfil público" on public.electivas for select
  using (exists (select 1 from public.perfiles p where p.id = user_id and p.perfil_publico));

-- ─────────────── A futuro: competencias entre grupos (NO crear todavía) ───────────────
-- grupos          (id, nombre, creado_por, codigo_invitacion, creado)
-- grupo_miembros  (grupo_id, user_id, rol, unido) — solo usuarios con participa_competencias = true
-- vista ranking   promedio y aprobadas por grupo, calculada solo sobre miembros con opt-in.
-- Las tablas de arriba ya tienen lo necesario (user_id, carrera_id, nota) para calcularlo.
