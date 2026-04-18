-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Worlds ───────────────────────────────────────────────────────────────────
create table worlds (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  description     text not null,
  genre           text not null,
  target_language text not null,
  native_language text not null,
  lore            text not null,
  opening_narrative text not null,
  created_at      timestamptz default now() not null
);

alter table worlds enable row level security;
create policy "Users own their worlds"
  on worlds for all
  using (auth.uid() = user_id);

-- ─── NPCs ─────────────────────────────────────────────────────────────────────
create table npcs (
  id             uuid primary key default uuid_generate_v4(),
  world_id       uuid references worlds(id) on delete cascade not null,
  name           text not null,
  role           text not null,
  personality    text not null,
  avatar_emoji   text not null,
  language_level text not null check (language_level in ('beginner', 'intermediate', 'advanced')),
  created_at     timestamptz default now() not null
);

alter table npcs enable row level security;
create policy "Users can read/write NPCs of their worlds"
  on npcs for all
  using (exists (select 1 from worlds w where w.id = npcs.world_id and w.user_id = auth.uid()));

-- ─── Quests ───────────────────────────────────────────────────────────────────
create table quests (
  id               uuid primary key default uuid_generate_v4(),
  world_id         uuid references worlds(id) on delete cascade not null,
  title            text not null,
  narrative        text not null,
  choices          jsonb not null default '[]',
  vocabulary_focus jsonb not null default '[]',
  grammar_focus    text,
  difficulty       int not null check (difficulty between 1 and 5),
  xp_reward        int not null default 50,
  created_at       timestamptz default now() not null
);

alter table quests enable row level security;
create policy "Users can read/write quests of their worlds"
  on quests for all
  using (exists (select 1 from worlds w where w.id = quests.world_id and w.user_id = auth.uid()));

-- ─── User Progress ────────────────────────────────────────────────────────────
create table user_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  world_id         uuid references worlds(id) on delete cascade not null,
  xp               int not null default 0,
  streak           int not null default 0,
  last_active_date timestamptz not null default now(),
  created_at       timestamptz default now() not null,
  unique (user_id, world_id)
);

alter table user_progress enable row level security;
create policy "Users own their progress"
  on user_progress for all
  using (auth.uid() = user_id);

-- ─── User Quest Progress ──────────────────────────────────────────────────────
create table user_quest_progress (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  quest_id   uuid references quests(id) on delete cascade not null,
  completed  boolean not null default false,
  created_at timestamptz default now() not null,
  unique (user_id, quest_id)
);

alter table user_quest_progress enable row level security;
create policy "Users own their quest progress"
  on user_quest_progress for all
  using (auth.uid() = user_id);

-- ─── Dialogue History ─────────────────────────────────────────────────────────
create table dialogue_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  npc_id      uuid references npcs(id) on delete cascade not null,
  role        text not null check (role in ('user', 'npc')),
  content     text not null,
  translation text,
  corrections jsonb,
  created_at  timestamptz default now() not null
);

alter table dialogue_history enable row level security;
create policy "Users own their dialogue history"
  on dialogue_history for all
  using (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index on worlds (user_id);
create index on quests (world_id);
create index on npcs (world_id);
create index on dialogue_history (user_id, npc_id);
create index on user_progress (user_id, world_id);
