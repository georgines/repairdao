"use client";

import { Stack } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelView.module.css";
import { TechnicianDiscoveryPanelHeader } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelHeader/TechnicianDiscoveryPanelHeader";
import { TechnicianDiscoveryPanelFilters } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelFilters/TechnicianDiscoveryPanelFilters";
import { TechnicianDiscoveryPanelTable } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTable/TechnicianDiscoveryPanelTable";
import { TechnicianDiscoveryPanelModal } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModal/TechnicianDiscoveryPanelModal";
import type { UserSummary } from "@/services/users";
import { getTechnicianDiscoveryPanelResultsNotice } from "@/services/users/technicianDiscoveryPresentation";

export type TechnicianDiscoveryPanelHeaderProps = {
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	hasOpenOrder: boolean;
};

export type TechnicianDiscoveryPanelFiltersProps = {
	query: string;
	minReputation: number;
	hasResults: boolean;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onClearFilters: () => void;
};

export type TechnicianDiscoveryPanelTableProps = {
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	canHire: boolean;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
};

export type TechnicianDiscoveryPanelModalProps = {
	technicianModalMode: "details" | "hire" | null;
	technicianModalOpened: boolean;
	selectedTechnician: UserSummary | null;
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
};

export type TechnicianDiscoveryPanelViewProps = {
	header: TechnicianDiscoveryPanelHeaderProps;
	filters: TechnicianDiscoveryPanelFiltersProps;
	table: TechnicianDiscoveryPanelTableProps;
	modal: TechnicianDiscoveryPanelModalProps;
};

export function TechnicianDiscoveryPanelView({ header, filters, table, modal }: TechnicianDiscoveryPanelViewProps) {
	const resultsNotice = getTechnicianDiscoveryPanelResultsNotice(filters.hasResults);

	return (
		<Stack gap="lg" className={styles.root}>
			<TechnicianDiscoveryPanelHeader
				totalTechnicians={header.totalTechnicians}
				filteredTechniciansCount={header.filteredTechnicians.length}
				selectedTechnician={header.selectedTechnician}
				contractedTechnician={header.contractedTechnician}
				hasOpenOrder={header.hasOpenOrder}
			/>

			<TechnicianDiscoveryPanelFilters
				query={filters.query}
				minReputation={filters.minReputation}
				resultsNotice={resultsNotice}
				onQueryChange={filters.onQueryChange}
				onMinReputationChange={filters.onMinReputationChange}
				onClearFilters={filters.onClearFilters}
			/>

			<TechnicianDiscoveryPanelTable
				technicians={table.filteredTechnicians}
				selectedTechnician={table.selectedTechnician}
				canHire={table.canHire}
				onSelectTechnician={table.onSelectTechnician}
				onHireTechnician={table.onHireTechnician}
			/>

			<TechnicianDiscoveryPanelModal
				technicianModalMode={modal.technicianModalMode}
				technicianModalOpened={modal.technicianModalOpened}
				selectedTechnician={modal.selectedTechnician}
				serviceDescription={modal.serviceDescription}
				submittingRequest={modal.submittingRequest}
				requestError={modal.requestError}
				onCloseTechnicianModal={modal.onCloseTechnicianModal}
				onServiceDescriptionChange={modal.onServiceDescriptionChange}
				onConfirmTechnicianHire={modal.onConfirmTechnicianHire}
			/>
		</Stack>
	);
}
