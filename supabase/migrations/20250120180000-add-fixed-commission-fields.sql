-- Add fixed commission fields to commission_rates table
ALTER TABLE commission_rates 
ADD COLUMN fixed_value DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed'));

-- Add fixed commission fields to commission_tiers table  
ALTER TABLE commission_tiers
ADD COLUMN fixed_value DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed'));

-- Update existing records to have commission_type as 'percentage'
UPDATE commission_rates SET commission_type = 'percentage' WHERE commission_type IS NULL;
UPDATE commission_tiers SET commission_type = 'percentage' WHERE commission_type IS NULL; 