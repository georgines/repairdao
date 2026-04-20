import { Stack, Text } from "@mantine/core";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelModalHeaderViewProps = {
	requestModalRequest: ServiceRequestSummary;
};

export function ServiceRequestsPanelModalHeaderView({ requestModalRequest }: ServiceRequestsPanelModalHeaderViewProps) {
	return (
		<Stack gap={4}>
			<Text fw={600}>{requestModalRequest.description}</Text>
			<Text size="sm" c="dimmed">
				Cliente: {requestModalRequest.clientName}
			</Text>
			<Text size="sm" c="dimmed">
				Tecnico: {requestModalRequest.technicianName}
			</Text>
		</Stack>
	);
}
