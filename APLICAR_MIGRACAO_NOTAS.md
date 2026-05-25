# 📝 Aplicar Migração da Tabela de Notas

Para que o bloco de notas funcione corretamente, é necessário aplicar a migração SQL no Supabase.

## 🚀 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20250131000001-create-notes-table.sql
   ```
5. Clique em **Run** para executar

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
cd crmconsig
supabase db push
```

## ✅ O que a migração cria:

- **Tabela `notes`** com os campos:
  - `id` (UUID)
  - `user_id` (UUID - referência ao usuário)
  - `title` (TEXT - obrigatório)
  - `content` (TEXT - opcional)
  - `tags` (TEXT - opcional)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **Índices** para melhor performance de busca
- **Row Level Security (RLS)** configurado
- **Políticas de segurança** para garantir que usuários só vejam suas próprias notas
- **Trigger automático** para atualizar `updated_at`

## 🎯 Funcionalidades do Bloco de Notas

Após aplicar a migração, você terá acesso a:

- ✅ Criar notas com título e conteúdo
- ✅ Adicionar tags para organização
- ✅ Buscar notas por título, conteúdo ou tags
- ✅ Editar notas existentes
- ✅ Excluir notas
- ✅ Visualização em cards responsivos
- ✅ Ordenação por data de atualização (mais recentes primeiro)

## 📍 Localização

O bloco de notas está disponível na página de **Lembretes**, na aba **"Notas"**.

---

**Nota:** Se você não aplicar a migração, o bloco de notas ainda aparecerá, mas mostrará uma mensagem de erro ao tentar criar notas. A migração é obrigatória para o funcionamento completo.

