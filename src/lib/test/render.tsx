import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

import { TRPCProvider } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createTestTRPCClient = () =>
  createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost/api/trpc",
      }),
    ],
  });

const customRender = (component: ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) => {
  const user = userEvent.setup();
  const queryClient = createTestQueryClient();
  const trpcClient = createTestTRPCClient();

  return {
    user,
    queryClient,
    ...render(
      <NuqsTestingAdapter>
        <QueryClientProvider client={queryClient}>
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            {component}
          </TRPCProvider>
        </QueryClientProvider>
      </NuqsTestingAdapter>,
      options,
    ),
  };
};

export * from "@testing-library/react";
export { customRender as render };
