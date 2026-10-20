import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import { Pencil } from "lucide-react";

import {
  updateStockEntry,
} from "../../services/stockService";

import type {
  Movement,
} from "../../types/movement";



type Props = {
  insulinId: number;
  insulinName: string;

  concentrationUnitsPerMl: number;
  containerVolumeMl: number;

  movement: Movement;

  onClose: () => void;
  onSuccess: () => void;
};


export default function EditStockEntryModal({
  insulinId,
  insulinName,
  concentrationUnitsPerMl,
  containerVolumeMl,
  movement,
  onClose,
  onSuccess,
}: Props) {

  const unitsPerContainer =
    concentrationUnitsPerMl *
    containerVolumeMl;


  const [
    units,
    setUnits,
  ] = useState(
    String(Number(movement.quantity_units))
  );


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const newTotal =
    useMemo(() => {

      const quantity =
        Number(units);

      if (
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {
        return null;
      }

      return quantity;

    }, [
      units,
    ]);


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
        "Informe uma quantidade de unidades maior que zero."
      );

      return;
    }


    setLoading(true);


    try {

      await updateStockEntry(
        insulinId,
        movement.id,
        numericUnits
      );


      onSuccess();
      onClose();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível editar a entrada."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >

      <section
        className="modal-card"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>
            <h2>
            <Pencil size={20} aria-hidden="true" />
            Editar entrada de estoque
            </h2>

            <p>
              {insulinName}
            </p>
          </div>


          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        <form onSubmit={handleSubmit}>

          <div className="stock-product-info">

            <div>
              <span>
                Unidades por recipiente
              </span>

              <strong>
                {unitsPerContainer.toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}U
              </strong>
            </div>


            <div>
              <span>
                Entrada atual
              </span>

              <strong>
                {Number(
                  movement.quantity_units
                ).toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}U
              </strong>
            </div>

          </div>


          <label>

            Quantidade correta de unidades
            desta caneta/frasco

            <div className="input-unit-wrapper">

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={units}
                onChange={(event) =>
                  setUnits(
                    event.target.value
                  )
                }
                autoFocus
                required
              />

              <span>
                U
              </span>

            </div>

          </label>


          <div className="form-hint">

            Só é possível editar uma entrada
            enquanto essa caneta/frasco ainda
            não foi aberto.

          </div>


          {newTotal !== null && (

            <div className="stock-preview">

              <span>
                Novo valor da entrada
              </span>

              <strong>
                {newTotal.toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
                {" "}U
              </strong>

            </div>

          )}


          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Salvando..."
                : "Salvar correção"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}