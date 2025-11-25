import React, { useState } from "react";
import { motion } from "framer-motion";

// Tela de Login em React + Tailwind (single-file component)
// Instruções rápidas:
// - Cole este arquivo em um projeto React configurado com Tailwind CSS
// - Ex.: src/components/Login.jsx e importe em App.jsx
// - Não realiza chamadas reais ao backend — substitua handleSubmit para integrar

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function validate() {
    const e = {};
    if (!email) e.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido.";

    if (!password) e.password = "Senha é obrigatória.";
    else if (password.length < 6) e.password = "A senha precisa ter ao menos 6 caracteres.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setLoading(true);
    // Simulação de chamada async — substitua por fetch/axios para seu backend
    await new Promise((r) => setTimeout(r, 900));

    // Exemplo simples de "autenticação" (REMOVER em produção)
    if (email === "usuario@exemplo.com" && password === "123456") {
      setMessage("Login realizado com sucesso 👏");
      // redirecionar, salvar token etc.
    } else {
      setMessage("E-mail ou senha incorretos.");
    }

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
            S
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-500 mt-1">Faça login na sua conta</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E‑mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="seu@exemplo.com"
              autoComplete="username"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full rounded-lg border px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Sua senha"
                autoComplete="current-password"
              />

              <button
                type="button"
                aria-label="Alternar visibilidade da senha"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-gray-600"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Lembrar-me</span>
            </label>

            <a href="#" className="text-sm text-indigo-600 hover:underline">
              Esqueci a senha
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 px-4 py-2 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-500">ou entre com</span>
            <div className="mt-3 flex gap-3 justify-center">
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                {/* Ícone simples */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.98 9.98 0 0 0 7.938 9.744L12 21l2.062.744A9.98 9.98 0 0 0 22 12z" />
                </svg>
                Google
              </button>

              <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12a9 9 0 1 1 18 0" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </form>

        <footer className="mt-6 text-center text-sm text-gray-600">
          <span>Não tem conta? </span>
          <a href="#" className="text-indigo-600 hover:underline font-medium">Criar conta</a>
        </footer>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-700"
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
