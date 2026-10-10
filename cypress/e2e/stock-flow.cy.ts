const API_URL = "http://127.0.0.1:8000";

describe("Fluxo de estoque de insulina", () => {
  const apiUrl = API_URL;

  const timestamp = Date.now();

  const user = {
    name: "Teste Cypress",
    email: `cypress.${timestamp}@example.com`,
    password: "senha12345",
  };

  const insulinName = `Insulina Cypress ${timestamp}`;

  let token: string;

  function visitDashboard() {
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);
      },
    });

    cy.contains(".insulin-card", insulinName, {
      timeout: 10000,
    }).should("exist");
  }

  function currentStockOf(name: string) {
    return cy
      .contains(".insulin-card", name)
      .find(".stock-value strong");
  }

  before(() => {
    cy.request("POST", `${apiUrl}/api/auth/register`, {
      name: user.name,
      email: user.email,
      password: user.password,
    });

    cy.request({
      method: "POST",
      url: `${apiUrl}/api/auth/login`,
      form: true,
      body: {
        username: user.email,
        password: user.password,
      },
    }).then((response) => {
      token = response.body.access_token;
    });
  });

  it("cadastra uma nova insulina com estoque inicial zerado", () => {
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);
      },
    });

    cy.get(".add-insulin-main-button").click();

    cy.contains("label", "Nome da insulina")
      .find("input")
      .type(insulinName);

    cy.contains("label", "Tipo da insulina")
      .find("select")
      .select("Regular");

    cy.contains("label", "Concentração")
      .find("input")
      .type("100");

    cy.contains("label", "Volume por recipiente")
      .find("input")
      .type("10");

    cy.contains("label", "Validade após aberta (dias)")
      .find("input")
      .clear()
      .type("28");

    cy.contains(".modal-actions button", "Adicionar insulina").click();

    cy.contains(".insulin-card", insulinName).should("exist");
    currentStockOf(insulinName).should("have.text", "0");
  });

  it("adiciona estoque e atualiza o saldo atual", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Adicionar estoque").click();
    });

    cy.contains("label", "Quantos recipientes")
      .find("input")
      .type("1");

    cy.contains(".modal-actions button", "Adicionar estoque").click();

    currentStockOf(insulinName).should("have.text", "1.000");
  });

  it("registra uma aplicação e reduz o estoque atual", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Registrar aplicação").click();
    });

    cy.contains("label", "Dose aplicada")
      .find("input")
      .type("200");

    cy.contains(".modal-actions button", "Registrar aplicação").click();

    currentStockOf(insulinName).should("have.text", "800");
  });

  it("bloqueia aplicação maior que o estoque disponível", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Registrar aplicação").click();
    });

    cy.contains("label", "Dose aplicada")
      .find("input")
      .type("5000");

    cy.contains(".modal-actions button", "Registrar aplicação").click();

    cy.get(".error-message").should("be.visible");

    cy.get(".modal-close").click();

    currentStockOf(insulinName).should("have.text", "800");
  });

  it("ajusta o estoque manualmente para um valor informado", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Ajustar estoque").click();
    });

    cy.contains("label", "Estoque real")
      .find("input")
      .type("500");

    cy.contains("label", "Motivo do ajuste")
      .find("textarea")
      .type("Contagem fisica de teste");

    cy.contains(".modal-actions button", "Confirmar ajuste").click();

    currentStockOf(insulinName).should("have.text", "500");
  });

  it("sinaliza alerta critico quando o estoque chega a zero", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Ajustar estoque").click();
    });

    cy.contains("label", "Estoque real")
      .find("input")
      .type("0");

    cy.contains("label", "Motivo do ajuste")
      .find("textarea")
      .type("Zerando estoque para teste");

    cy.contains(".modal-actions button", "Confirmar ajuste").click();

    currentStockOf(insulinName).should("have.text", "0");

    cy.contains(".insulin-card", insulinName)
      .find(".stock-available-badge")
      .should("have.class", "stock-alert-critical")
      .and("contain.text", "Estoque crítico");

    cy.contains(".insulin-card", insulinName)
      .find(".replenishment-button")
      .should("have.class", "stock-alert-critical");
  });

  it("lista as movimentacoes no historico da insulina", () => {
    visitDashboard();

    cy.contains(".insulin-card", insulinName).within(() => {
      cy.contains("button", "Ver histórico").click();
    });

    cy.get(".movement-history-item")
      .contains("Entrada de estoque")
      .should("exist");

    cy.get(".movement-history-item")
      .contains("Aplicação")
      .should("exist");

    cy.get(".movement-history-item")
      .filter(":contains(Ajuste de estoque)")
      .should("have.length.at.least", 2);
  });
});
