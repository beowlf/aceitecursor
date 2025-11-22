// Script para verificar variáveis de ambiente
// Execute: node verificar_env.js

require('dotenv').config({ path: '.env.local' });

console.log('=== Verificação de Variáveis de Ambiente ===\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Configurada' : '✗ NÃO CONFIGURADA');
if (supabaseUrl) {
  console.log('  Valor:', supabaseUrl.substring(0, 30) + '...');
}

console.log('\nNEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Configurada' : '✗ NÃO CONFIGURADA');
if (supabaseKey) {
  console.log('  Valor:', supabaseKey.substring(0, 30) + '...');
  console.log('  Tamanho:', supabaseKey.length, 'caracteres');
}

console.log('\n=== Verificação ===');
if (supabaseUrl && supabaseKey) {
  console.log('✅ Todas as variáveis estão configuradas!');
} else {
  console.log('❌ Faltam variáveis de ambiente!');
  console.log('\nCrie o arquivo .env.local na raiz do projeto com:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://cfpewtxgsqcvwjyblpww.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcGV3dHhnc3FjdndqeWJscHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Njk1NTgsImV4cCI6MjA3OTI0NTU1OH0.8IkIEQwpYrJt7HCiInujNjuZ4eT28tdjoQDLujxwWAo');
}

