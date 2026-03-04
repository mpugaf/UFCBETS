ALTER TABLE dim_events
  ADD COLUMN winner_message  VARCHAR(500) NULL DEFAULT NULL,
  ADD COLUMN winner_user_id  INT          NULL DEFAULT NULL;
