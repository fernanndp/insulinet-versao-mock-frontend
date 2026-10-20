import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Clock3,
  History,
  PackagePlus,
  SlidersHorizontal,
  Syringe,
  Trash2,
} from "lucide-react";

import EditDoseModal from "./EditDoseModal";
import EditStockEntryModal from "../stock/EditStockEntryModal";

import {
  deleteDose,
  getHistory,
} from "../../services/doseService";

import type {
  Movement,
  MovementType,
} from "../../types/movement";

type Props = {
  insulinId: number;
  insulinName: string;
  concentrationUnitsPerMl: number;
  containerVolumeMl: number;
  onClose: () => void;
  onChanged: () => void;
};

const FORTALEZA_TIMEZONE =
  "America/Fortaleza";

function formatFortalezaDate(
  isoDate: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone:
        FORTALEZA_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(
      new Date(isoDate)
    )
    .replace(".", "")
    .toUpperCase();
}

function formatFortalezaTime(
  isoDate: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone:
        FORTALEZA_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(
    new Date(isoDate)
  );
}

function formatUnits(
  value: string
) {
  return Math.abs(
    Number(value)
  ).toLocaleString(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    }
  );
}

function getMovementLabel(
  movementType: MovementType
) {
  switch (movementType) {
    case "DOSE":
      return "Aplicação";

    case "STOCK_IN":
      return "Entrada de estoque";

    case "ADJUSTMENT":
      return "Ajuste de estoque";

    case "DISCARD":
      return "Descarte";

    default:
      return "Movimentação";
  }
}

function getMovementClass(
  movement: Movement
) {
  if (
    movement.movement_type ===
    "DOSE"
  ) {
    return "movement-dose";
  }

  if (
    movement.movement_type ===
    "STOCK_IN"
  ) {
    return "movement-positive";
  }

  if (
    movement.movement_type ===
    "DISCARD"
  ) {
    return "movement-negative";
  }

  if (
    movement.movement_type ===
    "ADJUSTMENT"
  ) {
    return (
      Number(
        movement.quantity_units
      ) >= 0
        ? "movement-positive"
        : "movement-negative"
    );
  }

  return "";
}

function getMovementSign(
  movement: Movement
) {
  const quantity =
    Number(
      movement.quantity_units
    );

  if (quantity > 0) {
    return "+";
  }

  if (quantity < 0) {
    return "−";
  }

  return "";
}

function MovementIcon({
  type,
}: {
  type: MovementType;
}) {
  switch (type) {
    case "DOSE":
      return <Syringe size={14} aria-hidden="true" />;

    case "STOCK_IN":
      return <PackagePlus size={14} aria-hidden="true" />;

    case "ADJUSTMENT":
      return <SlidersHorizontal size={14} aria-hidden="true" />;

    case "DISCARD":
      return <Trash2 size={14} aria-hidden="true" />;

    default:
      return null;
  }
}

