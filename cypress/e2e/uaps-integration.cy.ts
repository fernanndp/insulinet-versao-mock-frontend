type StubUaps = {
  id_uaps: number;
  nome: string;
  bairro: string;
  endereco: string;
  latitude: string | null;
  longitude: string | null;
  ativa: boolean;
  estoque: {
    id_estoque: number;
    tipo: string;
    apresentacao: string;
    quantidade_disponivel: number;
    nivel_disponibilidade: string;
    lote: string;
    validade: string;
    updated_at: string;
  }[];
};

function makeUaps(
  overrides: Partial<StubUaps> & {
    nivel?: string;
    quantidade?: number;
  }
): StubUaps {
  const nivel = overrides.nivel ?? "alto";
  const quantidade = overrides.quantidade ?? 50;

  return {
    id_uaps: overrides.id_uaps ?? 1,
    nome: overrides.nome ?? "UAPS Fictícia 01",
    bairro: overrides.bairro ?? "Bairro Fictício A",
    endereco: overrides.endereco ?? "Rua Fictícia, 100",
    latitude: overrides.latitude ?? "-3.70",
    longitude: overrides.longitude ?? "-38.50",
    ativa: overrides.ativa ?? true,
    estoque: overrides.estoque ?? [
      {
        id_estoque: 1000 + (overrides.id_uaps ?? 1),
        tipo: "Regular",
        apresentacao: "100 UI/mL",
        quantidade_disponivel: quantidade,
        nivel_disponibilidade: nivel,
        lote: "MOCK-LOTE",
        validade: "2028-01-01",
        updated_at: new Date().toISOString(),
      },
    ],
  };
}

const API_URL = "http://127.0.0.1:8000";

