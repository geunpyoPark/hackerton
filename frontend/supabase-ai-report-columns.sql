alter table reports add column if not exists ai_category text;
alter table reports add column if not exists ai_severity text;
alter table reports add column if not exists ai_summary text;
alter table reports add column if not exists responsible_agency text;
alter table reports add column if not exists priority_score integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_ai_severity_check'
  ) then
    alter table reports
      add constraint reports_ai_severity_check
      check (ai_severity in ('high', 'medium', 'low') or ai_severity is null);
  end if;
end $$;
