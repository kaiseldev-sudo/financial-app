-- Drop triggers first
DROP TRIGGER IF EXISTS budget_threshold_notification ON transactions;
DROP TRIGGER IF EXISTS transaction_notification ON transactions;

-- Drop functions
DROP FUNCTION IF EXISTS notify_on_budget_threshold();
DROP FUNCTION IF EXISTS notify_on_transaction();
DROP FUNCTION IF EXISTS create_notification();

-- Drop indexes
DROP INDEX IF EXISTS notifications_user_id_idx;
DROP INDEX IF EXISTS notifications_created_at_idx;
DROP INDEX IF EXISTS notifications_read_idx;

-- Drop the notifications table
DROP TABLE IF EXISTS notifications; 