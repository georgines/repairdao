import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

export type DisputeItem = {
	request: ServiceRequestSummary;
	contract: DisputaContratoDominio | null;
};

export type DisputesPanelHeaderProps = {
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	onRefresh: () => void;
};

export type DisputesPanelFiltersProps = {
	query: string;
	statusFilter: "all" | DisputaContratoDominio["estado"];
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

export type DisputesPanelTableProps = {
	visibleDisputes: DisputeItem[];
	selectedDisputeId: number | null;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export type DisputesPanelModalProps = {
	connected: boolean;
	hasVotingTokens: boolean;
	busyDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
	onCloseDispute: () => void;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
	walletAddress: string | null;
};

export type DisputesPanelViewState = {
	header: DisputesPanelHeaderProps;
	filters: DisputesPanelFiltersProps;
	table: DisputesPanelTableProps;
	modal: DisputesPanelModalProps;
	error: string | null;
};

export type DisputesPanelViewProps = DisputesPanelViewState;
