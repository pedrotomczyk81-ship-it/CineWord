// Copie a URL exibida em Firebase Console > Realtime Database > Dados.
// Use somente a URL do banco, sem /sessoes, .json ou credenciais.
export const firebaseConfig = {
  // Para usar o banco remoto, altere para 'firebase' e preencha databaseURL.
  mode: 'local' as 'local' | 'firebase',
  databaseURL: '',
};
