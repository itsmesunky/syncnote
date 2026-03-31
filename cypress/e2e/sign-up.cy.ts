describe("회원가입 검증", () => {
  beforeEach(() => {
    cy.visit("/sign-up");
  });

  it("필수 필드 미입력 시 각 유효성 에러 메시지가 노출된다.", () => {
    cy.findByRole("button", { name: "회원가입" }).click();
    cy.findByText("이름은 필수 입력 사항입니다.").should("exist");
    cy.findByText("올바른 이메일 형식을 입력해 주세요.").should("exist");
    cy.findByText("비밀번호는 최소 8자 이상이어야 합니다.").should("exist");
    cy.findByText("비밀번호 확인을 입력해 주세요.").should("exist");
  });

  it("비밀번호와 비밀번호 확인이 다른 경우 회원가입 버튼을 클릭하면 '비밀번호가 일치하지 않습니다.' 경고 메시지가 노출된다.", () => {
    cy.findByLabelText("이름").type("test");
    cy.findByLabelText("이메일").type("test@test.com");
    cy.findByLabelText("비밀번호").type("test1234");
    cy.findByLabelText("비밀번호 확인").type("test1235");

    cy.findByText("회원가입").click();
    cy.findByText("비밀번호가 일치하지 않습니다.").should("exist");
  });

  it("성공적으로 회원 가입이 완료되었을 경우 미팅(/meetings) 페이지로 이동한다.", () => {
    cy.intercept("POST", "**/api/auth/sign-up/email", {
      statusCode: 200,
      body: { token: "fake-token", user: { id: "1", name: "test", email: "test@test.com" } },
    }).as("signUp");

    cy.findByLabelText("이름").type("test");
    cy.findByLabelText("이메일").type("test@test.com");
    cy.findByLabelText("비밀번호").type("test1234");
    cy.findByLabelText("비밀번호 확인").type("test1234");

    cy.findByRole("button", { name: "회원가입" }).click();
    cy.wait("@signUp");
    cy.assertUrl("/meetings");
  });

  it("이미 가입된 이메일로 회원가입 시 '이미 가입된 이메일입니다.' 경고 메시지가 노출된다.", () => {
    cy.intercept("POST", "**/api/auth/sign-up/email", {
      statusCode: 422,
      body: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", message: "User already exists" },
    });

    cy.findByLabelText("이름").type("test");
    cy.findByLabelText("이메일").type("test@test.com");
    cy.findByLabelText("비밀번호").type("test1234");
    cy.findByLabelText("비밀번호 확인").type("test1234");

    cy.findByRole("button", { name: "회원가입" }).click();
    cy.findByText("이미 가입된 이메일입니다.").should("exist");
  });
});
