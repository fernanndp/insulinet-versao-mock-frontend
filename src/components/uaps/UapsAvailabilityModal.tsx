import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapPin,
  Navigation,
  PackageSearch,
  RefreshCw,
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


const INSULIN_TYPES: InsulinType[] = [
  "Regular",
  "NPH",
  "Glargina",
  "Lispro",
];


const EARTH_RADIUS_KM = 6371;


function toRadians(
  degrees: number
) {
  return (degrees * Math.PI) / 180;
}


function distanceKm(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
) {
  const dLat =
    toRadians(toLat - fromLat);

  const dLon =
    toRadians(toLon - fromLon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}


function formatDistance(
  km: number
) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }

  return `${km.toFixed(1)} km`;
}


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
    selectedType,
    setSelectedType,
  ] = useState<InsulinType>(
    insulinType
  );

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

  const [
    coords,
    setCoords,
  ] = useState<{
    lat: number;
    lon: number;
  } | null>(null);


  useEffect(
    () => {

      if (!("geolocation" in navigator)) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {

        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
        }
      );

    },
    []
  );


  const loadAvailability = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");


        const data =
          await listUaps({
            tipo:
              selectedType,

            apenasDisponiveis:
              true,
          });


        setUaps(
          data
        );

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível consultar as UAPS."
        );

      } finally {

        setLoading(false);

      }
    },
    [
      selectedType,
    ]
  );


  useEffect(
    () => {
      void loadAvailability();
    },
    [
      loadAvailability,
    ]
  );


  const sortedUaps = useMemo(
    () => {

      if (!coords) {
        return uaps;
      }

      return [...uaps].sort(
        (a, b) => {

          const distanceA =
            a.latitude && a.longitude
              ? distanceKm(
                  coords.lat,
                  coords.lon,
                  Number(a.latitude),
                  Number(a.longitude)
                )
              : Infinity;

          const distanceB =
            b.latitude && b.longitude
              ? distanceKm(
                  coords.lat,
                  coords.lon,
                  Number(b.latitude),
                  Number(b.longitude)
                )
              : Infinity;

          return distanceA - distanceB;

        }
      );

    },
    [
      uaps,
      coords,
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

            <select
              className="uaps-type-select"
              value={
                selectedType
              }
              onChange={
                (event) =>
                  setSelectedType(
                    event.target.value as InsulinType
                  )
              }
              aria-label="Tipo de insulina pesquisado"
            >

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

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                void loadAvailability()
              }
            >
              <RefreshCw
                size={14}
              />
              Tentar novamente
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          sortedUaps.length === 0 && (

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
          sortedUaps.length > 0 && (

          <div className="uaps-list">

            {sortedUaps.map(
              (unit) => {

                const stock =
                  unit.estoque[0];


                if (!stock) {
                  return null;
                }


                const distance =
                  coords &&
                  unit.latitude &&
                  unit.longitude
                    ? distanceKm(
                        coords.lat,
                        coords.lon,
                        Number(unit.latitude),
                        Number(unit.longitude)
                      )
                    : null;


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

                          {distance !== null && (

                            <span className="uaps-distance">

                              <Navigation
                                size={11}
                              />

                              {formatDistance(
                                distance
                              )}

                            </span>

                          )}

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
