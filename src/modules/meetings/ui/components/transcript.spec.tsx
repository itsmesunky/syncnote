import { HttpResponse, http } from "msw";

import { render, screen } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { Transcript } from "./transcript";

const mockTranscript = [
  {
    speaker_id: "user-1",
    start_ts: 0,
    end_ts: 3000,
    text: "안녕하세요, 자기소개 부탁드립니다.",
    user: { name: "면접관", image: null },
  },
  {
    speaker_id: "user-2",
    start_ts: 5000,
    end_ts: 10000,
    text: "안녕하세요, 저는 5년차 프론트엔드 개발자입니다.",
    user: { name: "지원자", image: null },
  },
  {
    speaker_id: "user-1",
    start_ts: 12000,
    end_ts: 15000,
    text: "리액트 경험이 있으신가요?",
    user: { name: "면접관", image: null },
  },
];

beforeEach(() => {
  server.use(
    http.get("http://localhost/api/trpc/meetings.getTranscript", () => {
      return HttpResponse.json([{ result: { data: mockTranscript } }]);
    }),
  );
});

describe("Transcript 컴포넌트", () => {
  describe("데이터 렌더링", () => {
    it("발화자 이름이 렌더링되어야 한다.", async () => {
      render(<Transcript meetingId="meeting-1" />);

      // 면접관이 2번 발화하므로 2개
      expect(await screen.findAllByText("면접관")).toHaveLength(2);
      expect(screen.getByText("지원자")).toBeInTheDocument();
    });

    it("대화 내용이 렌더링되어야 한다.", async () => {
      render(<Transcript meetingId="meeting-1" />);

      expect(
        await screen.findByText("안녕하세요, 자기소개 부탁드립니다."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("안녕하세요, 저는 5년차 프론트엔드 개발자입니다."),
      ).toBeInTheDocument();
    });
  });

  describe("검색 필터링", () => {
    it("검색어와 매칭되는 항목만 렌더링되어야 한다.", async () => {
      const { user } = render(<Transcript meetingId="meeting-1" />);

      await screen.findByText("안녕하세요, 자기소개 부탁드립니다.");

      await user.type(screen.getByPlaceholderText("내용을 검색해 보세요"), "리액트");

      // 매칭되지 않는 항목 제거 확인
      expect(
        screen.queryByText("안녕하세요, 자기소개 부탁드립니다."),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("안녕하세요, 저는 5년차 프론트엔드 개발자입니다."),
      ).not.toBeInTheDocument();
      // 면접관 발화 2개 중 "리액트" 포함된 1개만 남음
      expect(screen.getAllByText("면접관")).toHaveLength(1);
    });

    it("검색어를 지우면 전체 항목이 다시 렌더링되어야 한다.", async () => {
      const { user } = render(<Transcript meetingId="meeting-1" />);

      await screen.findByText("안녕하세요, 자기소개 부탁드립니다.");

      const input = screen.getByPlaceholderText("내용을 검색해 보세요");
      await user.type(input, "리액트");
      await user.clear(input);

      expect(
        screen.getByText("안녕하세요, 자기소개 부탁드립니다."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("안녕하세요, 저는 5년차 프론트엔드 개발자입니다."),
      ).toBeInTheDocument();
      expect(screen.getByText("리액트 경험이 있으신가요?")).toBeInTheDocument();
    });
  });
});
