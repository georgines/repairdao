"use client";

import { Button, Group, Modal, Stack } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelModalView.module.css";
import type { UserSummary } from "@/services/users";
import { TechnicianDiscoveryPanelModalDetails } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalDetails/TechnicianDiscoveryPanelModalDetails";
import { TechnicianDiscoveryPanelModalHireForm } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalHireForm/TechnicianDiscoveryPanelModalHireForm";
import { getTechnicianDiscoveryPanelModalTitle } from "@/services/users/technicianDiscoveryPresentation";

type TechnicianDiscoveryPanelModalViewProps = {
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

export function TechnicianDiscoveryPanelModalView({
	technicianModalMode,
	technicianModalOpened,
	selectedTechnician,
	serviceDescription,
	submittingRequest,
	requestError,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
}: TechnicianDiscoveryPanelModalViewProps) {
	let content = null;

	if (selectedTechnician) {
		if (technicianModalMode === "hire") {
			content = (
				<TechnicianDiscoveryPanelModalHireForm
					serviceDescription={serviceDescription}
					submittingRequest={submittingRequest}
					requestError={requestError}
					onCloseTechnicianModal={onCloseTechnicianModal}
					onServiceDescriptionChange={onServiceDescriptionChange}
					onConfirmTechnicianHire={onConfirmTechnicianHire}
				/>
			);
		} else {
			content = (
				<Stack gap="md" className={styles.root}>
					<TechnicianDiscoveryPanelModalDetails selectedTechnician={selectedTechnician} />
					<Group justify="flex-end">
						<Button variant="light" onClick={onCloseTechnicianModal}>
							Fechar
						</Button>
					</Group>
				</Stack>
			);
		}
	}

	return (
		<Modal
			opened={technicianModalOpened}
			onClose={onCloseTechnicianModal}
			title={getTechnicianDiscoveryPanelModalTitle(technicianModalMode)}
			size="lg"
			centered
			overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
			withinPortal
		>
			{content}
		</Modal>
	);
}

