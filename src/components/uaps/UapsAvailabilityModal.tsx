import {
  useEffect,
  useState,
} from "react";

import {
  MapPin,
  PackageSearch,
} from "lucide-react";

import {
  listUaps,
} from "../../services/uapsService";

import type {
  InsulinType,
} from "../../types/insulin";

import type {
  Uaps,
} from "../../types/uaps";


type Props = {
  insulinName: string;

  insulinType: InsulinType;

  onClose: () => void;
};


function availabilityLabel(
  level:
    Uaps["estoque"][number]["nivel_disponibilidade"]
) {
  switch (level) {
    case "alto":
      return "Alta disponibilidade";

    case "medio":
      return "Disponibilidade média";

    case "baixo":
      return "Baixa disponibilidade";

    case "critico":
      return "Estoque crítico";

    case "indisponivel":
      return "Indisponível";

    default:
      return "Disponibilidade";
  }
}


function formatDate(
  value: string
) {
  const [year, month, day] =
    value.split("-");

  return `${day}/${month}/${year}`;
}


export default function UapsAvailabilityModal({
  insulinName,
  insulinType,
  onClose,
}: Props) {

  const [
    uaps,
    setUaps,
  ] = useState<Uaps[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(
    () => {

      let active = true;


      async function loadAvailability() {

        try {

          setLoading(true);
          setError("");


          const data =
            await listUaps({
              tipo:
                insulinType,

              apenasDisponiveis:
                true,
            });


          if (active) {
            setUaps(
              data
            );
          }

        } catch (err) {

          if (!active) {
            return;
          }


          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível consultar as UAPS."
          );

        } finally {

          if (active) {
            setLoading(false);
          }

        }
      }


      void loadAvailability();


      return () => {
        active = false;
      };

    },
    [
      insulinType,
    ]
  );


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
          uaps-availability-modal
        "
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <h2>
              Encontrar reposição
            </h2>

            <p>
              Disponibilidade fictícia de{" "}
              <strong>
                {insulinName}
              </strong>
              {" "}nas UAPS cadastradas.
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


        <div className="uaps-search-summary">

          <PackageSearch
            size={20}
          />

          <div>

            <span>
              Tipo pesquisado
            </span>

            <strong>
              {insulinType}
            </strong>

          </div>

        </div>


        {loading && (

          <div className="uaps-state">

            <div className="history-spinner" />

            <span>
              Consultando disponibilidade...
            </span>

          </div>

        )}


        {!loading &&
          error && (

          <div className="history-error">

            <strong>
              Não foi possível consultar
              as UAPS
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {!loading &&
          !error &&
          uaps.length === 0 && (

          <div className="uaps-state">

            <PackageSearch
              size={30}
            />

            <strong>
              Nenhuma UAPS disponível
            </strong>

            <span>
              Não encontramos estoque
              fictício para este tipo
              de insulina.
            </span>

          </div>

        )}


        {!loading &&
          !error &&
          uaps.length > 0 && (

          <div className="uaps-list">

            {uaps.map(
              (unit) => {

                const stock =
                  unit.estoque[0];


                if (!stock) {
                  return null;
                }


                return (

                  <article
                    key={
                      unit.id_uaps
                    }
                    className="uaps-card"
                  >

                    <div className="uaps-card-header">

                      <div>

                        <strong>
                          {unit.nome}
                        </strong>

                        <span>

                          <MapPin
                            size={13}
                          />

                          {unit.bairro}

                        </span>

                      </div>


                      <span
                        className={
                          `uaps-availability-badge ${stock.nivel_disponibilidade}`
                        }
                      >

                        {availabilityLabel(
                          stock.nivel_disponibilidade
                        )}

                      </span>

                    </div>


                    <div className="uaps-address">

                      {unit.endereco}

                    </div>


                    <div className="uaps-stock-grid">

                      <div>

                        <span>
                          Quantidade
                        </span>

                        <strong>
                          {
                            stock
                              .quantidade_disponivel
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Apresentação
                        </span>

                        <strong>
                          {
                            stock
                              .apresentacao
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Validade
                        </span>

                        <strong>
                          {formatDate(
                            stock.validade
                          )}
                        </strong>

                      </div>

                    </div>


                    <small className="uaps-mock-notice">

                      Dados simulados para
                      fins acadêmicos.

                    </small>

                  </article>

                );
              }
            )}

          </div>

        )}


        <div className="modal-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>

        </div>

      </section>

    </div>

  );
}