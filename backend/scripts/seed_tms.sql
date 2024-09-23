use `tms`;

-- Assignment 2: TMS
-- hardcoded accounts & groups
-- groups
INSERT
  IGNORE INTO UserGroup(user_group)
VALUES
  ('PL');

INSERT
  IGNORE INTO UserGroup(user_group)
VALUES
  ('PM');

-- 1. PL
INSERT INTO
  accounts (`username`, `password`, `email`)
values
  (
    'pl',
    '$2y$10$YFbPyf81oqEaudWs.Kwnde8a/OvUCsAhOcYAjxS9/aixePvOfATuG',
    "pl@mail.com"
  );

-- 2. PM
INSERT INTO
  accounts (`username`, `password`, `email`)
VALUES
  (
    'pm',
    '$2y$10$4nUsAQv0viuqXuJeI/a/xOcsEibi27AzWDtjgL7g0b7o4q3GXfJe6',
    'pm@mail.com'
  );

INSERT
  IGNORE INTO UserGroup(username, user_group)
VALUES
  ('pl', 'PL'),
  ('pm', 'PM');

-- 3. Create tables
INSERT INTO
  Application (
    App_Acronym,
    App_Description,
    App_Rnumber,
    App_startDate,
    App_endDate
  )
VALUES
  (
    'CRM',
    'Customer Relationship Management System',
    1,
    1718860952,
    1726809765
  ),
  (
    'HRM',
    'Human Resource Management System',
    1,
    1718860952,
    1726809765
  ),
  (
    'FIN',
    'Financial Management system',
    1,
    1718860952,
    1726809765
  );