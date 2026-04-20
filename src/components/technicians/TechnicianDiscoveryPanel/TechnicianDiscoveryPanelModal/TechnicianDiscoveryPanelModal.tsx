"use client";

import { TechnicianDiscoveryPanelModalView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModal/TechnicianDiscoveryPanelModalView";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelModalProps = {
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

export function TechnicianDiscoveryPanelModal({
	technicianModalMode,
	technicianModalOpened,
	selectedTechnician,
	serviceDescription,
	submittingRequest,
	requestError,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
}: TechnicianDiscoveryPanelModalProps) {
	return (
		<TechnicianDiscoveryPanelModalView
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
	);
}

