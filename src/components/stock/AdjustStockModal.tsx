import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  adjustStock,
} from "../../services/stockService";


type Props = {
  insulinId: number;
  insulinName: string;
  currentStockUnits: string;

  onClose: () => void;
  onSuccess: () => void;
};


export default function AdjustStockModal({
  insulinId,
  insulinName,
  currentStockUnits,
  onClose,
  onSuccess,
}: Props) {

  const [
    actualStock,
    setActualStock,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const currentStock =
    Number(
      currentStockUnits
    );


  






  const difference =
    useMemo(() => {

      if (
        actualStock.trim() === ""
      ) {
        return null;
      }


      const actual =
        Number(
          actualStock
        );


      if (
        Number.isNaN(
          actual
        ) ||
        actual < 0
      ) {
        return null;
      }


      return (
        actual -
        currentStock
      );

    }, [
      actualStock,
      currentStock,
    ]);


  function formatUnits(
    value: number
  ) {

    return value
      .toLocaleString(
        "pt-BR",
        {
          maximumFractionDigits: 2,
        }
      );

  }


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");


    const numericActualStock =
      Number(
        actualStock
      );


    if (
      actualStock.trim() === "" ||
      Number.isNaN(
        numericActualStock
      ) ||
      numericActualStock < 0
    ) {

      setError(
        "Informe o estoque real em unidades."
      );

      return;
    }


    if (
      numericActualStock ===
      currentStock
    ) {

      setError(
        "O estoque informado já é igual ao estoque atual."
      );

      return;
    }


    if (
      notes.trim().length < 3
    ) {

      setError(
        "Informe o motivo do ajuste."
      );

      return;
    }


    setLoading(
      true
    );


    try {

      await adjustStock(
        insulinId,
        numericActualStock,
        notes.trim()
      );


      onSuccess();
      onClose();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível ajustar o estoque."
      );

    } finally {

      setLoading(
        false
      );

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
        className="
          modal-card
          adjust-stock-modal
        "
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >


        

        <div className="modal-header">

          <div>

            <h2>
            <SlidersHorizontal size={20} aria-hidden="true" />
            Ajustar estoque
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


          

          <div className="adjust-current-stock">

            <span>
              Estoque calculado atualmente
            </span>

            <strong>

              {formatUnits(
                currentStock
              )}

              {" "}U

            </strong>

          </div>


          

          <label>

            Estoque real

            <div className="input-unit-wrapper">

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  actualStock
                }
                onChange={
                  (event) =>
                    setActualStock(
                      event.target.value
                    )
                }
                placeholder="Ex.: 1400"
                autoFocus
                required
              />

              <span>
                U
              </span>

            </div>

          </label>


          

          {difference !==
            null && (

            <div
              className={
                difference < 0
                  ? "adjust-preview negative"
                  : "adjust-preview positive"
              }
            >

              <span>
                Ajuste que será registrado
              </span>


              <strong>

                {difference > 0
                  ? "+"
                  : ""}

                {formatUnits(
                  difference
                )}

                {" "}U

              </strong>


              <small>

                {difference < 0
                  ? "O estoque será reduzido."
                  : difference > 0
                    ? "O estoque será aumentado."
                    : "Nenhuma diferença encontrada."}

              </small>

            </div>

          )}


          

          <label>

            Motivo do ajuste

            <textarea
              value={
                notes
              }
              onChange={
                (event) =>
                  setNotes(
                    event.target.value
                  )
              }
              placeholder="Ex.: Contagem física do estoque"
              maxLength={
                500
              }
              rows={
                3
              }
              required
            />

          </label>


          <div className="form-hint">

            Este ajuste não apaga nenhuma
            movimentação anterior. Uma nova
            movimentação de correção será
            registrada no histórico.

          </div>


          

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="primary-button"
              disabled={
                loading ||
                difference === null ||
                difference === 0
              }
            >

              {loading
                ? "Ajustando..."
                : "Confirmar ajuste"}

            </button>

          </div>

        </form>

      </section>

    </div>

  );

}