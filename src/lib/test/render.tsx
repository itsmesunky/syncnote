import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const customRender = (component: ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) => {
  const user = userEvent.setup();

  return {
    user,
    ...render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>, options),
  };
};

export * from "@testing-library/react";
export { customRender as render };
