"use client";

import { useState } from "react";

import { DEFAULT_PAGE } from "@/constants";

import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { NewAgentDialog } from "./new-agent-dialog";

export const AgentsListHeader = () => {
  const [filters, setFilters] = useAgentsFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({ search: "", page: DEFAULT_PAGE });
  };

  return (
    <>
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};
