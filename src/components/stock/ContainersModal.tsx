import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Layers } from "lucide-react";

import {
  discardContainer,
  listContainers,
} from "../../services/containerService";

import type {
  ContainerStatus,
  InsulinContainer,
} from "../../types/container";

type Props = {
  insulinId: number;
  insulinName: string;
  onClose: () => void;
  onChanged: () => void;
};

function formatFortalezaDate(
  isoDate: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone: "America/Fortaleza",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(new Date(isoDate))
    .replace(".", "")
    .toUpperCase();
}

function formatUnits(
  value: string
) {
  return Number(value).toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    }
  );
}

function getStatusLabel(
  status: ContainerStatus
) {
  switch (status) {
    case "SEALED":
      return "Lacrada";
    case "OPEN":
      return "Em uso";
    case "EMPTY":
      return "Vazia";
    case "DISCARDED":
      return "Descartada";
    default:
      return status;
  }
}

function getStatusClass(
  status: ContainerStatus
) {
  switch (status) {
    case "SEALED":
      return "container-status-sealed";
    case "OPEN":
      return "container-status-open";
    case "EMPTY":
      return "container-status-empty";
    case "DISCARDED":
      return "container-status-discarded";
    default:
      return "";
  }
}

function getExpirationLabel(
  container: InsulinContainer
) {
  if (container.expiration_status === "expired") {
    return "Vencida, descarte";
  }

  if (container.expiration_status === "expiring_soon") {
    const days = container.days_until_expiration ?? 0;
    return `Vence em ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  if (container.expiration_status === "ok") {
    const days = container.days_until_expiration ?? 0;
    return `Válida por mais ${days} ${days === 1 ? "dia" : "dias"}`;
  }

  return null;
}

export default function ContainersModal({
  insulinId,
  insulinName,
  onClose,
  onChanged,
}: Props) {
  const [
    containers,
    setContainers,
  ] = useState<InsulinContainer[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    discardingId,
    setDiscardingId,
  ] = useState<number | null>(null);

  const loadContainers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await listContainers(insulinId);

        setContainers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as canetas/frascos."
        );
      } finally {
        setLoading(false);
      }
    },
    [insulinId]
  );

  useEffect(() => {
    void loadContainers();
  }, [loadContainers]);

  async function handleDiscard(
    container: InsulinContainer
  ) {
    const confirmed = window.confirm(
      "Deseja realmente descartar esta caneta/frasco? " +
        "As unidades restantes serão removidas do estoque."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDiscardingId(container.id);
      setError("");

      await discardContainer(
        insulinId,
        container.id
      );

      await loadContainers();
      onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível descartar a caneta/frasco."
      );
    } finally {
      setDiscardingId(null);
    }
  }

  const activeContainers = containers.filter(
    (container) =>
      container.status !== "DISCARDED"
  );

  const discardedContainers = containers.filter(
    (container) =>
      container.status === "DISCARDED"
  );

  function renderContainer(
    container: InsulinContainer,
    index: number
  ) {
    const initial = Number(
      container.initial_units
    );

    const remaining = Number(
      container.remaining_units
    );

    const percent =
      initial > 0
        ? Math.max(
            0,
            Math.min(
              100,
              (remaining / initial) * 100
            )
          )
        : 0;

    const canDiscard =
      container.status === "SEALED" ||
      container.status === "OPEN";

    return (
      <article
        key={container.id}
        className="container-item"
      >
        <div className="container-item-top">
          <div className="container-item-title">
            <strong>
              Caneta/frasco #{index + 1}
            </strong>

            <span
              className={
                `container-status-badge ${getStatusClass(container.status)}`
              }
            >
              {getStatusLabel(container.status)}
            </span>

            {container.expiration_status !== "not_applicable" && (
              <span
                className={
                  `container-expiration-badge container-expiration-${container.expiration_status}`
                }
              >
                {getExpirationLabel(container)}
              </span>
            )}
          </div>

          <div className="container-item-amount">
            <strong>
              {formatUnits(container.remaining_units)}
            </strong>

            <span>
              / {formatUnits(container.initial_units)} U
            </span>
          </div>
        </div>

        <div className="container-progress-track">
          <div
            className={
              `container-progress-fill ${getStatusClass(container.status)}`
            }
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="container-item-meta">
          <span>
            Adicionada em{" "}
            {formatFortalezaDate(container.created_at)}
          </span>

          {container.opened_at && (
            <>
              <span className="movement-meta-separator">
                •
              </span>

              <span>
                Aberta em{" "}
                {formatFortalezaDate(container.opened_at)}
              </span>
            </>
          )}
        </div>

        {canDiscard && (
          <div className="movement-actions">
            <button
              type="button"
              className="history-delete-button"
              onClick={() =>
                void handleDiscard(container)
              }
              disabled={
                discardingId === container.id
              }
            >
              {discardingId === container.id
                ? "Descartando..."
                : "Descartar"}
            </button>
          </div>
        )}
      </article>
    );
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="modal-card history-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="history-header">
          <div>
            <h2>
              <Layers size={20} aria-hidden="true" />
              Estoque individual
            </h2>

            <p>
              {insulinName}
            </p>
          </div>

          <button
            type="button"
            className="history-close-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="history-state">
              <div className="history-spinner" />

              <span>
                Carregando canetas/frascos...
              </span>
            </div>
          ) : error ? (
            <div className="history-error">
              <strong>
                Não foi possível carregar
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  void loadContainers()
                }
              >
                Tentar novamente
              </button>
            </div>
          ) : containers.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">
                <Layers size={20} aria-hidden="true" />
              </div>

              <strong>
                Nenhuma caneta/frasco cadastrado
              </strong>

              <span>
                Adicione estoque para começar a
                acompanhar cada recipiente
                individualmente.
              </span>
            </div>
          ) : (
            <div className="movement-history-list">
              {activeContainers.map(
                renderContainer
              )}

              {discardedContainers.length > 0 && (
                <>
                  <div className="container-discarded-divider">
                    Descartadas
                  </div>

                  {discardedContainers.map(
                    (container) =>
                      renderContainer(
                        container,
                        containers.indexOf(container)
                      )
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="history-footer">
          <button
            type="button"
            className="secondary-button history-close-footer"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
