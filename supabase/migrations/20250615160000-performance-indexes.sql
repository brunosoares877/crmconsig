-- ========================================
-- MIGRAÇÃO ESSENCIAL - TABELAS E PERFORMANCE
-- Data: 2025-06-20
-- Descrição: Cria tabelas essenciais e índices para 1500+ clientes
-- ========================================

-- ==========================================
-- 1. TABELAS ESSENCIAIS
-- ==========================================

-- Tabela LEADS (Principal)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    phone2 TEXT,
    phone3 TEXT,
    email TEXT,
    cpf TEXT,
    rg TEXT,
    birth_date DATE,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    bank TEXT,
    benefit_type TEXT,
    benefit_number TEXT,
    card_number TEXT,
    card_password TEXT,
    income DECIMAL(10,2),
    installment_value DECIMAL(10,2),
    installments INTEGER,
    total_amount DECIMAL(10,2),
    commission_percentage DECIMAL(5,2),
    commission_amount DECIMAL(10,2),
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'qualificado', 'convertido', 'perdido')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela REMINDERS (Lembretes) - CORRIGIDA
CREATE TABLE IF NOT EXISTS reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    bank TEXT,
    priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela APPOINTMENTS (Agendamentos)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. ÍNDICES DE PERFORMANCE ESSENCIAIS
-- ==========================================

-- Índices para LEADS (consultas mais frequentes)
CREATE INDEX IF NOT EXISTS idx_leads_user_id_created_at ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_id_status ON leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_cpf ON leads(cpf);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Índices para REMINDERS (ordenação por prioridade)
CREATE INDEX IF NOT EXISTS idx_reminders_user_id_due_date ON reminders(user_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id_priority ON reminders(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id_completed ON reminders(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_reminders_priority_due_date ON reminders(priority, due_date);

-- Índices para APPOINTMENTS
CREATE INDEX IF NOT EXISTS idx_appointments_user_id_date ON appointments(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_id ON appointments(lead_id);

-- ==========================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ==========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers apenas se as tabelas existirem
DO $$
BEGIN
    -- Trigger para leads
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
        CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para reminders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders') THEN
        DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
        CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para appointments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
        CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ==========================================
-- 4. SEGURANÇA RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para LEADS
DROP POLICY IF EXISTS "Users can manage own leads" ON leads;
CREATE POLICY "Users can manage own leads" ON leads
    FOR ALL USING (auth.uid() = user_id);

-- Políticas básicas para REMINDERS
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
CREATE POLICY "Users can manage own reminders" ON reminders
    FOR ALL USING (auth.uid() = user_id);

-- Políticas básicas para APPOINTMENTS
DROP POLICY IF EXISTS "Users can manage own appointments" ON appointments;
CREATE POLICY "Users can manage own appointments" ON appointments
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 5. VALIDAÇÃO FINAL
-- ==========================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    reminder_columns TEXT;
BEGIN
    -- Contar tabelas criadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('leads', 'reminders', 'appointments');
    
    -- Contar índices criados
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Verificar colunas da tabela reminders
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) INTO reminder_columns
    FROM information_schema.columns 
    WHERE table_name = 'reminders' AND table_schema = 'public';
    
    -- Relatório
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Tabelas criadas: %', table_count;
    RAISE NOTICE '⚡ Índices de performance: %', index_count;
    RAISE NOTICE '🔒 RLS habilitado em todas as tabelas';
    RAISE NOTICE '🔄 Triggers de updated_at configurados';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 REMINDERS - Colunas: %', reminder_columns;
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 SEU CRM ESTÁ PRONTO PARA 1500+ CLIENTES!';
    RAISE NOTICE '========================================';
END $$; 