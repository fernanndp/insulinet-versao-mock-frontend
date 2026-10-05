import {
  useCallback,
  useEffect,
  useState,
} from "react";


import {
  Activity,
  AlertTriangle,
  Clock3,
  History,
  Layers,
  LogOut,
  PackagePlus,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Syringe,
} from "lucide-react";

import {
  useNavigate,
} from "react-router";

import RegisterDoseModal
  from "../components/dose/RegisterDoseModal";

import DoseHistoryModal
  from "../components/dose/DoseHistoryModal";

import AddStockModal
  from "../components/stock/AddStockModal";

import ContainersModal
  from "../components/stock/ContainersModal";

import AddInsulinModal
  from "../components/insulin/AddInsulinModal";

import AdjustStockModal
  from "../components/stock/AdjustStockModal";

import EditInsulinModal
  from "../components/insulin/EditInsulinModal";

import UapsAvailabilityModal
  from "../components/uaps/UapsAvailabilityModal";

import {
  ApiError,
  clearToken,
} from "../services/api";

import {
  getInsulinSummary,
  listInsulins,
} from "../services/insulinService";

import {
  getCurrentUser,
} from "../services/userService";

import type {
  User,
} from "../types/auth";

import type {
  Insulin,
  InsulinSummary,
  InsulinWithSummary,
} from "../types/insulin";

import {
  formatDays,
  formatEndDate,
  formatUnits,
} from "../utils/formatters";






