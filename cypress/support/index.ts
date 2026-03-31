import "@testing-library/cypress/add-commands";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * UI를 통해 테스트 계정으로 로그인하고 세션을 캐싱합니다.
       * 성공 시 '/meetings' 페이지로 이동합니다.
       * @example cy.login()
       */
      login(): Chainable<void>;

      /**
       * UI를 통해 테스트 계정 세션을 종료하고 로그아웃 처리합니다.
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * 현재 브라우저의 pathname이 예상한 경로와 일치하는지 검증합니다.
       * @param path - 검증할 URL 경로
       * @example cy.assertUrl('/meetings')
       */
      assertUrl(path: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", () => {
  const id = Cypress.env("TEST_USER_ID");
  const pw = Cypress.env("TEST_USER_PW");

  cy.session(id, () => {
    cy.visit("/sign-in");
    cy.findByLabelText("이메일").type(id);
    cy.findByLabelText("비밀번호").type(pw);
    cy.findByRole("button", { name: "로그인" }).click();
    cy.location("pathname").should("eq", "/meetings");
  });
});

Cypress.Commands.add("assertUrl", (path) => {
  cy.location("pathname", { timeout: 10000 }).should("eq", path);
});
