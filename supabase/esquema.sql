-- mateAventuras · esquema de Supabase (plan gratuito).
-- Se pega UNA vez en Supabase → SQL Editor → Run (ver NECESITO_DE_GA.md).
-- Privacidad: solo se guarda apodo, avatar, progreso y puntos. Nada de nombres reales ni fotos.
-- Cada adulta solo ve y cambia los perfiles que creó; en el grupo solo se ve apodo, avatar y estrellas.

create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 30),
  codigo text not null unique check (codigo ~ '^[A-ZÑ]{3,10}-[0-9]{4}$'),
  organizadora_id uuid not null references auth.users(id) on delete cascade,
  max_jugadoras int not null default 30 check (max_jugadoras between 2 and 30),
  cerrado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key,
  guardian_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  apodo text not null check (char_length(apodo) between 3 and 14),
  avatar jsonb,
  grupo_id uuid references public.groups(id) on delete set null,
  unido_en timestamptz,
  creado_en timestamptz not null default now()
);

-- Copia completa del progreso (para seguir jugando en otro dispositivo).
create table if not exists public.player_snapshots (
  player_id uuid primary key references public.players(id) on delete cascade,
  datos jsonb not null,
  actualizado_en timestamptz not null default now()
);

create table if not exists public.weekly_scores (
  group_id uuid not null references public.groups(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  semana date not null, -- lunes de la semana, hora de Argentina
  estrellas int not null default 0 check (estrellas >= 0),
  primary key (group_id, player_id, semana)
);

alter table public.groups enable row level security;
alter table public.players enable row level security;
alter table public.player_snapshots enable row level security;
alter table public.weekly_scores enable row level security;

-- Perfiles: cada adulta maneja los suyos.
drop policy if exists "adulta ve sus perfiles" on public.players;
create policy "adulta ve sus perfiles" on public.players for select using (guardian_id = auth.uid());
drop policy if exists "adulta crea sus perfiles" on public.players;
create policy "adulta crea sus perfiles" on public.players for insert with check (guardian_id = auth.uid());
drop policy if exists "adulta cambia sus perfiles" on public.players;
create policy "adulta cambia sus perfiles" on public.players for update using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());
drop policy if exists "adulta borra sus perfiles" on public.players;
create policy "adulta borra sus perfiles" on public.players for delete using (guardian_id = auth.uid());

drop policy if exists "adulta maneja sus copias" on public.player_snapshots;
create policy "adulta maneja sus copias" on public.player_snapshots for all
  using (exists (select 1 from public.players p where p.id = player_id and p.guardian_id = auth.uid()))
  with check (exists (select 1 from public.players p where p.id = player_id and p.guardian_id = auth.uid()));

-- Grupos: la organizadora ve los suyos (las demás usan las funciones de abajo).
drop policy if exists "organizadora ve sus grupos" on public.groups;
create policy "organizadora ve sus grupos" on public.groups for select using (organizadora_id = auth.uid());

-- Puntajes: solo lectura de los propios; se escriben con sumar_estrellas().
drop policy if exists "adulta ve sus puntajes" on public.weekly_scores;
create policy "adulta ve sus puntajes" on public.weekly_scores for select
  using (exists (select 1 from public.players p where p.id = player_id and p.guardian_id = auth.uid()));

-- ---------- Funciones ----------
create or replace function public.crear_grupo(p_nombre text) returns text
language plpgsql security definer set search_path = public as $$
declare
  palabras text[] := array['LUNA','SOL','NUBE','ESTRELLA','MAR','BOSQUE','ISLA','FLOR','COMETA','ARCOIRIS','PLANETA','PIRATA'];
  c text;
begin
  if auth.uid() is null then raise exception 'Necesitás iniciar sesión'; end if;
  loop
    c := palabras[1 + floor(random() * array_length(palabras, 1))::int] || '-' || lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from groups where codigo = c);
  end loop;
  insert into groups (nombre, codigo, organizadora_id) values (trim(p_nombre), c, auth.uid());
  return c;
end $$;

create or replace function public.unirse_grupo(p_player uuid, p_codigo text) returns text
language plpgsql security definer set search_path = public as $$
declare g groups%rowtype; n int;
begin
  if not exists (select 1 from players where id = p_player and guardian_id = auth.uid()) then return 'sin-permiso'; end if;
  select * into g from groups where codigo = upper(trim(p_codigo));
  if not found then return 'no-existe'; end if;
  if g.cerrado then return 'cerrado'; end if;
  if exists (select 1 from players where id = p_player and grupo_id = g.id) then return 'ok'; end if;
  select count(*) into n from players where grupo_id = g.id;
  if n >= g.max_jugadoras then return 'lleno'; end if;
  update players set grupo_id = g.id, unido_en = now() where id = p_player;
  return 'ok';
end $$;

create or replace function public.salir_grupo(p_player uuid) returns void
language sql security definer set search_path = public as $$
  update players set grupo_id = null, unido_en = null where id = p_player and guardian_id = auth.uid();
$$;

