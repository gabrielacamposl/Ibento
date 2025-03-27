import { useState } from "react";
import { confirmUser } from "../../api";

export default function Confirm() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await confirmUser(token);
    setMessage(response.mensaje);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Confirmar Cuenta</h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input type="text" placeholder="Token" onChange={(e) => setToken(e.target.value)} required />
        <button className="bg-green-500 text-white p-2 rounded">Confirmar</button>
      </form>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}
