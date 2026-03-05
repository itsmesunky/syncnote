import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // TODO: 환경 변수 분기 처리
  server: "sandbox",
});
