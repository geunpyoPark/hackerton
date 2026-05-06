alter table reports drop constraint if exists reports_issue_type_check;

alter table reports
  add constraint reports_issue_type_check
  check (issue_type in (
    'elevator_broken',
    'stairs',
    'curb',
    'steep_slope',
    'slope',
    'construction',
    'blocked',
    'other'
  ));
