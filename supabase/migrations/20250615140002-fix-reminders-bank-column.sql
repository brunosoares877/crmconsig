-- Verifica se a coluna bank existe e a remove se existir (para garantir uma criação limpa)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'bank') THEN
        ALTER TABLE reminders DROP COLUMN bank;
    END IF;
END $$;

-- Adiciona a coluna bank novamente com a configuração correta
ALTER TABLE reminders ADD COLUMN bank text;

-- Atualiza os registros existentes para usar o banco do lead associado
UPDATE reminders r
SET bank = l.bank
FROM leads l
WHERE r.lead_id = l.id AND r.bank IS NULL; 