-- 012: Notifications Table
-- ============================================

BEGIN;

CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  type                notification_type NOT NULL,
  title               VARCHAR(200) NOT NULL,
  body                TEXT,
  data                JSONB,
  is_read             BOOLEAN NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMPTZ,
  firebase_message_id VARCHAR(255),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Foreign Key
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES users (id)
  ON DELETE CASCADE;

-- Indexes
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC)
  WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications (type);
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);

COMMIT;
