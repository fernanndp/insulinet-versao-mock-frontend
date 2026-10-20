import { useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router";
import { Lock } from "lucide-react";

import IconInput from "../components/ui/IconInput";

import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "O link de recuperação é inválido."
      );
      return;
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(
        token,
        password
      );

      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Nova senha</h1>

        {!token ? (
          <>
            <div className="error-message">
              Link de recuperação inválido.
            </div>

            <Link to="/forgot-password">
              Solicitar novo link
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Nova senha
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

            <label>
              Confirmar nova senha
              <IconInput
                icon={Lock}
                type="password"
                value={confirmation}
                onChange={(event) =>
                  setConfirmation(event.target.value)
                }
                minLength={8}
                required
              />
            </label>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Alterando..."
                : "Alterar senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}