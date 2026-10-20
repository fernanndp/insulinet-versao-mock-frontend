import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, User } from "lucide-react";

import IconInput from "../components/ui/IconInput";

import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a conta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Criar conta</h1>

        <p className="subtitle">
          Cadastre-se para manter seu histórico salvo.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Nome
            <IconInput
              icon={User}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </label>

          <label>
            E-mail
            <IconInput
              icon={Mail}
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
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
              minLength={8}
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
            {loading
              ? "Criando..."
              : "Criar conta"}
          </button>
        </form>

        <div className="auth-footer">
          Já possui conta?{" "}
          <Link to="/login">Entrar</Link>
        </div>
      </section>
    </main>
  );
}