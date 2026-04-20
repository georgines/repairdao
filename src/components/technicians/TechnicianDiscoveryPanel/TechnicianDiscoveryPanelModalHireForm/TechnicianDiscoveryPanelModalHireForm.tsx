"use client";

import { TechnicianDiscoveryPanelModalHireFormView } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelModalHireForm/TechnicianDiscoveryPanelModalHireFormView";

type TechnicianDiscoveryPanelModalHireFormProps = {
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
};

export function TechnicianDiscoveryPanelModalHireForm({
	serviceDescription,
	submittingRequest,
	requestError,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
}: TechnicianDiscoveryPanelModalHireFormProps) {
	return (
		<TechnicianDiscoveryPanelModalHireFormView
			serviceDescription={serviceDescription}
			submittingRequest={submittingRequest}
			requestError={requestError}
			onCloseTechnicianModal={onCloseTechnicianModal}
			onServiceDescriptionChange={onServiceDescriptionChange}
			onConfirmTechnicianHire={onConfirmTechnicianHire}
		/>
	);
}

