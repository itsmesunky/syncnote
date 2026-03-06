describe("로그인 검증", () => {
  beforeEach(() => {
    cy.visit("/sign-in");
  });

  it("가입되지 않은 이메일이나 틀린 비밀번호를 입력하고 로그인 버튼 클릭 시, 화면에 에러 메시지가 노출된다.", () => {
    cy.findByLabelText("이메일").type("aaaa@aaaa.aa");
    cy.findByLabelText("비밀번호").type("aaaa");
    cy.findByRole("button", { name: "로그인" }).click();
    cy.findByText("이메일 또는 비밀번호가 올바르지 않습니다.").should("be.visible");
  });

  it("가입된 이메일과 올바른 비밀번호를 입력하고 로그인 버튼 클릭 시, 로그인이 완료되고 면접 페이지(/meetings)로 리다이렉트된다.", () => {
    cy.findByLabelText("이메일").type("godns500@nate.com");
    cy.findByLabelText("비밀번호").type("qwer1234!");
    cy.findByRole("button", { name: "로그인" }).click();
    cy.assertUrl("/meetings");
  });
});