export default function DoseHistoryModal({
  insulinId,
  insulinName,
  concentrationUnitsPerMl,
  containerVolumeMl,
  onClose,
  onChanged,
}: Props) {
  const [
    movements,
    setMovements,
  ] =
    useState<Movement[]>([]);

  const [
    editDose,
    setEditDose,
  ] =
    useState<Movement | null>(
      null
    );

  const [
    editStockEntry,
    setEditStockEntry,
  ] =
    useState<Movement | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    deletingDoseId,
    setDeletingDoseId,
  ] =
    useState<number | null>(
      null
    );

  const loadHistory =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const history:
            Movement[] =
            await getHistory(
              insulinId
            );

          const ordered =
            [...history]
              .sort(
                (
                  a,
                  b
                ) =>
                  new Date(
                    b.occurred_at
                  ).getTime()
                  -
                  new Date(
                    a.occurred_at
                  ).getTime()
              );

          setMovements(
            ordered
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o histórico."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        insulinId,
      ]
    );

  useEffect(
    () => {
      void loadHistory();
    },
    [
      loadHistory,
    ]
  );

  async function handleDeleteDose(
    movement: Movement
  ) {
    const confirmed =
      window.confirm(
        `Deseja realmente excluir esta aplicação de ${formatUnits(
          movement.quantity_units
        )} U?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDoseId(
        movement.id
      );

      setError("");

      await deleteDose(
        insulinId,
        movement.id
      );

      await loadHistory();

      onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir a aplicação."
      );
    } finally {
      setDeletingDoseId(
        null
      );
    }
  }

  const doseCount =
    movements.filter(
      (movement) =>
        movement.movement_type ===
        "DOSE"
    ).length;

  const stockInCount =
    movements.filter(
      (movement) =>
        movement.movement_type ===
        "STOCK_IN"
    ).length;

  const adjustmentCount =
    movements.filter(
      (movement) =>
        movement.movement_type ===
        "ADJUSTMENT"
    ).length;

  return (
    <>
      <div
        className="modal-backdrop"
        onMouseDown={
          onClose
        }
      >
        <section
          className="
            modal-card
            history-modal
          "
          onMouseDown={
            (event) =>
              event.stopPropagation()
          }
        >
          <div className="history-header">
            <div>
              <h2>
                <History size={20} aria-hidden="true" />
                Histórico
              </h2>

              <p>
                {insulinName}
              </p>
            </div>

            <button
              type="button"
              className="history-close-button"
              onClick={
                onClose
              }
              aria-label="Fechar histórico"
            >
              ×
            </button>
          </div>

          {!loading &&
            !error &&
            movements.length > 0 && (
            <div className="movement-history-summary">
              <div>
                <span>
                  Movimentações
                </span>

                <strong>
                  {movements.length}
                </strong>
              </div>

              <div>
                <span>
                  Aplicações
                </span>

                <strong>
                  {doseCount}
                </strong>
              </div>

              <div>
                <span>
                  Entradas
                </span>

                <strong>
                  {stockInCount}
                </strong>
              </div>

              <div>
                <span>
                  Ajustes
                </span>

                <strong>
                  {adjustmentCount}
                </strong>
              </div>
            </div>
          )}

          <div className="history-content">
            {loading ? (
              <div className="history-state">
                <div className="history-spinner" />

                <span>
                  Carregando histórico...
                </span>
              </div>
            ) : error ? (
              <div className="history-error">
                <strong>
                  Não foi possível
                  carregar o histórico
                </strong>

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    void loadHistory()
                  }
                >
                  Tentar novamente
                </button>
              </div>
            ) : movements.length ===
              0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <History size={20} aria-hidden="true" />
                </div>

                <strong>
                  Nenhuma movimentação registrada
                </strong>

                <span>
                  Aplicações, entradas e ajustes
                  aparecerão aqui.
                </span>
              </div>
            ) : (
              <div className="movement-history-list">
                {movements.map(
                  (
                    movement
                  ) => {
                    const movementClass =
                      getMovementClass(
                        movement
                      );

                    const isDeleting =
                      deletingDoseId ===
                      movement.id;

                    return (
                      <article
                        key={
                          movement.id
                        }
                        className="movement-history-item"
                      >
                        <div className="movement-history-top">
                          <div className="movement-history-title">
                            <span
                              className={
                                `movement-type-badge ${movementClass}`
                              }
                            >
                              <MovementIcon
                                type={movement.movement_type}
                              />

                              {getMovementLabel(
                                movement
                                  .movement_type
                              )}
                            </span>

                            <span className="movement-date">
                              {formatFortalezaDate(
                                movement
                                  .occurred_at
                              )}
                            </span>
                          </div>

                          <div
                            className={
                              `movement-amount ${movementClass}`
                            }
                          >
                            <strong>
                              {getMovementSign(
                                movement
                              )}

                              {formatUnits(
                                movement
                                  .quantity_units
                              )}
                            </strong>

                            <span>
                              U
                            </span>
                          </div>
                        </div>

                        <div className="movement-history-meta">
                          <Clock3 size={14} aria-hidden="true" />

                          <span>
                            {movement
                              .occurred_time_known
                              ? formatFortalezaTime(
                                  movement
                                    .occurred_at
                                )
                              : "Horário não informado"}
                          </span>
                        </div>

                        {movement.notes && (
                          <div className="movement-note">
                            <span>
                              Observação
                            </span>

                            <p>
                              {movement.notes}
                            </p>
                          </div>
                        )}

                        {movement
                          .movement_type ===
                          "DOSE" && (
                          <div className="movement-actions">
                            <button
                              type="button"
                              className="history-edit-button"
                              onClick={() =>
                                setEditDose(
                                  movement
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              Editar aplicação
                            </button>

                            <button
                              type="button"
                              className="history-delete-button"
                              onClick={() =>
                                void handleDeleteDose(
                                  movement
                                )
                              }
                              disabled={
                                isDeleting
                              }
                            >
                              {isDeleting
                                ? "Excluindo..."
                                : "Excluir aplicação"}
                            </button>
                          </div>
                        )}

                        {movement
                          .movement_type ===
                          "STOCK_IN" && (
                          <div className="movement-actions">
                            <button
                              type="button"
                              className="history-edit-button"
                              onClick={() =>
                                setEditStockEntry(
                                  movement
                                )
                              }
                            >
                              Editar entrada
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="history-footer">
            <button
              type="button"
              className="
                secondary-button
                history-close-footer
              "
              onClick={
                onClose
              }
            >
              Fechar
            </button>
          </div>
        </section>
      </div>

      {editDose && (
        <EditDoseModal
          insulinId={
            insulinId
          }
          insulinName={
            insulinName
          }
          dose={
            editDose
          }
          onClose={() =>
            setEditDose(
              null
            )
          }
          onSuccess={() => {
            void loadHistory();

            onChanged();
          }}
        />
      )}

      {editStockEntry && (
        <EditStockEntryModal
          insulinId={
            insulinId
          }
          insulinName={
            insulinName
          }
          concentrationUnitsPerMl={
            concentrationUnitsPerMl
          }
          containerVolumeMl={
            containerVolumeMl
          }
          movement={
            editStockEntry
          }
          onClose={() =>
            setEditStockEntry(
              null
            )
          }
          onSuccess={() => {
            void loadHistory();

            onChanged();
          }}
        />
      )}
    </>
  );
}