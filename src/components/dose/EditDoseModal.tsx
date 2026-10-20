import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Pencil } from "lucide-react";

import {
  updateDose,
} from "../../services/doseService";

import type {
  Movement,
} from "../../types/movement";



type Props = {
  insulinId: number;
  insulinName: string;
  dose: Movement;
  onClose: () => void;
  onSuccess: () => void;
};


function getFortalezaDateTime(
  isoDate: string
) {
  const date = new Date(isoDate);

  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );

  const parts =
    formatter.formatToParts(date);

  const values =
    Object.fromEntries(
      parts.map(
        (part) => [
          part.type,
          part.value,
        ]
      )
    );

  return {
    date:
      `${values.year}-${values.month}-${values.day}`,

    time:
      `${values.hour}:${values.minute}`,
  };
}


export default function EditDoseModal({
  insulinId,
  insulinName,
  dose,
  onClose,
  onSuccess,
}: Props) {

  const initial =
    useMemo(
      () =>
        getFortalezaDateTime(
          dose.occurred_at
        ),
      [dose.occurred_at]
    );


  const [units, setUnits] =
    useState(
      String(
        Math.abs(
          Number(
            dose.quantity_units
          )
        )
      )
    );


  const [date, setDate] =
    useState(
      initial.date
    );


  const [time, setTime] =
    useState(
      dose.occurred_time_known
        ? initial.time
        : ""
    );


  const [notes, setNotes] =
    useState(
      dose.notes ?? ""
    );


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  function getTodayLocal() {
    const now =
      new Date();

    const formatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "America/Fortaleza",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );

    const parts =
      formatter.formatToParts(
        now
      );

    const values =
      Object.fromEntries(
        parts.map(
          (part) => [
            part.type,
            part.value,
          ]
        )
      );

    return (
      `${values.year}-` +
      `${values.month}-` +
      `${values.day}`
    );
  }


  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");


    const numericUnits =
      Number(units);


    if (
      Number.isNaN(
        numericUnits
      ) ||
      numericUnits <= 0
    ) {
      setError(
        "Informe uma dose maior que zero."
      );

      return;
    }


    if (!date) {
      setError(
        "Informe a data da aplicação."
      );

      return;
    }


    if (
      date >
      getTodayLocal()
    ) {
      setError(
        "A aplicação não pode estar no futuro."
      );

      return;
    }


    setLoading(true);


    try {

      await updateDose(
        insulinId,
        dose.id,
        {
          units:
            numericUnits,

          occurred_date:
            date,

          occurred_time:
            time || null,

          notes:
            notes.trim()
              ? notes.trim()
              : null,
        }
      );


      onSuccess();
      onClose();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a aplicação."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div
      className="modal-backdrop"
      onMouseDown={
        onClose
      }
    >

      <section
        className="modal-card"
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
            <Pencil size={20} aria-hidden="true" />
            Editar aplicação
            </h2>

            <p>
              {insulinName}
            </p>

          </div>


          <button
            type="button"
            className="modal-close"
            onClick={
              onClose
            }
          >
            ×
          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>

            Dose aplicada

            <div className="input-unit-wrapper">

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={
                  units
                }
                onChange={
                  (event) =>
                    setUnits(
                      event
                        .target
                        .value
                    )
                }
                required
              />

              <span>
                U
              </span>

            </div>

          </label>


          <div className="date-time-grid">

            <label>

              Data

              <input
                type="date"
                value={
                  date
                }
                max={
                  getTodayLocal()
                }
                onChange={
                  (event) =>
                    setDate(
                      event
                        .target
                        .value
                    )
                }
                required
              />

            </label>


            <label>

              Hora

              <span className="optional-label">
                opcional
              </span>

              <input
                type="time"
                value={
                  time
                }
                onChange={
                  (event) =>
                    setTime(
                      event
                        .target
                        .value
                    )
                }
              />

            </label>

          </div>


          {!time && (
            <div className="form-hint">
              Horário não informado.
              O sistema continuará considerando
              apenas a data da aplicação.
            </div>
          )}


          <label>

            Observação

            <span className="optional-label">
              opcional
            </span>

            <textarea
              value={
                notes
              }
              onChange={
                (event) =>
                  setNotes(
                    event
                      .target
                      .value
                  )
              }
              maxLength={
                500
              }
              rows={
                3
              }
            />

          </label>


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              disabled={
                loading
              }
              onClick={
                onClose
              }
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="primary-button"
              disabled={
                loading
              }
            >
              {loading
                ? "Salvando..."
                : "Salvar alteração"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}