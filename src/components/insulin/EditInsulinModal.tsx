import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  updateInsulin,
} from "../../services/insulinService";

import type {
  InsulinType,
} from "../../types/insulin";


type Props = {
  insulinId: number;

  initialName: string;

  initialInsulinType: InsulinType | null;

  initialConcentrationUnitsPerMl: string;

  initialContainerVolumeMl: string;

  initialOpenValidityDays: number;

  initialActive: boolean;

  onClose: () => void;

  onSuccess: () => void;
};


const INSULIN_TYPES: InsulinType[] = [
  "Glargina",
  "Lispro",
  "NPH",
  "Regular",
];


export default function EditInsulinModal({
  insulinId,
  initialName,
  initialInsulinType,
  initialConcentrationUnitsPerMl,
  initialContainerVolumeMl,
  initialOpenValidityDays,
  initialActive,
  onClose,
  onSuccess,
}: Props) {

  const [
    name,
    setName,
  ] = useState(
    initialName
  );

  const [
    insulinType,
    setInsulinType,
  ] = useState<InsulinType | "">(
    initialInsulinType ?? ""
  );

  const [
    concentration,
    setConcentration,
  ] = useState(
    initialConcentrationUnitsPerMl
  );

  const [
    volume,
    setVolume,
  ] = useState(
    initialContainerVolumeMl
  );

  const [
    openValidityDays,
    setOpenValidityDays,
  ] = useState(
    String(initialOpenValidityDays)
  );

  const [
    active,
    setActive,
  ] = useState(
    initialActive
  );

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


  const packagingChanged =
    (
      Number(concentration) !==
        Number(
          initialConcentrationUnitsPerMl
        )
      ||
      Number(volume) !==
        Number(
          initialContainerVolumeMl
        )
    );


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

      await updateInsulin(
        insulinId,
        {
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

          active,
        }
      );


      onSuccess();

      onClose();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a insulina."
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
          edit-insulin-modal
        "
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
              Gerenciar insulina
            </h2>

            <p>
              Altere os dados ou
              desative esta insulina.
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
              value={
                insulinType
              }
              onChange={(event) =>
                setInsulinType(event.target.value as InsulinType)
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


          {!initialInsulinType && (

            <div className="form-hint">

              Esta insulina foi cadastrada antes
              da integração com as UAPS.
              Selecione o tipo para habilitar
              a busca de reposição.

            </div>

          )}


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
              required
            />

          </label>


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

          </div>


          {packagingChanged && (

            <div className="edit-insulin-warning">

              <strong>
                Atenção à alteração
              </strong>

              <span>
                A nova concentração e o novo
                volume serão utilizados nas
                próximas entradas de estoque.
                As movimentações antigas não
                serão recalculadas.
              </span>

            </div>

          )}


          <div className="insulin-status-section">

            <div>

              <strong>
                Status
              </strong>

              <span>

                {active
                  ? "Esta insulina está ativa."
                  : "Esta insulina está desativada."}

              </span>

            </div>


            <button
              type="button"
              className={
                active
                  ? "status-toggle active"
                  : "status-toggle"
              }
              onClick={() =>
                setActive(
                  (current) =>
                    !current
                )
              }
              aria-pressed={
                active
              }
            >

              <span />

            </button>

          </div>


          {!active && (

            <div className="form-hint">

              Desativar não apaga estoque,
              aplicações ou histórico. Você
              poderá ativar novamente depois.

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
                ? "Salvando..."
                : "Salvar alterações"}

            </button>

          </div>

        </form>

      </section>

    </div>

  );
}