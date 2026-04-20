"use client";

import { Stack } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelView.module.css";
import { TechnicianDiscoveryPanelHeader } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelHeader/TechnicianDiscoveryPanelHeader";
import { TechnicianDiscoveryPanelFilters } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelFilters/TechnicianDiscoveryPanelFilters";
import { TechnicianDiscoveryPanelTable } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTable/TechnicianDiscoveryPanelTable";
import { TechnicianDiscoveryPanelModal } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModal/TechnicianDiscoveryPanelModal";
import type { UserSummary } from "@/services/users";
import { getTechnicianDiscoveryPanelResultsNotice } from "@/services/users/technicianDiscoveryPresentation";

export type TechnicianDiscoveryPanelViewProps = {
	query: string;
	minReputation: number;
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	hasOpenOrder: boolean;
	canHire: boolean;
	technicianModalMode: "details" | "hire" | null;
	technicianModalOpened: boolean;
	hasResults: boolean;
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
	onClearFilters: () => void;
};

export function TechnicianDiscoveryPanelView({
	query,
	minReputation,
	totalTechnicians,
	filteredTechnicians,
	selectedTechnician,
	contractedTechnician,
	hasOpenOrder,
	canHire,
	technicianModalMode,
	technicianModalOpened,
	hasResults,
	serviceDescription,
	submittingRequest,
	requestError,
	onQueryChange,
	onMinReputationChange,
	onSelectTechnician,
	onHireTechnician,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
	onClearFilters,
}: TechnicianDiscoveryPanelViewProps) {
	const resultsNotice = getTechnicianDiscoveryPanelResultsNotice(hasResults);

	return (
		<Stack gap="lg" className={styles.root}>
			<TechnicianDiscoveryPanelHeader
				totalTechnicians={totalTechnicians}
				filteredTechniciansCount={filteredTechnicians.length}
				selectedTechnician={selectedTechnician}
				contractedTechnician={contractedTechnician}
				hasOpenOrder={hasOpenOrder}
			/>

			<TechnicianDiscoveryPanelFilters
				query={query}
				minReputation={minReputation}
				resultsNotice={resultsNotice}
				onQueryChange={onQueryChange}
				onMinReputationChange={onMinReputationChange}
				onClearFilters={onClearFilters}
			/>

			<TechnicianDiscoveryPanelTable
				technicians={filteredTechnicians}
				selectedTechnician={selectedTechnician}
				canHire={canHire}
				onSelectTechnician={onSelectTechnician}
				onHireTechnician={onHireTechnician}
			/>

			<TechnicianDiscoveryPanelModal
				technicianModalMode={technicianModalMode}
				technicianModalOpened={technicianModalOpened}
				selectedTechnician={selectedTechnician}
				serviceDescription={serviceDescription}
				submittingRequest={submittingRequest}
				requestError={requestError}
				onCloseTechnicianModal={onCloseTechnicianModal}
				onServiceDescriptionChange={onServiceDescriptionChange}
				onConfirmTechnicianHire={onConfirmTechnicianHire}
			/>
		</Stack>
	);
}
