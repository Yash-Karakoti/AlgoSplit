-- Create payments table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ALGO',
  participants INTEGER NOT NULL,
  receiver_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  collected NUMERIC DEFAULT 0,
  contributors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  tx_hash TEXT,
  CONSTRAINT status_check CHECK (status IN ('active', 'completed'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read payments
CREATE POLICY "Anyone can read payments" ON payments
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert payments
CREATE POLICY "Anyone can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to update payments
CREATE POLICY "Anyone can update payments" ON payments
  FOR UPDATE USING (true);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

