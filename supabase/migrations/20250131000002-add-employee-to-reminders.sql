-- Adicionar campo employee (funcionário responsável) na tabela reminders
-- O campo armazena o ID do funcionário da tabela employees
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS employee UUID;

-- Criar índice para melhor performance em consultas por funcionário
CREATE INDEX IF NOT EXISTS reminders_employee_idx ON reminders(employee);

-- Comentário explicativo
COMMENT ON COLUMN reminders.employee IS 'ID do funcionário responsável pelo lembrete (referência à tabela employees)';

