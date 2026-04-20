import { Modal, Stack } from "@mantine/core";
import { ServiceRequestsPanelModalDetails } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalDetails/ServiceRequestsPanelModalDetails";
import { ServiceRequestsPanelModalActions } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalActions/ServiceRequestsPanelModalActions";
import { ServiceRequestsPanelModalHeader } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalHeader/ServiceRequestsPanelModalHeader";
import { ServiceRequestsPanelModalField } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelModalField/ServiceRequestsPanelModalField";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";
import { getServiceRequestModalTitle } from "@/services/serviceRequests/serviceRequestPresentation";

export function ServiceRequestsPanelModalView(props: ServiceRequestsPanelModalProps) {
	const { requestModalOpened, requestModalRequest } = props;
	const modalTitle = props.requestModalAction ? getServiceRequestModalTitle(props.requestModalAction) : "Detalhes da ordem";
	const modalContent = requestModalRequest ? (
		<Stack gap="md">
			<ServiceRequestsPanelModalHeader requestModalRequest={requestModalRequest} />
			<ServiceRequestsPanelModalDetails requestModalRequest={requestModalRequest} requestModalAction={props.requestModalAction ?? "details"} />
			<ServiceRequestsPanelModalField {...props} />
			<ServiceRequestsPanelModalActions {...props} />
		</Stack>
	) : null;

	return (
		<Modal
			opened={requestModalOpened}
			onClose={props.onCloseRequestModal}
			title={modalTitle}
			size="md"
			centered
			overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
			withinPortal
		>
			{modalContent}
		</Modal>
	);
}
