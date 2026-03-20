import { agentsInsertSchema, agentsUpdateSchema } from "./schemas";

describe("agentsInsertSchema 단위 테스트", () => {
  it("에이전트 이름을 입력하지 않으면 에러를 반환해야 한다.", () => {
    const result = agentsInsertSchema.safeParse({
      name: " ",
      instructions: "3년차 프론트엔드 개발자를 인터뷰하는 면접관",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const nameError = result.error.issues.find((issue) => issue.path[0] === "name");
      expect(nameError?.message).toBe("이름은 필수 입력 사항입니다.");
    }
  });

  it("에이전트의 instructions를 작성하지 않으면 에러를 반환해야 한다.", () => {
    const result = agentsInsertSchema.safeParse({
      name: "테스트",
      instructions: " ",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const instructionsError = result.error.issues.find(
        (issue) => issue.path[0] === "instructions",
      );
      expect(instructionsError?.message).toBe(
        "에이전트가 수행해야 할 역할과 행동 지침을 구체적으로 작성해 주세요.",
      );
    }
  });

  it("유효한 데이터가 입력되면 에이전트가 생성되어야 한다.", () => {
    const result = agentsInsertSchema.safeParse({
      name: "테스트 에이전트",
      instructions: "3년차 프론트엔드 개발자를 인터뷰하는 면접관",
    });

    expect(result.success).toBe(true);
  });
});

describe("agentsUpdateSchema 단위 테스트", () => {
  it("에이전트 ID가 없는 경우, 에러를 반환해야 한다.", () => {
    const result = agentsUpdateSchema.safeParse({
      id: " ",
      name: "테스트 에이전트(수정)",
      instructions: "3년차 프론트엔드 개발자를 인터뷰하는 면접관(수정)",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const idError = result.error.issues.find((issue) => issue.path[0] === "id");
      expect(idError?.message).toBe("ID는 필수 입력 사항입니다.");
    }
  });

  it("유효한 데이터가 입력되면 에이전트가 수정되어야 한다.", () => {
    const result = agentsUpdateSchema.safeParse({
      id: "1",
      name: "테스트 에이전트(수정)",
      instructions: "3년차 프론트엔드 개발자를 인터뷰하는 면접관(수정)",
    });

    expect(result.success).toBe(true);
  });
});
