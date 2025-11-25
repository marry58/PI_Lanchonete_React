import React, { useState } from "react";
import { motion } from "framer-motion";

// Tela de Cadastro em React + Tailwind (single-file)
// Basta salvar como Register.jsx ou Cadastro.jsx

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function validate() {
    const e = {};

    if (!name) e.name = "Nome é obrigatório.";

    if (!email) e.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";

    if (!password) e.password = "Senha é obrigatória.";
    else if (password.length < 6) e.password = "A senha precisa ter pelo menos 6 caracteres.";

    if (!confirmPassword) e.confirmPassword = "Confirme sua senha.";
    else if (password !== confirmPassword) e.confirmPassword = "As senhas não coincidem.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    // Aqui você enviaria para o backend (fetch/axios)
    setMessage("Conta criada com sucesso! 🎉");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <header className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Criar uma conta</h1>
          <p className="text-sm text-gray-500 mt-1">Preencha os dados abaixo</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-300 ${
                errors.name ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Seu nome"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-300 ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="seu@exemplo.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-300 ${
                errors.password ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Crie uma senha"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-300 ${
                errors.confirmPassword ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Digite novamente"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold rounded-lg py-2 shadow hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-700"
          >
            {message}
          </motion.div>
        )}

        <footer className="mt-6 text-center text-sm text-gray-600">
          Já possui conta? <a href="#" className="text-indigo-600 hover:underline">Entrar</a>
        </footer>
      </motion.div>
    </div>
  );
}