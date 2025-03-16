-- Add category column to investments table
ALTER TABLE investments
ADD COLUMN category TEXT NOT NULL DEFAULT 'Other';

-- Create an enum type for investment categories
CREATE TYPE investment_category AS ENUM (
  'Stocks',
  'Cryptocurrency',
  'ETFs',
  'Mutual Funds',
  'Bonds',
  'Commodities',
  'Real Estate',
  'Forex',
  'Indices',
  'Other'
);

-- Add check constraint to ensure valid categories
ALTER TABLE investments
ADD CONSTRAINT valid_investment_category 
CHECK (category IN (
  'Stocks',
  'Cryptocurrency',
  'ETFs',
  'Mutual Funds',
  'Bonds',
  'Commodities',
  'Real Estate',
  'Forex',
  'Indices',
  'Other'
));

-- Add index for better query performance on category
CREATE INDEX investments_category_idx ON investments(category); 