describe("라우팅 가드 검증", () => {
  context("비로그인 상태일 때", () => {
    it("면접 페이지(/meetings)에 접속할 경우 로그인 페이지로 리다이렉트된다.", () => {
      cy.visit("/meetings");
      cy.assertUrl("/sign-in");
      cy.findByLabelText("이메일").should("be.visible");
    });

    it("에이전트 페이지(/agents)에 접속할 경우 로그인 페이지로 리다이렉트된다.", () => {
      cy.visit("/agents");
      cy.assertUrl("/sign-in");
    });

    it("구독 페이지(/upgrade)에 접속할 경우 로그인 페이지로 리다이렉트된다.", () => {
      cy.visit("/upgrade");
      cy.assertUrl("/sign-in");
    });

    it("특정 회의 페이지(/call/:id)에 접속할 경우 로그인 페이지로 리다이렉트된다.", () => {
      cy.visit("/call/123");
      cy.assertUrl("/sign-in");
    });
  });

  context("로그인 상태일 때", () => {
    beforeEach(() => {
      cy.login();
    });

    it("로그인 페이지(/sign-in)에 접속할 경우 미팅 페이지(/meetings)로 리다이렉트된다.", () => {
      cy.visit("/sign-in");
      cy.assertUrl("/meetings");
    });

    it("회원가입 페이지(/sign-up)에 접속할 경우 미팅 페이지(/meetings)로 리다이렉트된다.", () => {
      cy.visit("/sign-up");
      cy.assertUrl("/meetings");
    });

    it("면접 페이지(/meetings)에 접속할 경우 정상적으로 접근할 수 있다.", () => {
      cy.visit("/meetings");
      cy.assertUrl("/meetings");
      cy.findByRole("button", { name: "새로운 면접 생성" }).should("be.visible");
    });

    it("에이전트 페이지(/agents)에 접속할 경우 정상적으로 접근할 수 있다.", () => {
      cy.visit("/agents");
      cy.assertUrl("/agents");
      cy.findByRole("button", { name: "새로운 에이전트 생성" }).should("be.visible");
    });

    it("구독 페이지(/upgrade)에 접속할 경우 정상적으로 접근할 수 있다.", () => {
      cy.visit("/upgrade");
      cy.assertUrl("/upgrade");
      cy.contains("요금제를 이용 중입니다").should("be.visible");
    });

    it("사이드바 내 프로필 카드 클릭 후 로그아웃 버튼을 클릭하면 로그인 페이지(/sign-in)로 리다이렉트된다.", () => {
      cy.visit("/meetings");
      cy.assertUrl("/meetings");
      cy.findByTestId("profile-dropdown-trigger").click();
      cy.findByRole("menuitem", { name: "로그아웃" }).click();
      cy.assertUrl("/sign-in");
    });
  });
});
