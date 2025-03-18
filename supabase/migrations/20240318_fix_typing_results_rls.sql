-- Function to safely drop policies
CREATE OR REPLACE FUNCTION safe_drop_policies() RETURNS void AS $$
BEGIN
    -- Drop insert policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'typing_results' 
        AND policyname = 'Users can insert their own results'
    ) THEN
        DROP POLICY "Users can insert their own results" ON typing_results;
    END IF;

    -- Drop select policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'typing_results' 
        AND policyname = 'Users can view their own results'
    ) THEN
        DROP POLICY "Users can view their own results" ON typing_results;
    END IF;

    -- Drop update policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'typing_results' 
        AND policyname = 'Users can update their own results'
    ) THEN
        DROP POLICY "Users can update their own results" ON typing_results;
    END IF;

    -- Drop delete policy if exists
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'typing_results' 
        AND policyname = 'Users can delete their own results'
    ) THEN
        DROP POLICY "Users can delete their own results" ON typing_results;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT safe_drop_policies();

-- Drop the function after use
DROP FUNCTION safe_drop_policies();

-- Enable Row Level Security
ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;

-- Verify and fix any rows with invalid user_ids
DO $$ 
BEGIN
    -- Delete any rows where user_id doesn't exist in auth.users
    DELETE FROM typing_results
    WHERE user_id NOT IN (SELECT id FROM auth.users);
END $$;

-- Create policy for inserting results
CREATE POLICY "Users can insert their own results"
ON typing_results
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for selecting results
CREATE POLICY "Users can view their own results"
ON typing_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for updating results
CREATE POLICY "Users can update their own results"
ON typing_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting results
CREATE POLICY "Users can delete their own results"
ON typing_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'typing_results_user_id_fkey'
    ) THEN
        ALTER TABLE typing_results
        ADD CONSTRAINT typing_results_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_typing_results_user_id ON typing_results(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_results_created_at ON typing_results(created_at DESC); 