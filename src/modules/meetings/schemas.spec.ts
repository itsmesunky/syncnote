import { meetingsInsertSchema, meetingsUpdateSchema } from "./schemas";

describe("meetingsInsertSchema 단위 테스트", () => {
  it("면접 이름(name)이 작성되지 않으면 에러를 반환해야 한다.", () => {
    const result = meetingsInsertSchema.safeParse({
      name: " ",
      agentId: "1",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const nameError = result.error.issues.find((issue) => issue.path[0] === "name");
      expect(nameError?.message).toBe("면접 이름은 필수 입력 사항입니다.");
    }
  });

  it("에이전트(agentId)가 선택되지 않으면 에러를 반환해야 한다.", () => {
    const result = meetingsInsertSchema.safeParse({
      name: "테스트 면접",
      agentId: " ",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const agentIdError = result.error.issues.find((issue) => issue.path[0] === "agentId");
      expect(agentIdError?.message).toBe("에이전트는 필수 입력 사항입니다.");
    }
  });

  it("유효한 데이터가 입력되면 새로운 면접이 생성되어야 한다.", () => {
    const result = meetingsInsertSchema.safeParse({
      name: "테스트 면접",
      agentId: "1",
    });

    expect(result.success).toBe(true);
  });
});

describe("meetingsUpdateSchema 단위 테스트", () => {
  it("면접 id가 존재하지 않으면 에러를 반환해야 한다.", () => {
    const result = meetingsUpdateSchema.safeParse({
      id: " ",
      name: "테스트 면접",
      agentId: "1",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const meetingIdError = result.error.issues.find((issue) => issue.path[0] === "id");
      expect(meetingIdError?.message).toBe("면접 ID는 필수 입력 사항입니다.");
    }
  });

  it("유효한 데이터가 입력되면 면접이 수정되어야 한다.", () => {
    const result = meetingsUpdateSchema.safeParse({
      id: "1",
      name: "테스트 면접(수정)",
      agentId: "1",
    });

    expect(result.success).toBe(true);
  });
});
