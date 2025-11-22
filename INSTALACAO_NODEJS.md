# Guia de Instalação do Node.js no Windows

## Opção 1: Instalação via Site Oficial (Recomendado)

1. **Acesse o site oficial do Node.js:**
   - Vá para: https://nodejs.org/
   - Baixe a versão **LTS (Long Term Support)** - recomendada para a maioria dos usuários

2. **Execute o instalador:**
   - Execute o arquivo `.msi` baixado
   - Clique em "Next" nas telas de instalação
   - **IMPORTANTE:** Marque a opção "Automatically install the necessary tools" se aparecer
   - Complete a instalação

3. **Verifique a instalação:**
   - Abra um **novo** PowerShell ou Prompt de Comando
   - Execute os comandos:
   ```powershell
   node --version
   npm --version
   ```
   - Você deve ver as versões instaladas (ex: v20.11.0 e 10.2.4)

4. **Se ainda não funcionar:**
   - Feche e reabra o terminal
   - Reinicie o computador se necessário

## Opção 2: Instalação via Chocolatey (Para usuários avançados)

Se você tem o Chocolatey instalado:

```powershell
choco install nodejs-lts
```

## Opção 3: Instalação via Winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## Verificação Pós-Instalação

Após instalar, abra um **novo** terminal e execute:

```powershell
node --version
npm --version
```

Se ambos os comandos retornarem versões, a instalação foi bem-sucedida!

## Solução de Problemas

### Problema: "npm não é reconhecido" após instalação

**Solução 1:** Reinicie o terminal
- Feche completamente o PowerShell/CMD
- Abra um novo terminal

**Solução 2:** Verifique o PATH
- Pressione `Win + R`
- Digite `sysdm.cpl` e pressione Enter
- Vá em "Avançado" > "Variáveis de Ambiente"
- Em "Variáveis do sistema", encontre "Path"
- Verifique se contém:
  - `C:\Program Files\nodejs\`
  - Se não tiver, adicione manualmente

**Solução 3:** Reinstale o Node.js
- Desinstale o Node.js pelo Painel de Controle
- Baixe e instale novamente do site oficial
- Reinicie o computador

## Próximos Passos

Após instalar o Node.js com sucesso, volte para o `SETUP.md` e continue com:

```powershell
npm install
```






