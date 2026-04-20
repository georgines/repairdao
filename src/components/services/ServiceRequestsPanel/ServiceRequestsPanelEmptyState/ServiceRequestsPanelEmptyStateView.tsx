import { Text } from "@mantine/core";
import styles from "./ServiceRequestsPanelEmptyStateView.module.css";
import { getServiceRequestsPanelEmptyStateMessage } from "@/services/serviceRequests/serviceRequestPresentation";

type ServiceRequestsPanelEmptyStateViewProps = {
	hasWallet: boolean;
	hasResults: boolean;
};

export function ServiceRequestsPanelEmptyStateView({ hasWallet, hasResults }: ServiceRequestsPanelEmptyStateViewProps) {
	const message = getServiceRequestsPanelEmptyStateMessage(hasWallet, hasResults);

	return (
		<Text size="sm" c="dimmed" className={styles.root}>
			{message}
		</Text>
	);
}
