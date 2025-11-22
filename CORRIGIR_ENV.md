# 🔧 Corrigir Variáveis de Ambiente

## ⚠️ Verificar se o arquivo .env.local está correto

O arquivo `.env.local` existe, mas vamos garantir que as variáveis estão corretas.

### Passo 1: Verificar/Corrigir o arquivo .env.local

Abra o arquivo `.env.local` na raiz do projeto e verifique se está assim:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cfpewtxgsqcvwjyblpww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcGV3dHhnc3FjdndqeWJscHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Njk1NTgsImV4cCI6MjA3OTI0NTU1OH0.8IkIEQwpYrJt7HCiInujNjuZ4eT28tdjoQDLujxwWAo
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Importante:**
- Não deixe espaços antes ou depois do `=`
- Não use aspas nas variáveis
- A URL deve começar com `https://`
- A chave anon deve ser a completa (muito longa)

### Passo 2: Reiniciar o Servidor

Após verificar/corrigir o arquivo:

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Inicie novamente:**
   ```bash
   npm run dev
   ```

### Passo 3: Testar

1. Acesse `http://localhost:3001/dashboard`
2. Deve funcionar agora!

---

## 🔍 Verificar se as Variáveis Estão Sendo Lidas

No console do navegador (F12), execute:

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada');
```

**Nota:** Variáveis `NEXT_PUBLIC_*` só são visíveis no cliente após rebuild. Se você mudou o `.env.local`, precisa reiniciar o servidor.

---

## ❓ Ainda não funciona?

1. Verifique se não há espaços extras no `.env.local`
2. Verifique se a URL está correta (sem barra no final)
3. Verifique se a chave está completa (deve ser muito longa)
4. Reinicie o servidor após fazer alterações

