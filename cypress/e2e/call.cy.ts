describe("면접 시작 플로우", () => {
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

  context("면접 상세 페이지에서 시작", () => {
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
          cy.wrap(meetingRes.body.result.data.id).as("meetingId");
        });
      });
    });

    it("'면접 시작하기' 버튼 클릭 시 /call/[meetingId]로 이동한다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("link", { name: "면접 시작하기" }).should("be.visible").click();
        cy.location("pathname", { timeout: 10000 }).should("match", /\/call\/.+/);
      });
    });

    it("'면접 시작하기' 버튼 클릭 후 이동한 URL의 meetingId가 면접 ID와 일치한다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/meetings/${meetingId}`);
        cy.findByRole("link", { name: "면접 시작하기" }).should("be.visible").click();
        cy.location("pathname").should("eq", `/call/${meetingId}`);
      });
    });
  });

  context("/call 페이지 상태별 접근", () => {
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
          cy.wrap(meetingRes.body.result.data.id).as("meetingId");
        });
      });
    });

    it("upcoming 상태 면접에 접속하면 로딩 화면이 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.visit(`/call/${meetingId}`);
        cy.get(".animate-spin").should("exist");
      });
    });

    it("active 상태 면접에 접속하면 이미 진행 중이라는 안내가 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.request({
          method: "POST",
          url: "/api/trpc/meetings.setTestMeetingStatus",
          body: { id: meetingId, status: "active" },
        });

        cy.visit(`/call/${meetingId}`);
        cy.findByText("면접이 진행 중입니다.").should("be.visible");
      });
    });

    it("completed 상태 면접에 접속하면 종료된 면접이라는 안내가 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.request({
          method: "POST",
          url: "/api/trpc/meetings.setTestMeetingStatus",
          body: { id: meetingId, status: "completed" },
        });

        cy.visit(`/call/${meetingId}`);
        cy.findByText("종료된 면접입니다.").should("be.visible");
      });
    });

    it("processing 상태 면접에 접속하면 종료된 면접이라는 안내가 노출된다.", () => {
      cy.get("@meetingId").then((meetingId) => {
        cy.request({
          method: "POST",
          url: "/api/trpc/meetings.setTestMeetingStatus",
          body: { id: meetingId, status: "processing" },
        });

        cy.visit(`/call/${meetingId}`);
        cy.findByText("종료된 면접입니다.").should("be.visible");
      });
    });
  });
});