-- Guarda las estrellas de la semana (valor total de esa semana, así no se duplica nada).
create or replace function public.sumar_estrellas(p_player uuid, p_semana date, p_estrellas int) returns void
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select grupo_id into gid from players where id = p_player and guardian_id = auth.uid();
  if gid is null then return; end if;
  insert into weekly_scores (group_id, player_id, semana, estrellas) values (gid, p_player, p_semana, greatest(0, p_estrellas))
  on conflict (group_id, player_id, semana) do update set estrellas = greatest(weekly_scores.estrellas, excluded.estrellas);
end $$;

-- Tabla del grupo: solo apodo, avatar y estrellas. Solo para quien tiene una jugadora en ese grupo.
create or replace function public.tabla_grupo(p_player uuid, p_semana date)
returns table (player_id uuid, apodo text, avatar jsonb, semana int, siempre int, es_mia boolean, grupo text, codigo text, jugadoras int)
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select grupo_id into gid from players where id = p_player and guardian_id = auth.uid();
  if gid is null then return; end if;
  return query
    select p.id, p.apodo, p.avatar,
      coalesce((select w.estrellas from weekly_scores w where w.group_id = gid and w.player_id = p.id and w.semana = p_semana), 0)::int,
      coalesce((select sum(w.estrellas) from weekly_scores w where w.group_id = gid and w.player_id = p.id), 0)::int,
      p.guardian_id = auth.uid(),
      g.nombre, g.codigo,
      (select count(*) from players x where x.grupo_id = gid)::int
    from players p join groups g on g.id = gid
    where p.grupo_id = gid;
end $$;

-- La organizadora ve sus grupos con las jugadoras (solo apodos) y puede quitar o cerrar.
create or replace function public.mis_grupos()
returns table (group_id uuid, nombre text, codigo text, cerrado boolean, player_id uuid, apodo text)
language sql security definer set search_path = public as $$
  select g.id, g.nombre, g.codigo, g.cerrado, p.id, p.apodo
  from groups g left join players p on p.grupo_id = g.id
  where g.organizadora_id = auth.uid()
  order by g.creado_en, p.apodo;
$$;

create or replace function public.quitar_jugadora(p_group uuid, p_player uuid) returns void
language sql security definer set search_path = public as $$
  update players set grupo_id = null, unido_en = null
  where id = p_player and grupo_id = p_group and exists (select 1 from groups g where g.id = p_group and g.organizadora_id = auth.uid());
$$;

create or replace function public.cerrar_grupo(p_group uuid, p_cerrado boolean) returns void
language sql security definer set search_path = public as $$
  update groups set cerrado = p_cerrado where id = p_group and organizadora_id = auth.uid();
$$;

-- Para la acción que mantiene despierto el proyecto (no devuelve datos).
create or replace function public.ping() returns text language sql security definer set search_path = public as $$ select 'ok'::text $$;

revoke all on function public.crear_grupo(text), public.unirse_grupo(uuid, text), public.salir_grupo(uuid), public.sumar_estrellas(uuid, date, int),
  public.tabla_grupo(uuid, date), public.mis_grupos(), public.quitar_jugadora(uuid, uuid), public.cerrar_grupo(uuid, boolean) from anon;
grant execute on function public.crear_grupo(text), public.unirse_grupo(uuid, text), public.salir_grupo(uuid), public.sumar_estrellas(uuid, date, int),
  public.tabla_grupo(uuid, date), public.mis_grupos(), public.quitar_jugadora(uuid, uuid), public.cerrar_grupo(uuid, boolean) to authenticated;
grant execute on function public.ping() to anon, authenticated;

-- ---------- Panel de la creadora ----------
-- Cada dispositivo sube un RESUMEN de cada perfil (apodo, grado escolar y avance; nada más), aunque la
-- familia no haya conectado su cuenta. Solo la creadora (emails de la tabla creadoras) puede leerlos.
-- Borrar un perfil en la app borra también su resumen.
create table if not exists public.resumenes (
  id uuid primary key,
  apodo text not null check (char_length(apodo) between 1 and 14),
  grado text,
  datos jsonb not null check (octet_length(datos::text) < 20000),
  actualizado_en timestamptz not null default now()
);
alter table public.resumenes enable row level security; -- sin políticas: solo se usa con las funciones de abajo

create table if not exists public.creadoras (email text primary key);
alter table public.creadoras enable row level security;
insert into public.creadoras (email) values ('gaagonzaleez@gmail.com') on conflict do nothing;

create or replace function public.guardar_resumen(p_id uuid, p_apodo text, p_grado text, p_datos jsonb) returns void
language sql security definer set search_path = public as $$
  insert into resumenes (id, apodo, grado, datos, actualizado_en) values (p_id, p_apodo, p_grado, p_datos, now())
  on conflict (id) do update set apodo = excluded.apodo, grado = excluded.grado, datos = excluded.datos, actualizado_en = now();
$$;

create or replace function public.borrar_resumen(p_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from resumenes where id = p_id;
$$;

create or replace function public.resumen_creadora()
returns setof public.resumenes
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from creadoras where lower(email) = lower(auth.jwt() ->> 'email')) then
    raise exception 'solo la creadora';
  end if;
  return query select * from resumenes order by actualizado_en desc;
end $$;

revoke all on function public.resumen_creadora() from anon;
grant execute on function public.guardar_resumen(uuid, text, text, jsonb), public.borrar_resumen(uuid) to anon, authenticated;
grant execute on function public.resumen_creadora() to authenticated;
