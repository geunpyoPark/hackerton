alter table reports drop constraint if exists reports_issue_type_check;

alter table reports
  add constraint reports_issue_type_check
  check (issue_type in (
    'elevator_broken',
    'escalator_broken',
    'lift_broken',
    'stairs',
    'curb',
    'steep_slope',
    'slope',
    'tactile_block',
    'signage',
    'accessible_toilet',
    'transfer_passage',
    'platform_gap',
    'construction',
    'blocked',
    'other'
  ));
