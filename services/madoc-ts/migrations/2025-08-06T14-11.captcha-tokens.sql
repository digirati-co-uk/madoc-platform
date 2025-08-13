--captcha-tokens (up)
CREATE TABLE IF NOT EXISTS captcha_challenges (
  token TEXT PRIMARY KEY,
  data JSON NOT NULL,
  expires BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS captcha_tokens (
  key TEXT PRIMARY KEY,
  expires BIGINT NOT NULL
);