describe("Integração fictícia com UAPS", () => {
  const timestamp = Date.now();

  const user = {
    name: "Teste Cypress UAPS",
    email: `cypress.uaps.${timestamp}@example.com`,
    password: "senha12345",
  };

  const insulinName = `Insulina UAPS ${timestamp}`;

  let token: string;

  before(() => {
    cy.request("POST", `${API_URL}/api/auth/register`, {
      name: user.name,
      email: user.email,
      password: user.password,
    });

    cy.request({
      method: "POST",
      url: `${API_URL}/api/auth/login`,
      form: true,
      body: {
        username: user.email,
        password: user.password,
      },
    }).then((response) => {
      token = response.body.access_token;

      cy.request({
        method: "POST",
        url: `${API_URL}/api/insulins`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: insulinName,
          insulin_type: "Regular",
          concentration_units_per_ml: 100,
          container_volume_ml: 10,
          open_validity_days: 28,
        },
      });
    });
  });

  function visitDashboardAndOpenModal(
    options: {
      geolocation?: { lat: number; lon: number } | "denied";
    } = {}
  ) {
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);

        cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
          (success: PositionCallback, error?: PositionErrorCallback) => {
            if (
              options.geolocation &&
              options.geolocation !== "denied"
            ) {
              success({
                coords: {
                  latitude: options.geolocation.lat,
                  longitude: options.geolocation.lon,
                },
              } as GeolocationPosition);

              return;
            }

            if (error) {
              error({
                code: 1,
                message: "denied",
              } as GeolocationPositionError);
            }
          }
        );
      },
    });

    cy.contains(".insulin-card", insulinName, { timeout: 10000 }).should(
      "exist"
    );

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Encontrar reposição").click();
    });
  }

  it("exibe estado vazio quando a integração não retorna nenhuma UAPS disponível", () => {
    cy.intercept("GET", "**/api/uaps*", {
      statusCode: 200,
      body: [],
    }).as("uapsCall");

    visitDashboardAndOpenModal();

    cy.wait("@uapsCall");

    cy.contains("Nenhuma UAPS disponível").should("be.visible");
  });

  it("exibe erro de serviço e recupera a lista após tentar novamente", () => {
    let callCount = 0;

    cy.intercept("GET", "**/api/uaps*", (req) => {
      callCount += 1;

      if (callCount === 1) {
        req.reply({
          statusCode: 500,
          body: { detail: "Erro interno simulado" },
        });

        return;
      }

      req.reply({
        statusCode: 200,
        body: [makeUaps({})],
      });
    }).as("uapsCall");

    visitDashboardAndOpenModal();

    cy.wait("@uapsCall");
    cy.contains("Não foi possível consultar").should("be.visible");

    cy.contains("button", "Tentar novamente").click();

    cy.wait("@uapsCall");
    cy.contains("UAPS Fictícia 01").should("be.visible");
  });

  it("exibe falha de conexão quando a chamada de rede falha completamente", () => {
    cy.intercept("GET", "**/api/uaps*", {
      forceNetworkError: true,
    }).as("uapsCall");

    visitDashboardAndOpenModal();

    cy.wait("@uapsCall");

    cy.contains("Não foi possível conectar ao servidor").should("be.visible");
  });

  it("atualiza a lista ao trocar o tipo de insulina pesquisado sem fechar o modal", () => {
    cy.intercept("GET", "**/api/uaps*", (req) => {
      const url = new URL(req.url);
      const tipo = url.searchParams.get("tipo");

      req.reply({
        statusCode: 200,
        body: [
          makeUaps({
            nome: `UAPS com ${tipo}`,
            estoque: [
              {
                id_estoque: 1,
                tipo: tipo ?? "Regular",
                apresentacao: "100 UI/mL",
                quantidade_disponivel: 30,
                nivel_disponibilidade: "alto",
                lote: "MOCK",
                validade: "2028-01-01",
                updated_at: new Date().toISOString(),
              },
            ],
          }),
        ],
      });
    }).as("uapsCall");

    visitDashboardAndOpenModal();

    cy.wait("@uapsCall");
    cy.contains("UAPS com Regular").should("be.visible");

    cy.get(".uaps-type-select").select("Glargina");

    cy.wait("@uapsCall");
    cy.contains("UAPS com Glargina").should("be.visible");
  });

  it("ordena as UAPS por proximidade quando a localização está disponível", () => {
    cy.intercept("GET", "**/api/uaps*", {
      statusCode: 200,
      body: [
        makeUaps({
          id_uaps: 1,
          nome: "UAPS Distante",
          latitude: "-3.90",
          longitude: "-38.70",
        }),
        makeUaps({
          id_uaps: 2,
          nome: "UAPS Próxima",
          latitude: "-3.701",
          longitude: "-38.501",
        }),
      ],
    }).as("uapsCall");

    visitDashboardAndOpenModal({
      geolocation: { lat: -3.7, lon: -38.5 },
    });

    cy.wait("@uapsCall");

    cy.get(".uaps-card")
      .first()
      .should("contain.text", "UAPS Próxima");

    cy.get(".uaps-card")
      .first()
      .find(".uaps-distance")
      .should("be.visible");
  });

  it("renderiza corretamente os diferentes níveis de disponibilidade da integração mock", () => {
    cy.intercept("GET", "**/api/uaps*", {
      statusCode: 200,
      body: [
        makeUaps({ id_uaps: 1, nome: "UAPS Alto", nivel: "alto" }),
        makeUaps({ id_uaps: 2, nome: "UAPS Medio", nivel: "medio" }),
        makeUaps({ id_uaps: 3, nome: "UAPS Baixo", nivel: "baixo" }),
        makeUaps({ id_uaps: 4, nome: "UAPS Critico", nivel: "critico" }),
      ],
    }).as("uapsCall");

    visitDashboardAndOpenModal();

    cy.wait("@uapsCall");

    cy.contains(".uaps-card", "UAPS Alto")
      .find(".uaps-availability-badge")
      .should("have.class", "alto")
      .and("contain.text", "Alta disponibilidade");

    cy.contains(".uaps-card", "UAPS Medio")
      .find(".uaps-availability-badge")
      .should("have.class", "medio")
      .and("contain.text", "Disponibilidade média");

    cy.contains(".uaps-card", "UAPS Baixo")
      .find(".uaps-availability-badge")
      .should("have.class", "baixo")
      .and("contain.text", "Baixa disponibilidade");

    cy.contains(".uaps-card", "UAPS Critico")
      .find(".uaps-availability-badge")
      .should("have.class", "critico")
      .and("contain.text", "Estoque crítico");
  });
});
