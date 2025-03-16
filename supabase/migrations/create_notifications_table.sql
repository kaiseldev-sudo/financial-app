-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_read_idx ON notifications(read);

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS notifications AS $$
DECLARE
  notification notifications;
BEGIN
  INSERT INTO notifications (user_id, type, message, data)
  VALUES (p_user_id, p_type, p_message, p_data)
  RETURNING * INTO notification;
  
  RETURN notification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for various events
CREATE OR REPLACE FUNCTION notify_on_transaction() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    'transaction',
    CASE 
      WHEN NEW.type = 'expense' THEN 'New expense: ' || NEW.amount || ' for ' || NEW.description
      ELSE 'New income: ' || NEW.amount || ' from ' || NEW.description
    END,
    jsonb_build_object('transaction_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_notification
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION notify_on_transaction();

-- Add trigger for budget alerts
CREATE OR REPLACE FUNCTION notify_on_budget_threshold() RETURNS TRIGGER AS $$
DECLARE
  budget_limit DECIMAL;
  current_usage DECIMAL;
  threshold_percentage DECIMAL := 0.8; -- 80% threshold
BEGIN
  SELECT amount INTO budget_limit
  FROM budgets
  WHERE id = NEW.budget_id;

  SELECT COALESCE(SUM(amount), 0) INTO current_usage
  FROM transactions
  WHERE budget_id = NEW.budget_id
  AND created_at >= date_trunc('month', CURRENT_DATE);

  IF current_usage >= (budget_limit * threshold_percentage) THEN
    PERFORM create_notification(
      NEW.user_id,
      'budget_alert',
      'You have used ' || ROUND((current_usage / budget_limit * 100)) || '% of your budget for ' || NEW.category,
      jsonb_build_object('budget_id', NEW.budget_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_threshold_notification
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION notify_on_budget_threshold(); 