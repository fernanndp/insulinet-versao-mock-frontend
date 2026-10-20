import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import { PackagePlus } from "lucide-react";

import {
  addStock,
} from "../../services/stockService";


type Props = {
  insulinId:
    number;

  insulinName:
    string;

  concentrationUnitsPerMl:
    string;

  containerVolumeMl:
    string;

  onClose:
    () => void;

  onSuccess:
    () => void;
};


export default function AddStockModal({
  insulinId,
  insulinName,
  concentrationUnitsPerMl,
  containerVolumeMl,
  onClose,
  onSuccess,
}: Props) {

  const [
    containers,
    setContainers,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  





  const unitsPerContainer =
    useMemo(
      () => {

        return (
          Number(
            concentrationUnitsPerMl
          ) *
          Number(
            containerVolumeMl
          )
        );

      },
      [
        concentrationUnitsPerMl,
        containerVolumeMl,
      ]
    );


  


  const totalUnits =
    useMemo(
      () => {

        const quantity =
          Number(
            containers
          );


        if (
          Number.isNaN(
            quantity
          ) ||
          quantity <= 0
        ) {
          return 0;
        }


        return (
          quantity *
          unitsPerContainer
        );

      },
      [
        containers,
        unitsPerContainer,
      ]
    );


  async function handleSubmit(
    event:
      FormEvent
  ) {

    event.preventDefault();

    setError("");


    const numericContainers =
      Number(
        containers
      );


    if (
      !Number.isInteger(
        numericContainers
      ) ||
      numericContainers <=
        0
    ) {

      setError(
        "Informe uma quantidade inteira de recipientes maior que zero."
      );

      return;

    }


    setLoading(
      true
    );


    try {

      await addStock(
        insulinId,
        numericContainers
      );


      




      onSuccess();

      onClose();

    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar o estoque."
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
        className="modal-card"
        onMouseDown={
          (
            event
          ) =>
            event.stopPropagation()
        }
      >


        

        <div className="modal-header">

          <div>

            <h2>
            <PackagePlus size={20} aria-hidden="true" />
            Adicionar estoque
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


          

          <div className="stock-product-info">


            <div>

              <span>
                Concentração
              </span>

              <strong>

                {Number(
                  concentrationUnitsPerMl
                ).toLocaleString(
                  "pt-BR"
                )}

                {" "}U/mL

              </strong>

            </div>


            <div>

              <span>
                Volume por recipiente
              </span>

              <strong>

                {Number(
                  containerVolumeMl
                ).toLocaleString(
                  "pt-BR"
                )}

                {" "}mL

              </strong>

            </div>


            <div>

              <span>
                Unidades por recipiente
              </span>

              <strong>

                {unitsPerContainer
                  .toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits:
                        2,
                    }
                  )}

                {" "}U

              </strong>

            </div>

          </div>


          

          <label>

            Quantos recipientes
            deseja adicionar?

            <input
              type="number"
              min="1"
              step="1"
              value={
                containers
              }
              onChange={
                (
                  event
                ) =>
                  setContainers(
                    event
                      .target
                      .value
                  )
              }
              placeholder="Ex.: 5"
              autoFocus
              required
            />

          </label>


          

          {totalUnits >
            0 && (

            <div className="stock-preview">

              <span>
                Será adicionado ao
                estoque
              </span>


              <strong>

                +

                {totalUnits
                  .toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits:
                        2,
                    }
                  )}

                {" "}U

              </strong>


              <small>

                {containers}

                {" "}

                recipiente
                {Number(
                  containers
                ) !==
                1
                  ? "s"
                  : ""}

                {" × "}

                {unitsPerContainer
                  .toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits:
                        2,
                    }
                  )}

                {" "}U

              </small>

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
                loading
              }
            >

              {loading
                ? "Adicionando..."
                : "Adicionar estoque"}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}