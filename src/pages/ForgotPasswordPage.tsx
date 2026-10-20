import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { Mail } from "lucide-react";

import IconInput from "../components/ui/IconInput";

import { requestPasswordReset } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const data =
        await requestPasswordReset(
          email
        );

      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar recuperação."
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Recuperar senha</h1>

        <p className="subtitle">
          Informe seu e-mail para receber o link de
          recuperação.
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
              required
            />
          </label>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button className="primary-button">
            Enviar link
          </button>
        </form>

        <Link
          className="secondary-link"
          to="/login"
        >
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}