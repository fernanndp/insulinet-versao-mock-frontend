import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import { Syringe } from "lucide-react";

import {
  registerDose,
  registerDoseBatch,
} from "../../services/doseService";


type Props = {
  insulinId: number;
  insulinName: string;
  onClose: () => void;
  onSuccess: () => void;
};


type DoseMode =
  | "now"
  | "single"
  | "multiple";


type BatchDose = {
  id: string;
  selected: boolean;
  date: string;
  units: string;
  time: string;
};


const FORTALEZA_TIMEZONE =
  "America/Fortaleza";


export default function RegisterDoseModal({
  insulinId,
  insulinName,
  onClose,
  onSuccess,
}: Props) {

  
  
  

  const [
    mode,
    setMode,
  ] = useState<DoseMode>(
    "now"
  );


  
  
  

  const [
    units,
    setUnits,
  ] = useState("");


  
  
  

  const [
    singleDate,
    setSingleDate,
  ] = useState("");


  const [
    singleTime,
    setSingleTime,
  ] = useState("");


  
  
  

  const [
    startDate,
    setStartDate,
  ] = useState("");


  const [
    endDate,
    setEndDate,
  ] = useState("");


  const [
    defaultTime,
    setDefaultTime,
  ] = useState("");


  const [
    batchDoses,
    setBatchDoses,
  ] = useState<BatchDose[]>(
    []
  );


  
  
  

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


  
  
  

  const today =
    useMemo(() => {

      const parts =
        new Intl.DateTimeFormat(
          "en-CA",
          {
            timeZone:
              FORTALEZA_TIMEZONE,

            year:
              "numeric",

            month:
              "2-digit",

            day:
              "2-digit",
          }
        ).formatToParts(
          new Date()
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

    }, []);


  
  
  

  function validateUnits(
    value: string
  ) {

    const numericValue =
      Number(value);


    return (
      !Number.isNaN(
        numericValue
      ) &&
      numericValue > 0
    );

  }


  
  
  

  function formatDate(
    dateString: string
  ) {

    const [
      year,
      month,
      day,
    ] =
      dateString
        .split("-");


    return (
      `${day}/` +
      `${month}/` +
      `${year}`
    );

  }


  
  
  

  function generateDateRange(
    start: string,
    end: string
  ):
    string[] {

    const dates:
      string[] = [];


    const [
      startYear,
      startMonth,
      startDay,
    ] =
      start
        .split("-")
        .map(Number);


    const [
      endYear,
      endMonth,
      endDay,
    ] =
      end
        .split("-")
        .map(Number);


    const current =
      new Date(
        startYear,
        startMonth - 1,
        startDay
      );


    const finalDate =
      new Date(
        endYear,
        endMonth - 1,
        endDay
      );


    while (
      current <= finalDate
    ) {

      const year =
        current
          .getFullYear();


      const month =
        String(
          current
            .getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          current
            .getDate()
        ).padStart(
          2,
          "0"
        );


      dates.push(
        `${year}-${month}-${day}`
      );


      current.setDate(
        current.getDate() + 1
      );

    }


    return dates;

  }


  
  
  

  function generateBatch() {

    setError("");


    if (
      !validateUnits(
        units
      )
    ) {

      setError(
        "Informe uma dose padrão maior que zero."
      );

      return;

    }


    if (
      !startDate ||
      !endDate
    ) {

      setError(
        "Informe a data inicial e a data final."
      );

      return;

    }


    if (
      startDate >
      endDate
    ) {

      setError(
        "A data inicial não pode ser posterior à data final."
      );

      return;

    }


    if (
      endDate >
      today
    ) {

      setError(
        "Não é possível registrar aplicações em datas futuras."
      );

      return;

    }


    const dates =
      generateDateRange(
        startDate,
        endDate
      );


    const generated:
      BatchDose[] =
      dates.map(
        (date) => ({

          id:
            crypto.randomUUID(),

          selected:
            true,

          date,

          units,

          time:
            defaultTime,

        })
      );


    setBatchDoses(
      generated
    );

  }


  
  
  

  function updateBatchDose(
    id: string,

    field:
      | "selected"
      | "units"
      | "time",

    value:
      | boolean
      | string
  ) {

    setBatchDoses(
      (current) =>
        current.map(
          (dose) => {

            if (
              dose.id !== id
            ) {
              return dose;
            }


            return {
              ...dose,

              [field]:
                value,
            };

          }
        )
    );

  }


  
  
  

  function selectAll() {

    setBatchDoses(
      (current) =>
        current.map(
          (dose) => ({

            ...dose,

            selected:
              true,

          })
        )
    );

  }


  function deselectAll() {

    setBatchDoses(
      (current) =>
        current.map(
          (dose) => ({

            ...dose,

            selected:
              false,

          })
        )
    );

  }


  
  
  

  const selectedCount =
    batchDoses.filter(
      (dose) =>
        dose.selected
    ).length;


  const batchTotalUnits =
    batchDoses
      .filter(
        (dose) =>
          dose.selected
      )
      .reduce(
        (
          total,
          dose
        ) => {

          const numeric =
            Number(
              dose.units
            );


          if (
            Number.isNaN(
              numeric
            )
          ) {
            return total;
          }


          return (
            total +
            numeric
          );

        },
        0
      );


  
  
  

  async function handleSubmit(
    event:
      FormEvent
  ) {

    event.preventDefault();

    setError("");


    
    
    

    if (
      mode ===
      "now"
    ) {

      if (
        !validateUnits(
          units
        )
      ) {

        setError(
          "Informe uma dose maior que zero."
        );

        return;

      }


      setLoading(
        true
      );


      try {

        await registerDose(
          insulinId,
          {
            units:
              Number(
                units
              ),

            occurred_date:
              null,

            occurred_time:
              null,

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
            : "Não foi possível registrar a aplicação."
        );

      } finally {

        setLoading(
          false
        );

      }


      return;

    }


    
    
    

    if (
      mode ===
      "single"
    ) {

      if (
        !validateUnits(
          units
        )
      ) {

        setError(
          "Informe uma dose maior que zero."
        );

        return;

      }


      if (
        !singleDate
      ) {

        setError(
          "Informe a data da aplicação."
        );

        return;

      }


      if (
        singleDate >
        today
      ) {

        setError(
          "A aplicação não pode estar no futuro."
        );

        return;

      }


      setLoading(
        true
      );


      try {

        await registerDose(
          insulinId,
          {
            units:
              Number(
                units
              ),

            occurred_date:
              singleDate,

            occurred_time:
              singleTime ||
              null,

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
            : "Não foi possível registrar a aplicação."
        );

      } finally {

        setLoading(
          false
        );

      }


      return;

    }


    
    
    

    if (
      mode ===
      "multiple"
    ) {

      const selected =
        batchDoses.filter(
          (dose) =>
            dose.selected
        );


      if (
        selected.length ===
        0
      ) {

        setError(
          "Selecione pelo menos um dia."
        );

        return;

      }


      const invalidDose =
        selected.some(
          (dose) =>
            !validateUnits(
              dose.units
            )
        );


      if (
        invalidDose
      ) {

        setError(
          "Existe uma dose inválida no período selecionado."
        );

        return;

      }


      setLoading(
        true
      );


      try {

        await registerDoseBatch(
          insulinId,
          selected.map(
            (dose) => ({

              occurred_date:
                dose.date,

              occurred_time:
                dose.time ||
                null,

              units:
                Number(
                  dose.units
                ),

              notes:
                null,

            })
          )
        );


        onSuccess();
        onClose();

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível registrar as aplicações."
        );

      } finally {

        setLoading(
          false
        );

      }

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
          dose-modal-large
        "
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >


        
        
        

        <div className="modal-header">

          <div>

            <h2>
            <Syringe size={20} aria-hidden="true" />
            Registrar aplicação
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


          
          
          

          <div className="form-group">

            <span className="form-label">
              Quando foi aplicada?
            </span>


            <div className="dose-mode-buttons">


              <button
                type="button"
                className={
                  mode ===
                  "now"
                    ? "option-button active"
                    : "option-button"
                }
                onClick={() => {

                  setMode(
                    "now"
                  );

                  setBatchDoses(
                    []
                  );

                  setError("");

                }}
              >
                Agora
              </button>


              <button
                type="button"
                className={
                  mode ===
                  "single"
                    ? "option-button active"
                    : "option-button"
                }
                onClick={() => {

                  setMode(
                    "single"
                  );

                  setBatchDoses(
                    []
                  );

                  setError("");

                }}
              >
                Uma data
              </button>


              <button
                type="button"
                className={
                  mode ===
                  "multiple"
                    ? "option-button active"
                    : "option-button"
                }
                onClick={() => {

                  setMode(
                    "multiple"
                  );

                  setError("");

                }}
              >
                Vários dias
              </button>

            </div>

          </div>


          
          
          

          {mode ===
            "now" && (

            <>

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
                    placeholder="Ex.: 12"
                    autoFocus
                    required
                  />

                  <span>
                    U
                  </span>

                </div>

              </label>


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
                  placeholder="Ex.: dose da manhã"
                />

              </label>

            </>

          )}


          
          
          

          {mode ===
            "single" && (

            <>

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
                    placeholder="Ex.: 12"
                    required
                  />

                  <span>
                    U
                  </span>

                </div>

              </label>


              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",

                  gap:
                    "14px",

                  alignItems:
                    "end",
                }}
              >


                <label
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      "7px",

                    margin:
                      0,
                  }}
                >

                  <div
                    style={{
                      minHeight:
                        "20px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap:
                        "8px",
                    }}
                  >

                    <span>
                      Data
                    </span>

                  </div>


                  <input
                    type="date"
                    max={
                      today
                    }
                    value={
                      singleDate
                    }
                    onChange={
                      (event) =>
                        setSingleDate(
                          event
                            .target
                            .value
                        )
                    }
                    style={{
                      width:
                        "100%",

                      height:
                        "46px",

                      boxSizing:
                        "border-box",
                    }}
                    required
                  />

                </label>


                <label
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      "7px",

                    margin:
                      0,
                  }}
                >

                  <div
                    style={{
                      minHeight:
                        "20px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap:
                        "8px",
                    }}
                  >

                    <span>
                      Hora
                    </span>

                    <span
                      style={{
                        color:
                          "var(--text-tertiary)",

                        fontSize:
                          "13px",

                        fontWeight:
                          400,
                      }}
                    >
                      opcional
                    </span>

                  </div>


                  <input
                    type="time"
                    value={
                      singleTime
                    }
                    onChange={
                      (event) =>
                        setSingleTime(
                          event
                            .target
                            .value
                        )
                    }
                    style={{
                      width:
                        "100%",

                      height:
                        "46px",

                      boxSizing:
                        "border-box",
                    }}
                  />

                </label>

              </div>


              {!singleTime && (

                <div className="form-hint">

                  Se você não lembrar
                  o horário, deixe o
                  campo vazio.

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

            </>

          )}


          
          
          

          {mode ===
            "multiple" && (

            <>

              <div className="batch-generator">


                
                
                

                <div
                  className="batch-generator-grid"
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",

                    gap:
                      "16px 14px",

                    alignItems:
                      "end",
                  }}
                >


                  

                  <label
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "7px",

                      margin:
                        0,
                    }}
                  >

                    <div
                      style={{
                        minHeight:
                          "20px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        gap:
                          "8px",
                      }}
                    >

                      <span>
                        Dose padrão
                      </span>

                    </div>


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
                        placeholder="Ex.: 12"
                        style={{
                          width:
                            "100%",

                          height:
                            "46px",

                          boxSizing:
                            "border-box",
                        }}
                      />

                      <span>
                        U
                      </span>

                    </div>

                  </label>


                  

                  <label
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "7px",

                      margin:
                        0,
                    }}
                  >

                    <div
                      style={{
                        minHeight:
                          "20px",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        gap:
                          "8px",
                      }}
                    >

                      <span>
                        Hora padrão
                      </span>


                      <span
                        style={{
                          color:
                            "var(--text-tertiary)",

                          fontSize:
                            "13px",

                          fontWeight:
                            400,
                        }}
                      >
                        opcional
                      </span>

                    </div>


                    <input
                      type="time"
                      value={
                        defaultTime
                      }
                      onChange={
                        (event) =>
                          setDefaultTime(
                            event
                              .target
                              .value
                          )
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "46px",

                        boxSizing:
                          "border-box",
                      }}
                    />

                  </label>


                  

                  <label
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "7px",

                      margin:
                        0,
                    }}
                  >

                    <div
                      style={{
                        minHeight:
                          "20px",

                        display:
                          "flex",

                        alignItems:
                          "center",
                      }}
                    >

                      <span>
                        De
                      </span>

                    </div>


                    <input
                      type="date"
                      max={
                        today
                      }
                      value={
                        startDate
                      }
                      onChange={
                        (event) =>
                          setStartDate(
                            event
                              .target
                              .value
                          )
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "46px",

                        boxSizing:
                          "border-box",
                      }}
                    />

                  </label>


                  

                  <label
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "7px",

                      margin:
                        0,
                    }}
                  >

                    <div
                      style={{
                        minHeight:
                          "20px",

                        display:
                          "flex",

                        alignItems:
                          "center",
                      }}
                    >

                      <span>
                        Até
                      </span>

                    </div>


                    <input
                      type="date"
                      max={
                        today
                      }
                      value={
                        endDate
                      }
                      onChange={
                        (event) =>
                          setEndDate(
                            event
                              .target
                              .value
                          )
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "46px",

                        boxSizing:
                          "border-box",
                      }}
                    />

                  </label>

                </div>


                

                <button
                  type="button"
                  className="
                    secondary-button
                    generate-days-button
                  "
                  onClick={
                    generateBatch
                  }
                  style={{
                    width:
                      "100%",

                    marginTop:
                      "16px",
                  }}
                >
                  Gerar dias
                </button>

              </div>


              
              
              

              {batchDoses.length >
                0 && (

                <div className="batch-section">


                  

                  <div className="batch-toolbar">

                    <div>

                      <strong>
                        Aplicações
                      </strong>

                      <span>

                        {selectedCount}

                        {" "}

                        aplicação
                        {selectedCount !==
                        1
                          ? "ões"
                          : ""}

                        {" "}

                        selecionada
                        {selectedCount !==
                        1
                          ? "s"
                          : ""}

                      </span>

                    </div>


                    <div className="batch-toolbar-actions">

                      <button
                        type="button"
                        onClick={
                          selectAll
                        }
                      >
                        Selecionar todos
                      </button>


                      <button
                        type="button"
                        onClick={
                          deselectAll
                        }
                      >
                        Desmarcar todos
                      </button>

                    </div>

                  </div>


                  

                  <div className="batch-list">

                    {batchDoses.map(
                      (dose) => (

                        <div
                          key={
                            dose.id
                          }
                          className={
                            dose.selected
                              ? "batch-row"
                              : "batch-row disabled"
                          }
                        >


                          

                          <input
                            className="batch-checkbox"
                            type="checkbox"
                            checked={
                              dose.selected
                            }
                            onChange={
                              (event) =>
                                updateBatchDose(
                                  dose.id,
                                  "selected",
                                  event
                                    .target
                                    .checked
                                )
                            }
                          />


                          

                          <div className="batch-date">

                            <strong>
                              {formatDate(
                                dose.date
                              )}
                            </strong>

                          </div>


                          

                          <div className="batch-field">

                            <span>
                              Dose
                            </span>


                            <div className="batch-unit-input">

                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                disabled={
                                  !dose.selected
                                }
                                value={
                                  dose.units
                                }
                                onChange={
                                  (event) =>
                                    updateBatchDose(
                                      dose.id,
                                      "units",
                                      event
                                        .target
                                        .value
                                    )
                                }
                              />

                              <span>
                                U
                              </span>

                            </div>

                          </div>


                          

                          <div className="batch-field">

                            <span>
                              Hora
                            </span>


                            <input
                              type="time"
                              disabled={
                                !dose.selected
                              }
                              value={
                                dose.time
                              }
                              onChange={
                                (event) =>
                                  updateBatchDose(
                                    dose.id,
                                    "time",
                                    event
                                      .target
                                      .value
                                  )
                              }
                            />

                          </div>

                        </div>

                      )
                    )}

                  </div>


                  

                  <div className="batch-summary">


                    <div>

                      <span>
                        Aplicações
                      </span>

                      <strong>
                        {selectedCount}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Total
                      </span>


                      <strong>

                        {batchTotalUnits
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

                </div>

              )}

            </>

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
                loading ||
                (
                  mode ===
                    "multiple" &&
                  selectedCount ===
                    0
                )
              }
            >

              {loading
                ? "Registrando..."
                : mode ===
                    "multiple"
                  ? (
                    `Registrar ${selectedCount} aplicação${
                      selectedCount !== 1
                        ? "ões"
                        : ""
                    }`
                  )
                  : "Registrar aplicação"}

            </button>

          </div>

        </form>

      </section>

    </div>

  );

}