import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, Syringe } from "lucide-react";

import IconInput from "../components/ui/IconInput";

import { login } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        email,
        password
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <Syringe size={20} aria-hidden="true" />
          </div>

          <div>
            <h1>Insulinet</h1>
            <p>Controle de estoque e autonomia</p>
          </div>
        </div>

        <h2>Entrar</h2>

        <p className="subtitle">
          Acesse sua conta para acompanhar seu estoque.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            E-mail
            <IconInput
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seu@email.com"
              required
            />
          </label>

          <label>
            Senha
            <IconInput
              icon={Lock}
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </label>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          className="secondary-link"
          to="/forgot-password"
        >
          Esqueci minha senha
        </Link>

        <div className="auth-footer">
          Ainda não tem conta?{" "}
          <Link to="/register">Criar conta</Link>
        </div>
      </section>
    </main>
  );
}