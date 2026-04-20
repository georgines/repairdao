import { Card, Stack, Text } from "@mantine/core";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { formatServiceRequestBudget, formatServiceRequestStatus, getServiceRequestModalActionNotice, getServiceRequestModalHelperText } from "@/services/serviceRequests/serviceRequestPresentation";
import type { ServiceRequestsPanelAction } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";

type ServiceRequestsPanelModalDetailsViewProps = {
	requestModalRequest: ServiceRequestSummary;
	requestModalAction: ServiceRequestsPanelAction;
};

export function ServiceRequestsPanelModalDetailsView({
	requestModalRequest,
	requestModalAction,
}: ServiceRequestsPanelModalDetailsViewProps) {
	const helperText = getServiceRequestModalHelperText(requestModalAction);
	const notice = getServiceRequestModalActionNotice(
		requestModalAction,
		requestModalRequest.status,
		requestModalRequest.deliveryConfirmedAt,
	);

	let helperNode = null;
	if (helperText) {
		helperNode = <Text size="sm">{helperText}</Text>;
	}

	let noticeNode = null;
	if (notice) {
		noticeNode = <Text size="sm" c="dimmed">{notice}</Text>;
	}

	return (
		<Card withBorder radius="md" padding="md" shadow="none">
			<Stack gap="xs">
				<Text size="sm">Status: {formatServiceRequestStatus(requestModalRequest.status)}</Text>
				<Text size="sm">Orcamento: {formatServiceRequestBudget(requestModalRequest.budgetAmount)}</Text>
				{helperNode}
				{noticeNode}
			</Stack>
		</Card>
	);
}
