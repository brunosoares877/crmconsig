-- Adiciona a coluna bank na tabela reminders
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS bank text;

-- Atualiza os registros existentes para usar o banco do lead associado
UPDATE reminders r
SET bank = l.bank
FROM leads l
WHERE r.lead_id = l.id AND r.bank IS NULL; 