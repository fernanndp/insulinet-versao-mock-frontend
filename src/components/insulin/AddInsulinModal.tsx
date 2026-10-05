import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  createInsulin,
} from "../../services/insulinService";

import type {
  InsulinType,
} from "../../types/insulin";


type Props = {
  onClose: () => void;
  onSuccess: () => void;
};


const INSULIN_TYPES: InsulinType[] = [
  "Glargina",
  "Lispro",
  "NPH",
  "Regular",
];


export default function AddInsulinModal({
  onClose,
  onSuccess,
}: Props) {

  const [
    name,
    setName,
  ] = useState("");

  const [
    insulinType,
    setInsulinType,
  ] = useState<InsulinType | "">("");

  const [
    concentration,
    setConcentration,
  ] = useState("");

  const [
    volume,
    setVolume,
  ] = useState("");

  const [
    openValidityDays,
    setOpenValidityDays,
  ] = useState("28");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const unitsPerContainer =
    useMemo(() => {

      const numericConcentration =
        Number(concentration);

      const numericVolume =
        Number(volume);

      if (
        Number.isNaN(
          numericConcentration
        ) ||
        Number.isNaN(
          numericVolume
        ) ||
        numericConcentration <= 0 ||
        numericVolume <= 0
      ) {
        return null;
      }

      return (
        numericConcentration *
        numericVolume
      );

    }, [
      concentration,
      volume,
    ]);


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");

    const cleanName =
      name.trim();

    const numericConcentration =
      Number(concentration);

    const numericVolume =
      Number(volume);

    const numericOpenValidityDays =
      Number(openValidityDays);


    if (!cleanName) {

      setError(
        "Informe o nome da insulina."
      );

      return;
    }


    if (!insulinType) {

      setError(
        "Selecione o tipo da insulina."
      );

      return;
    }


    if (
      Number.isNaN(
        numericConcentration
      ) ||
      numericConcentration <= 0
    ) {

      setError(
        "Informe uma concentração maior que zero."
      );

      return;
    }


    if (
      Number.isNaN(
        numericVolume
      ) ||
      numericVolume <= 0
    ) {

      setError(
        "Informe um volume maior que zero."
      );

      return;
    }


    if (
      !Number.isInteger(
        numericOpenValidityDays
      ) ||
      numericOpenValidityDays < 1 ||
      numericOpenValidityDays > 180
    ) {

      setError(
        "Informe uma validade após aberta entre 1 e 180 dias."
      );

      return;
    }


    setLoading(true);


    try {

      await createInsulin({
        name:
          cleanName,

        insulin_type:
          insulinType,

        concentration_units_per_ml:
          numericConcentration,

        container_volume_ml:
          numericVolume,

        open_validity_days:
          numericOpenValidityDays,
      });


      onSuccess();

      onClose();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a insulina."
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
        className="
          modal-card
          add-insulin-modal
        "
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
              Adicionar insulina
            </h2>

            <p>
              Cadastre os dados do
              recipiente utilizado.
            </p>

          </div>


          <button
            type="button"
            className="modal-close"
            onClick={
              onClose
            }
            aria-label="Fechar"
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

            Nome da insulina

            <input
              type="text"
              value={
                name
              }
              onChange={
                (event) =>
                  setName(
                    event.target.value
                  )
              }
              placeholder="Ex.: Basaglar"
              maxLength={
                100
              }
              autoFocus
              required
            />

          </label>


          <label>

            Tipo da insulina

            <select
                onChange={(event) =>
                  setInsulinType(
                    event.target.value as InsulinType
                  )
                }
            required
            >

              <option value="">
                Selecione o tipo
              </option>

              {INSULIN_TYPES.map(
                (type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>

                )
              )}

            </select>

          </label>


          <div className="form-hint">

            O tipo é utilizado para localizar
            UAPS com disponibilidade compatível
            para reposição.

          </div>


          <div className="insulin-form-grid">

            <label>

              Concentração

              <div className="input-unit-wrapper">

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    concentration
                  }
                  onChange={
                    (event) =>
                      setConcentration(
                        event.target.value
                      )
                  }
                  placeholder="Ex.: 100"
                  required
                />

                <span>
                  U/mL
                </span>

              </div>

            </label>


            <label>

              Volume por recipiente

              <div className="input-unit-wrapper">

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    volume
                  }
                  onChange={
                    (event) =>
                      setVolume(
                        event.target.value
                      )
                  }
                  placeholder="Ex.: 3"
                  required
                />

                <span>
                  mL
                </span>

              </div>

            </label>

          </div>


          <label>

            Validade após aberta (dias)

            <input
              type="number"
              min="1"
              max="180"
              step="1"
              value={
                openValidityDays
              }
              onChange={
                (event) =>
                  setOpenValidityDays(
                    event.target.value
                  )
              }
              placeholder="Ex.: 28"
              required
            />

          </label>


          <div className="form-hint">

            Depois de aberta, a caneta/frasco
            deixa de ser segura para uso após
            esse prazo, mesmo com insulina
            restante. Consulte a bula do
            fabricante.

          </div>


          <div className="insulin-calculation-preview">

            <div>

              <span>
                Unidades por recipiente
              </span>


              <strong>

                {unitsPerContainer !==
                null
                  ? (
                    <>

                      {unitsPerContainer
                        .toLocaleString(
                          "pt-BR",
                          {
                            maximumFractionDigits:
                              2,
                          }
                        )}

                      {" "}U

                    </>
                  )
                  : "—"}

              </strong>

            </div>


            {unitsPerContainer !==
              null && (

              <small>

                {Number(
                  concentration
                ).toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits:
                      2,
                  }
                )}

                {" U/mL × "}

                {Number(
                  volume
                ).toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits:
                      2,
                  }
                )}

                {" mL"}

              </small>

            )}

          </div>


          <div className="form-hint">

            O estoque não será adicionado
            automaticamente. Depois do cadastro,
            utilize o botão

            <strong>
              {" "}Adicionar estoque
            </strong>

            {" "}para informar quantos recipientes
            você possui.

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
                loading
              }
            >

              {loading
                ? "Cadastrando..."
                : "Adicionar insulina"}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}