export default function DashboardPage() {

  const navigate =
    useNavigate();


  
  
  

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );


  const [
    insulins,
    setInsulins,
  ] =
    useState<
      InsulinWithSummary[]
    >([]);


  
  
  

  const [
    doseInsulin,
    setDoseInsulin,
  ] =
    useState<Insulin | null>(
      null
    );


  const [
    historyInsulin,
    setHistoryInsulin,
  ] =
    useState<Insulin | null>(
      null
    );


  const [
    stockInsulin,
    setStockInsulin,
  ] =
    useState<Insulin | null>(
      null
    );


  const [
    containersInsulin,
    setContainersInsulin,
  ] =
    useState<Insulin | null>(
      null
    );


  const [
    adjustStockInsulin,
    setAdjustStockInsulin,
  ] =
    useState<
      InsulinWithSummary | null
    >(
      null
    );


  const [
    editInsulin,
    setEditInsulin,
  ] =
    useState<Insulin | null>(
      null
    );

  const [
    replenishmentInsulin,
    setReplenishmentInsulin,
  ] =
    useState<Insulin | null>(
      null
    );

  const [
    addInsulinOpen,
    setAddInsulinOpen,
  ] =
    useState(
      false
    );


  
  
  

  const [
    showInactive,
    setShowInactive,
  ] =
    useState(
      false
    );


  
  
  

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  
  
  

  const handleApiError =
    useCallback(
      (
        err: unknown,
        fallbackMessage: string
      ) => {

        if (
          err instanceof ApiError &&
          err.status === 401
        ) {

          clearToken();


          navigate(
            "/login",
            {
              replace: true,
            }
          );


          return;
        }


        setError(
          err instanceof Error
            ? err.message
            : fallbackMessage
        );

      },
      [
        navigate,
      ]
    );


  
  
  

  const loadInsulinCards =
    useCallback(
      async () => {

        const insulinData:
          Insulin[] =
          await listInsulins();


        const completeData:
          InsulinWithSummary[] =
          await Promise.all(
            insulinData.map(
              async (
                insulin
              ) => {

                const summary:
                  InsulinSummary =
                  await getInsulinSummary(
                    insulin.id
                  );


                return {
                  insulin,
                  summary,
                };

              }
            )
          );


        setInsulins(
          completeData
        );

      },
      []
    );


  
  
  

  const loadDashboard =
    useCallback(
      async (
        showFullLoading:
          boolean = true
      ) => {

        try {

          if (
            showFullLoading
          ) {

            setLoading(
              true
            );

          }


          setError("");


          const userData:
            User =
            await getCurrentUser();


          setUser(
            userData
          );


          await loadInsulinCards();


        } catch (
          err
        ) {

          handleApiError(
            err,
            "Não foi possível carregar o dashboard."
          );

        } finally {

          if (
            showFullLoading
          ) {

            setLoading(
              false
            );

          }

        }

      },
      [
        handleApiError,
        loadInsulinCards,
      ]
    );


  
  
  

  const refreshInsulinList =
    useCallback(
      async () => {

        try {

          setError("");


          await loadInsulinCards();


        } catch (
          err
        ) {

          handleApiError(
            err,
            "Não foi possível atualizar as insulinas."
          );

        }

      },
      [
        handleApiError,
        loadInsulinCards,
      ]
    );


  
  
  

  const refreshInsulinSummary =
    useCallback(
      async (
        insulinId: number
      ) => {

        try {

          setError("");


          const updatedSummary:
            InsulinSummary =
            await getInsulinSummary(
              insulinId
            );


          setInsulins(
            (
              current
            ) =>
              current.map(
                (
                  item
                ) => {

                  if (
                    item.insulin.id !==
                    insulinId
                  ) {

                    return item;

                  }


                  return {

                    ...item,

                    summary:
                      updatedSummary,

                  };

                }
              )
          );


          




          setAdjustStockInsulin(
            (
              current
            ) => {

              if (
                !current ||
                current.insulin.id !==
                  insulinId
              ) {

                return current;

              }


              return {

                ...current,

                summary:
                  updatedSummary,

              };

            }
          );


        } catch (
          err
        ) {

          handleApiError(
            err,
            "Não foi possível atualizar a insulina."
          );

        }

      },
      [
        handleApiError,
      ]
    );


  
  
  

  useEffect(
    () => {

      void loadDashboard(
        true
      );

    },
    [
      loadDashboard,
    ]
  );


  
  
  

  function logout() {

    clearToken();


    navigate(
      "/login",
      {
        replace: true,
      }
    );

  }


  
  
  

  const activeInsulins =
    insulins.filter(
      (
        item
      ) =>
        item.insulin.active
    );


  const inactiveInsulins =
    insulins.filter(
      (
        item
      ) =>
        !item.insulin.active
    );


  
  
  

  function stockAlertLabel(
    level: InsulinWithSummary["summary"]["stock_alert_level"]
  ) {
    if (level === "critical") {
      return "Estoque crítico";
    }

    if (level === "low") {
      return "Estoque baixo";
    }

    return "Disponível";
  }

  function renderInsulinCard(
    item: InsulinWithSummary
  ) {

    const {
      insulin,
      summary,
    } = item;


    return (

      <article
        key={
          insulin.id
        }
        className={
          insulin.active
            ? "insulin-card insulin-card-v2"
            : "insulin-card insulin-card-v2 insulin-card-inactive"
        }
      >


        
        
        

        <div className="insulin-card-header">

          <div className="insulin-card-title">

            <span className="insulin-label">
              INSULINA
            </span>


            <h3>
              {insulin.name}
            </h3>

          </div>


          <div className="insulin-card-header-actions">


            

            {insulin.active ? (

              <span className="active-badge">

                <span className="status-dot" />

                Ativa

              </span>

            ) : (

              <span className="inactive-badge">

                Inativa

              </span>

            )}


            

            <button
              type="button"
              className="manage-insulin-button"
              onClick={() =>
                setEditInsulin(
                  insulin
                )
              }
            >

              <Settings2
                size={13}
              />

              Gerenciar

            </button>

          </div>

        </div>


        
        
        

        <div
          className={
            `stock-highlight stock-highlight-${summary.stock_alert_level}`
          }
        >

          <div>

            <span className="stock-label">

              Estoque atual

            </span>


            <div className="stock-value">

              <strong>

                {formatUnits(
                  summary
                    .current_stock_units
                )}

              </strong>


              <span>
                U
              </span>

            </div>

          </div>


          {insulin.active && (

            <div
              className={
                `stock-available-badge stock-alert-${summary.stock_alert_level}`
              }
            >

              {stockAlertLabel(
                summary.stock_alert_level
              )}

            </div>

          )}

        </div>


        {insulin.active &&
          summary.container_alert_level !==
            "ok" && (

          <div
            className={
              summary.container_alert_level ===
              "expired"
                ? "container-alert critical"
                : "container-alert warning"
            }
          >

            <AlertTriangle size={15} />

            <span>

              {summary.container_alert_level ===
              "expired"
                ? "Uma caneta/frasco aberto está vencido. Descarte antes de aplicar."
                : `Uma caneta/frasco aberto vence em ${summary.container_alert_days} ${summary.container_alert_days === 1 ? "dia" : "dias"}.`}

            </span>

          </div>

        )}


        
        
        

        <div className="metrics-grid">


          

          <div className="metric">

            <div className="metric-icon">

              <Activity
                size={15}
              />

            </div>


            <div className="metric-content">

              <span>
                Consumo médio
              </span>


              <strong>

                {summary
                  .average_daily_consumption_units
                  !== null
                  ? (

                    <>

                      {formatUnits(
                        summary
                          .average_daily_consumption_units
                      )}

                      {" "}U/dia

                    </>

                  )
                  : "—"}

              </strong>


              {summary
                .history_days_used >
                0 && (

                <small className="metric-source">

                  Baseado em{" "}

                  <strong>

                    {
                      summary
                        .history_days_used
                    }

                  </strong>

                  {" "}

                  {summary
                    .history_days_used ===
                    1
                    ? "dia"
                    : "dias"}

                  {" "}com registros

                </small>

              )}

            </div>

          </div>


          

          <div className="metric">

            <div className="metric-icon">

              <Clock3
                size={15}
              />

            </div>


            <div className="metric-content">

              <span>
                Duração estimada
              </span>


              <strong>

                {summary
                  .estimated_days_remaining
                  !== null
                  ? (

                    <>

                      {formatDays(
                        summary
                          .estimated_days_remaining
                      )}

                      {" "}dias

                    </>

                  )
                  : "—"}

              </strong>

            </div>

          </div>

        </div>


        
        
        

        {summary
          .projection_available
          ? (

            <div className="projection-info">

              <div>

                <span className="projection-label">

                  Previsão de término

                </span>


                <small>

                  Mantendo o consumo médio atual

                </small>

              </div>


              <strong>

                {summary
                  .estimated_end_date
                  ? formatEndDate(
                      summary
                        .estimated_end_date
                    )
                  : "—"}

              </strong>

            </div>

          )
          : (

            <div className="projection-warning">

              {summary
                .history_days_used ===
                0
                ? (

                  <>

                    Registre aplicações para
                    começar a estimar a duração
                    do estoque.

                  </>

                )
                : (

                  <>

                    A projeção ficará disponível
                    após 3 dias completos com
                    registros.

                    {" "}

                    <strong>

                      {
                        summary
                          .history_days_used
                      }
                      /3

                    </strong>

                  </>

                )}

            </div>

          )}


        
        
        

        <div className="insulin-details">


          <div className="insulin-detail-chip">

            <span>
              Concentração
            </span>


            <strong>

              {Number(
                insulin
                  .concentration_units_per_ml
              ).toLocaleString(
                "pt-BR",
                {
                  maximumFractionDigits:
                    2,
                }
              )}

              {" "}U/mL

            </strong>

          </div>


          <div className="insulin-detail-chip">

            <span>
              Recipiente
            </span>


            <strong>

              {Number(
                insulin
                  .container_volume_ml
              ).toLocaleString(
                "pt-BR",
                {
                  maximumFractionDigits:
                    2,
                }
              )}

              {" "}mL

            </strong>

          </div>

        </div>


        
        
        

        {insulin.active ? (

          <div className="card-actions">


            

            <button
              type="button"
              className="
                primary-button
                card-primary-action
              "
              onClick={() =>
                setDoseInsulin(
                  insulin
                )
              }
            >

              <Syringe
                size={15}
              />

              Registrar aplicação

            </button>


            

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setStockInsulin(
                  insulin
                )
              }
            >

              <PackagePlus
                size={15}
              />

              Adicionar estoque

            </button>




            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setContainersInsulin(
                  insulin
                )
              }
            >

              <Layers
                size={15}
              />

              Ver canetas/frascos

            </button>




            <button
              type="button"
              className="
                secondary-button
                full-card-action
              "
              onClick={() =>
                setAdjustStockInsulin(
                  item
                )
              }
            >

              <SlidersHorizontal
                size={15}
              />

              Ajustar estoque

            </button>

          <button
          type="button"
          className="
            secondary-button
            replenishment-button
            full-card-action
          "
          onClick={() => {

            if (
              !insulin.insulin_type
            ) {

              setEditInsulin(
                insulin
              );

              return;
            }


            setReplenishmentInsulin(
              insulin
            );

          }}
        >

          <Search
            size={15}
          />

          {insulin.insulin_type
            ? "Encontrar reposição"
            : "Definir tipo para reposição"}

        </button>
            

            <button
              type="button"
              className="
                secondary-button
                history-button
                full-card-action
              "
              onClick={() =>
                setHistoryInsulin(
                  insulin
                )
              }
            >

              <History
                size={15}
              />

              Ver histórico

            </button>

          </div>

        ) : (

          
          
          

          <div className="inactive-card-actions">

            <div className="inactive-card-message">

              <strong>

                Insulina inativa

              </strong>


              <span>

                Novas movimentações estão
                bloqueadas até que ela seja
                ativada novamente.

              </span>

            </div>


            <button
              type="button"
              className="
                secondary-button
                history-button
              "
              onClick={() =>
                setHistoryInsulin(
                  insulin
                )
              }
            >

              <History
                size={15}
              />

              Ver histórico

            </button>

          </div>

        )}

      </article>

    );

  }


  
  
  

  if (
    loading
  ) {

    return (

      <main className="dashboard dashboard-v2">

        <div className="loading-page">

          Carregando seus dados...

        </div>

      </main>

    );

  }


  
  
  

  return (

    <main className="dashboard dashboard-v2">


      
      
      

      <header className="dashboard-header dashboard-header-v2">


        

      <div className="dashboard-brand">

        <div className="brand-mark">

          <Syringe
            size={19}
            strokeWidth={2}
          />

        </div>


        <div className="brand-copy">

          <h1>
            Insulinet
          </h1>

          <p>
            Controle de estoque de insulina
          </p>

        </div>

      </div>


        

        <div className="header-user">


          {user && (

            <div className="header-user-profile">

              <div className="user-avatar">

                {user.name
                  .trim()
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <span>

                  {user.name}

                </span>


                <small>

                  Minha conta

                </small>

              </div>

            </div>

          )}


          <button
            type="button"
            className="logout-button"
            onClick={
              logout
            }
          >

            <LogOut
              size={13}
            />

            Sair

          </button>

        </div>

      </header>


      
      
      

      <section className="dashboard-content dashboard-content-v2">


        

        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        
        
        

        <div className="dashboard-hero">

          <div>

            <span className="dashboard-eyebrow">

              VISÃO GERAL

            </span>


            <h2>

              Minhas insulinas

            </h2>


            <p>

              Acompanhe estoque, histórico
              de aplicações e previsão de
              duração em um só lugar.

            </p>

          </div>


          <button
            type="button"
            className="
              primary-button
              add-insulin-main-button
            "
            onClick={() =>
              setAddInsulinOpen(
                true
              )
            }
          >

            <Plus
              size={15}
            />

            Adicionar insulina

          </button>

        </div>


        
        
        

        {insulins.length ===
        0 ? (

          <div className="empty-card">

            <div className="empty-card-icon">

              <Plus
                size={22}
              />

            </div>


            <h3>

              Nenhuma insulina cadastrada

            </h3>


            <p>

              Cadastre sua primeira insulina
              para começar a acompanhar o estoque.

            </p>


            <button
              type="button"
              className="primary-button"
              onClick={() =>
                setAddInsulinOpen(
                  true
                )
              }
            >

              <Plus
                size={15}
              />

              Adicionar insulina

            </button>

          </div>

        ) : (

          <>


            
            
            

            <section className="insulin-section">

              <div className="insulin-section-header">

                <div>

                  <h3>

                    Insulinas ativas

                  </h3>


                  <span className="insulin-section-count">

                    {
                      activeInsulins.length
                    }

                  </span>

                </div>


                <p>

                  Insulinas em acompanhamento
                  atualmente

                </p>

              </div>


              {activeInsulins.length >
              0 ? (

                <div className="insulin-grid">

                  {activeInsulins.map(
                    renderInsulinCard
                  )}

                </div>

              ) : (

                <div className="inactive-empty-state">

                  Nenhuma insulina ativa.

                </div>

              )}

            </section>


            
            
            

            {inactiveInsulins.length >
              0 && (

              <section className="inactive-insulin-section">

                <button
                  type="button"
                  className="inactive-section-toggle"
                  onClick={() =>
                    setShowInactive(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >

                  <div>

                    <span>

                      Insulinas inativas

                    </span>


                    <span className="inactive-count">

                      {
                        inactiveInsulins
                          .length
                      }

                    </span>

                  </div>


                  <span
                    className={
                      showInactive
                        ? "inactive-chevron open"
                        : "inactive-chevron"
                    }
                  >

                    ▼

                  </span>

                </button>


                {showInactive && (

                  <div className="inactive-section-content">

                    <p className="inactive-section-description">

                      Dados e histórico são
                      preservados mesmo após
                      a desativação.

                    </p>


                    <div className="insulin-grid">

                      {inactiveInsulins.map(
                        renderInsulinCard
                      )}

                    </div>

                  </div>

                )}

              </section>

            )}

          </>

        )}

      </section>


      
      
      

      {doseInsulin && (

        <RegisterDoseModal

          insulinId={
            doseInsulin.id
          }

          insulinName={
            doseInsulin.name
          }

          onClose={() =>
            setDoseInsulin(
              null
            )
          }

          onSuccess={() => {

            void refreshInsulinSummary(
              doseInsulin.id
            );

          }}

        />

      )}


      
      
      

      {historyInsulin && (

        <DoseHistoryModal

          insulinId={
            historyInsulin.id
          }

          insulinName={
            historyInsulin.name
          }

          concentrationUnitsPerMl={
            Number(
              historyInsulin
                .concentration_units_per_ml
            )
          }

          containerVolumeMl={
            Number(
              historyInsulin
                .container_volume_ml
            )
          }

          onClose={() =>
            setHistoryInsulin(
              null
            )
          }

          onChanged={() => {

            void refreshInsulinSummary(
              historyInsulin.id
            );

          }}

        />

      )}


      
      
      

      {stockInsulin && (

        <AddStockModal

          insulinId={
            stockInsulin.id
          }

          insulinName={
            stockInsulin.name
          }

          concentrationUnitsPerMl={
            stockInsulin
              .concentration_units_per_ml
          }

          containerVolumeMl={
            stockInsulin
              .container_volume_ml
          }

          onClose={() =>
            setStockInsulin(
              null
            )
          }

          onSuccess={() => {

            void refreshInsulinSummary(
              stockInsulin.id
            );

          }}

        />

      )}


      
      
      

      {containersInsulin && (

        <ContainersModal

          insulinId={
            containersInsulin.id
          }

          insulinName={
            containersInsulin.name
          }

          onClose={() =>
            setContainersInsulin(
              null
            )
          }

          onChanged={() => {

            void refreshInsulinSummary(
              containersInsulin.id
            );

          }}

        />

      )}

  {replenishmentInsulin &&
  replenishmentInsulin.insulin_type && (

  <UapsAvailabilityModal

        insulinName={
          replenishmentInsulin.name
        }

        insulinType={
          replenishmentInsulin.insulin_type
        }

        onClose={() =>
          setReplenishmentInsulin(
            null
          )
        }

      />

    )}




      {adjustStockInsulin && (

        <AdjustStockModal

          insulinId={
            adjustStockInsulin
              .insulin.id
          }

          insulinName={
            adjustStockInsulin
              .insulin.name
          }

          currentStockUnits={
            adjustStockInsulin
              .summary
              .current_stock_units
          }

          onClose={() =>
            setAdjustStockInsulin(
              null
            )
          }

          onSuccess={() => {

            void refreshInsulinSummary(
              adjustStockInsulin
                .insulin.id
            );

          }}

        />

      )}


      
      
      

      {addInsulinOpen && (

        <AddInsulinModal

          onClose={() =>
            setAddInsulinOpen(
              false
            )
          }

          onSuccess={() => {

            void refreshInsulinList();

          }}

        />

      )}


      
      
      

      {editInsulin && (

        <EditInsulinModal

          insulinId={
            editInsulin.id
          }

          initialName={
            editInsulin.name
          }

          initialInsulinType={
            editInsulin.insulin_type
          }

          initialConcentrationUnitsPerMl={
            editInsulin
              .concentration_units_per_ml
          }

          initialContainerVolumeMl={
            editInsulin
              .container_volume_ml
          }

          initialOpenValidityDays={
            editInsulin
              .open_validity_days
          }

          initialActive={
            editInsulin.active
          }

          onClose={() =>
            setEditInsulin(
              null
            )
          }

          onSuccess={() => {

            void refreshInsulinList();

          }}

        />

      )}

    </main>

  );

}