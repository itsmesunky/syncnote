describe("에이전트 관리", () => {
  const TEST_AGENT_NAME = "[E2E] 테스트 에이전트";
  const TEST_AGENT_INSTRUCTIONS = "E2E 테스트용 에이전트입니다.";

  beforeEach(() => {
    cy.login();
    cy.request("POST", "/api/trpc/agents.cleanupTestAgents", {}).its("status").should("eq", 200);
  });

  context("목록 페이지 기본 UI", () => {
    beforeEach(() => {
      cy.visit("/agents");
    });

    it("에이전트 목록 페이지에 접속하면 주요 UI 요소가 노출된다.", () => {
      cy.findByRole("button", { name: "새로운 에이전트 생성" }).should("be.visible");
      cy.findByPlaceholderText("에이전트 이름을 입력해 주세요").should("be.visible");
    });
  });

  context("에이전트 검색", () => {
    beforeEach(() => {
      cy.visit("/agents");
    });

    it("검색어 입력 시 URL에 search 파라미터가 반영된다.", () => {
      cy.findByPlaceholderText("에이전트 이름을 입력해 주세요").type("테스트");
      cy.location("search").should("include", "search=");
    });

    it("검색어가 입력된 상태에서 초기화 버튼 클릭 시 검색어가 초기화된다.", () => {
      cy.findByPlaceholderText("에이전트 이름을 입력해 주세요").type("테스트");
      cy.findByRole("button", { name: "초기화" }).click();
      cy.findByPlaceholderText("에이전트 이름을 입력해 주세요").should("have.value", "");
      cy.location("search").should("not.include", "search=");
    });
  });

  context("에이전트 생성", () => {
    beforeEach(() => {
      cy.visit("/agents");
    });

    it("필수 필드 미입력 시 유효성 에러 메시지가 노출된다.", () => {
      cy.findByRole("button", { name: "새로운 에이전트 생성" }).click();
      cy.findByRole("button", { name: "등록" }).click();

      cy.findByText("이름은 필수 입력 사항입니다.").should("exist");
      cy.findByText("에이전트가 수행해야 할 역할과 행동 지침을 구체적으로 작성해 주세요.").should(
        "exist",
      );
    });

    it("에이전트를 생성하면 목록에 추가되고 성공 토스트가 노출된다.", () => {
      cy.intercept("POST", "**/api/trpc/agents.create*").as("createAgent");

      cy.findByRole("button", { name: "새로운 에이전트 생성" }).click();
      cy.findByLabelText("이름").type(TEST_AGENT_NAME);
      cy.findByLabelText("역할 및 행동 지침").type(TEST_AGENT_INSTRUCTIONS);
      cy.findByRole("button", { name: "등록" }).click();

      cy.wait("@createAgent");

      cy.findByText("에이전트가 등록되었어요.").should("be.visible");
      cy.findByText(TEST_AGENT_NAME).should("be.visible");
    });

    it("무료 플랜 한도 초과 시 업그레이드 페이지로 이동한다.", () => {
      cy.intercept("POST", "**/api/trpc/agents.create*", {
        statusCode: 403,
        body: [
          {
            error: {
              message: "무료 에이전트 한도에 도달했습니다.",
              code: -32600,
              data: { code: "FORBIDDEN", httpStatus: 403 },
            },
          },
        ],
      }).as("createAgent");

      cy.findByRole("button", { name: "새로운 에이전트 생성" }).click();
      cy.findByLabelText("이름").type("한도 초과 테스트");
      cy.findByLabelText("역할 및 행동 지침").type("테스트 지침");
      cy.findByRole("button", { name: "등록" }).click();

      cy.wait("@createAgent");

      cy.assertUrl("/upgrade");
    });
  });

  context("에이전트 상세, 수정, 삭제", () => {
    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/trpc/agents.create",
        body: { name: TEST_AGENT_NAME, instructions: TEST_AGENT_INSTRUCTIONS },
      });

      cy.intercept("GET", "**/api/trpc/*agents.getMany*").as("getAgents");
      cy.visit("/agents");
      cy.wait("@getAgents");
    });

    it("에이전트 행 클릭 시 상세 페이지로 이동하고 에이전트 정보가 노출된다.", () => {
      cy.findByText(TEST_AGENT_NAME).should("be.visible").click();

      cy.location("pathname").should("match", /\/agents\/.+/);

      cy.findByRole("heading", { name: TEST_AGENT_NAME }).should("be.visible");
      cy.findByText("역할 및 행동 지침").should("be.visible");
      cy.findByText(TEST_AGENT_INSTRUCTIONS).should("be.visible");
    });

    it("에이전트를 수정하면 이름이 변경되고 성공 토스트가 노출된다.", () => {
      const UPDATED_NAME = "[E2E] 수정된 에이전트";

      cy.findByText(TEST_AGENT_NAME).should("be.visible").click();

      cy.findByRole("button", { name: "에이전트 옵션" }).click();
      cy.findByRole("menuitem", { name: "수정" }).click();

      cy.findByText("에이전트 수정").should("be.visible");
      cy.findByLabelText("이름").clear().type(UPDATED_NAME);
      cy.findByRole("button", { name: "수정" }).click();

      cy.findByText("에이전트가 수정되었어요.").should("be.visible");
      cy.findByRole("heading", { name: UPDATED_NAME }).should("be.visible");
    });

    it("삭제 확인 다이얼로그에서 취소 클릭 시 에이전트가 유지된다.", () => {
      cy.findByText(TEST_AGENT_NAME).should("be.visible").click();

      cy.findByRole("button", { name: "에이전트 옵션" }).click();
      cy.findByRole("menuitem", { name: "삭제" }).click();

      cy.findByText("에이전트를 삭제하시겠습니까?").should("be.visible");
      cy.findByRole("button", { name: "취소" }).click();
      cy.findByText("에이전트를 삭제하시겠습니까?").should("not.exist");
      cy.findByRole("heading", { name: TEST_AGENT_NAME }).should("be.visible");
    });

    it("삭제 확인 다이얼로그에서 확인 클릭 시 에이전트가 삭제되고 목록 페이지로 이동한다.", () => {
      cy.findByText(TEST_AGENT_NAME).should("be.visible").click();

      cy.findByRole("button", { name: "에이전트 옵션" }).click();
      cy.findByRole("menuitem", { name: "삭제" }).click();
      cy.findByRole("button", { name: "확인" }).click();

      cy.assertUrl("/agents");
      cy.findByText(TEST_AGENT_NAME).should("not.exist");
    });
  });
});
