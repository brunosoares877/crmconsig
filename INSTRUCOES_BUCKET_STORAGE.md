# 📦 Configuração do Bucket de Storage - Máquina de Leads

## Passo a Passo para Configurar no Supabase

### 1️⃣ CRIAR O BUCKET

1. Acesse seu projeto no **Supabase Dashboard**
2. No menu lateral, clique em **Storage**
3. Clique no botão **New bucket** ou **Create a new bucket**
4. Configure o bucket:
   - **Name**: `courses`
   - **Public bucket**: ✅ **MARQUE COMO PÚBLICO** (necessário para download do PDF)
   - **File size limit**: Deixe padrão ou aumente se o PDF for muito grande
   - **Allowed MIME types**: Deixe vazio ou adicione `application/pdf`
5. Clique em **Create bucket**

### 2️⃣ CRIAR PASTA E FAZER UPLOAD DO PDF

1. Dentro do bucket `courses`, clique em **Create folder**
2. Nome da pasta: `maquina-de-leads`
3. Entre na pasta `maquina-de-leads`
4. Clique em **Upload file** ou **Upload**
5. Selecione o arquivo PDF do curso
6. **IMPORTANTE**: O arquivo deve se chamar `curso.pdf`
7. Após o upload, o caminho completo será: `courses/maquina-de-leads/curso.pdf`

### 3️⃣ CONFIGURAR PERMISSÕES DO STORAGE

No **SQL Editor** do Supabase, execute este SQL:

```sql
-- Permitir leitura pública do bucket courses
CREATE POLICY "Public can read courses"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

-- Permitir que usuários autenticados possam fazer upload (opcional)
CREATE POLICY "Authenticated users can upload courses"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'courses' 
    AND auth.role() = 'authenticated'
  );
```

### 4️⃣ VERIFICAR SE FUNCIONOU

1. Após fazer upload do PDF, clique com botão direito no arquivo
2. Selecione **Copy URL** ou veja a URL pública
3. A URL deve ser algo como: `https://[seu-projeto].supabase.co/storage/v1/object/public/courses/maquina-de-leads/curso.pdf`
4. Teste abrindo essa URL no navegador - o PDF deve abrir

---

## ✅ Checklist

- [ ] Bucket `courses` criado e marcado como público
- [ ] Pasta `maquina-de-leads` criada dentro do bucket
- [ ] PDF do curso enviado com o nome `curso.pdf`
- [ ] Permissões SQL de storage executadas
- [ ] URL do PDF testada e funcionando

---

## 🎯 Estrutura Final Esperada

```
Storage
└── courses (bucket público)
    └── maquina-de-leads (pasta)
        └── curso.pdf (arquivo)
```

