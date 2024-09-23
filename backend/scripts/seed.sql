use tms;

-- Assignment 1: 
INSERT INTO
  `accounts` (`username`, `password`, `email`)
VALUES
  (
    'admin',
    '$2y$10$T0PFK8FBiH7zR3qX4fgvGugdIDzrUgaw1KBUfuh1YLg7Aj/mHqaN6',
    'admin@admin.com'
  );

INSERT INTO
  UserGroup (user_group)
VALUES
  ('ADMIN');

INSERT INTO
  UserGroup (username, user_group)
VALUES
  ('admin', 'ADMIN');