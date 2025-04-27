import { useState } from 'react';
import axios from 'axios';

function SolicitarCodigo() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/password-reset/request/', { email });
      alert('Código enviado al correo');
    } catch (error) {
      alert('Error al enviar código');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Recuperar Contraseña</h2>
      <input
        type="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Enviar Código</button>
    </form>
  );
}

export default SolicitarCodigo;
