use tms;

INSERT INTO
  `accounts` (`username`, `password`, `email`)
VALUES
  ('admin', 'admin', 'admin@admin.com');

INSERT INTO
  UserGroup (user_group)
VALUES
  ('ADMIN');

INSERT INTO
  UserGroup (username, user_group)
VALUES
  ('admin', 'ADMIN');