"use client";

import { useMemo } from "react";
import { buildDisputesPanelModalActionKind, type BuildDisputesPanelModalActionKindInput, type DisputesPanelModalActionKind } from "@/services/disputes/disputesPanelModal";

export function useDisputesPanelModalActions(input: BuildDisputesPanelModalActionKindInput): DisputesPanelModalActionKind {
	return useMemo(() => buildDisputesPanelModalActionKind(input), [input.connected, input.selectedCanResolve, input.selectedCanSendEvidence, input.selectedCanVote, input.selectedResolved]);
}
