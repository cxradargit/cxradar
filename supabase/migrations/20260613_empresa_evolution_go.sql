alter table empresas
  add column if not exists "evolutionGoInstanceId"    text,
  add column if not exists "evolutionGoInstanceToken" text,
  add column if not exists "evolutionGoConnected"     boolean not null default false;
