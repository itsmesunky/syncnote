describe("면접 관리", () => {
  const TEST_MEETING_NAME = "[E2E] 테스트 면접";
  const TEST_AGENT_NAME = "[E2E] 테스트 에이전트";
  const TEST_AGENT_INSTRUCTIONS = "E2E 테스트용 에이전트입니다.";

  beforeEach(() => {
    cy.login();
    cy.request("POST", "/api/trpc/agents.cleanupTestAgents", {}).its("status").should("eq", 200);
    cy.request("POST", "/api/trpc/meetings.cleanupTestMeetings", {})
      .its("status")
      .should("eq", 200);
  });

  context("목록 페이지 기본 UI", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/trpc/*meetings.getMany*").as("getMeetings");
      cy.visit("/meetings");
      cy.wait("@getMeetings");
    });

    it("면접 목록 페이지에 접속하면 주요 UI 요소가 노출된다.", () => {
      cy.findByRole("button", { name: "새로운 면접 생성" }).should("be.visible");
      cy.findByPlaceholderText("면접명을 입력해 주세요").should("be.visible");
    });
  });

  context("면접 검색 및 필터", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/trpc/*meetings.getMany*").as("getMeetings");
      cy.visit("/meetings");
      cy.wait("@getMeetings");
    });

    it("검색어 입력 시 URL에 search 파라미터가 반영된다.", () => {
      cy.findByPlaceholderText("면접명을 입력해 주세요").type("테스트");
      cy.location("search").should("include", "search=");
    });

    it("검색어가 입력된 상태에서 초기화 버튼 클릭 시 검색어가 초기화된다.", () => {
      cy.findByPlaceholderText("면접명을 입력해 주세요").type("테스트");
      cy.findByRole("button", { name: "초기화" }).click();
      cy.findByPlaceholderText("면접명을 입력해 주세요").should("have.value", "");
      cy.location("search").should("not.include", "search=");
    });

    it("상태 필터 선택 시 URL에 status 파라미터가 반영된다.", () => {
      cy.findAllByLabelText("dialog-open-button").first().click();
      cy.findByRole("option", { name: "진행 전" }).click();
      cy.location("search").should("include", "status=");
    });
  });

  context("면접 생성", () => {
    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/trpc/agents.create",
        body: { name: TEST_AGENT_NAME, instructions: TEST_AGENT_INSTRUCTIONS },
      });

      cy.intercept("GET", "**/api/trpc/*agents.getMany*").as("getAgents");
      cy.visit("/meetings");
      cy.wait("@getAgents");
    });

    it("필수 필드 미입력 시 유효성 에러 메시지가 노출된다.", () => {
      cy.findByRole("button", { name: "새로운 면접 생성" }).click();
      cy.findByRole("button", { name: "등록" }).click();

      cy.findByText("면접 이름은 필수 입력 사항입니다.").should("exist");
      cy.findByText("에이전트는 필수 입력 사항입니다.").should("exist");
    });

    it("면접을 생성하면 목록에 추가되고 면접 상세 페이지로 이동한다.", () => {
      cy.intercept("POST", "**/api/trpc/meetings.create*").as("createMeeting");

      cy.findByRole("button", { name: "새로운 면접 생성" }).click();
      cy.findByLabelText("면접명").type(TEST_MEETING_NAME);
      cy.findAllByLabelText("dialog-open-button").last().click();
      cy.get("[data-slot='command-item']").contains(TEST_AGENT_NAME).click();
      cy.findByRole("button", { name: "등록" }).click();

      cy.wait("@createMeeting");

      cy.location("pathname", { timeout: 10000 }).should("match", /\/meetings\/.+/);
      cy.findByText(TEST_MEETING_NAME).should("be.visible");
    });

    it("무료 플랜 한도 초과 시 업그레이드 페이지로 이동한다.", () => {
      cy.intercept("POST", "**/api/trpc/meetings.create*", {
        statusCode: 403,
        body: [
          {
            error: {
              message: "무료 면접 한도에 도달했습니다.",
              code: -32600,
              data: { code: "FORBIDDEN", httpStatus: 403 },
            },
          },
        ],
      }).as("createMeeting");

      cy.findByRole("button", { name: "새로운 면접 생성" }).click();
      cy.findByLabelText("면접명").type("한도 초과 테스트");
      cy.findAllByLabelText("dialog-open-button").last().click();
      cy.get("[data-slot='command-item']").contains(TEST_AGENT_NAME).click();
      cy.findByRole("button", { name: "등록" }).click();

      cy.wait("@createMeeting");
      cy.assertUrl("/upgrade");
    });
  });

  context("면접 상세, 수정, 삭제", () => {
    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/trpc/agents.create",
        body: { name: TEST_AGENT_NAME, instructions: TEST_AGENT_INSTRUCTIONS },
      }).then((agentRes) => {
        const agentId = agentRes.body.result.data.id;
        return cy.request({
          method: "POST",
          url: "/api/trpc/meetings.create",
          body: { name: TEST_MEETING_NAME, agentId },
        });
      });

      cy.intercept("GET", "**/api/trpc/*meetings.getMany*").as("getMeetings");

      cy.visit("/meetings");
      cy.wait("@getMeetings");

      cy.findByText(TEST_MEETING_NAME).should("be.visible").click();
      cy.location("pathname", { timeout: 10000 }).should("match", /\/meetings\/.+/);
    });

    it("면접 행 클릭 시 상세 페이지로 이동하고 면접 정보가 노출된다.", () => {
      cy.findByRole("link", { name: TEST_MEETING_NAME }).should("be.visible");
      cy.findByText("아직 면접을 시작하지 않았어요.").should("be.visible");
      cy.findByRole("link", { name: "면접 시작하기" }).should("be.visible");
    });

    it("면접을 수정하면 이름이 변경되고 성공 토스트가 노출된다.", () => {
      cy.intercept("POST", "**/api/trpc/meetings.update*").as("updateMeeting");

      const UPDATED_NAME = "[E2E] 수정된 면접";

      cy.findByRole("button", { name: "면접 옵션" }).should("be.visible").click();
      cy.findByRole("menuitem", { name: "수정" }).should("be.visible").click();

      cy.findByText("면접 정보 수정").should("be.visible");
      cy.findByLabelText("면접명").clear().type(UPDATED_NAME);
      cy.findByRole("button", { name: "수정" }).click();

      cy.wait("@updateMeeting");
      cy.findByText("면접 정보가 수정되었어요.").should("be.visible");
      cy.findByRole("link", { name: UPDATED_NAME }).should("be.visible");
    });

    it("삭제 확인 다이얼로그에서 취소 클릭 시 면접이 유지된다.", () => {
      cy.findByRole("button", { name: "면접 옵션" }).should("be.visible").click();
      cy.findByRole("menuitem", { name: "삭제" }).should("be.visible").click();

      cy.findByText("면접을 삭제하시겠습니까?").should("be.visible");
      cy.findByRole("button", { name: "취소" }).click();
      cy.findByText("면접을 삭제하시겠습니까?").should("not.exist");
      cy.findByRole("link", { name: TEST_MEETING_NAME }).should("be.visible");
    });

    it("삭제 확인 다이얼로그에서 확인 클릭 시 면접이 삭제되고 목록 페이지로 이동한다.", () => {
      cy.findByRole("button", { name: "면접 옵션" }).should("be.visible").click();
      cy.findByRole("menuitem", { name: "삭제" }).should("be.visible").click();

      cy.findByText("면접을 삭제하시겠습니까?").should("be.visible");
      cy.findByRole("button", { name: "확인" }).click();

      cy.assertUrl("/meetings");
      cy.findByText(TEST_MEETING_NAME).should("not.exist");
    });
  });

  context("완료된 면접 상세", () => {
    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/trpc/agents.create",
        body: { name: TEST_AGENT_NAME, instructions: TEST_AGENT_INSTRUCTIONS },
      }).then((agentRes) => {
        const agentId = agentRes.body.result.data.id;
        cy.request({
          method: "POST",
          url: "/api/trpc/meetings.create",
          body: { name: TEST_MEETING_NAME, agentId },
        }).then((meetingRes) => {
          const meetingId = meetingRes.body.result.data.id;
          cy.request({
            method: "POST",
            url: "/api/trpc/meetings.setTestMeetingStatus",
            body: { id: meetingId, status: "completed" },
          });
          cy.wrap(meetingId).as("meetingId");
        });
      });
    });

    it("완료된 면접 상세 페이지에 접속하면 4개의 탭이 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("tab", { name: /요약/ }).should("be.visible");
        cy.findByRole("tab", { name: /대화 내용/ }).should("be.visible");
        cy.findByRole("tab", { name: /녹화본/ }).should("be.visible");
        cy.findByRole("tab", { name: /Ask AI/ }).should("be.visible");
      });
    });

    it("기본 탭은 요약이며 면접명과 에이전트명이 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("tab", { name: /요약/ }).should("have.attr", "data-state", "active");
        cy.findByRole("heading", { name: TEST_MEETING_NAME }).should("be.visible");
        cy.findByText(TEST_AGENT_NAME).should("be.visible");
      });
    });

    it("대화 내용 탭 클릭 시 transcript 검색 입력창이 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("tab", { name: /대화 내용/ }).click();
        cy.findByPlaceholderText("내용을 검색해 보세요").should("be.visible");
      });
    });

    it("녹화본 탭 클릭 시 video 요소가 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("tab", { name: /녹화본/ }).click();
        cy.get("video").should("exist");
      });
    });
  });
});
