import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import type { DisputaContratoDominio } from "@/services/blockchain/adapters";
import { statusColor, statusLabel } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import styles from "./DisputesPanelModalHeaderView.module.css";

type DisputesPanelModalHeaderViewProps = {
	disputeTitle: string;
	disputeSubtitle: string;
	status?: DisputaContratoDominio["estado"];
};

export function DisputesPanelModalHeaderView({ disputeTitle, disputeSubtitle, status }: DisputesPanelModalHeaderViewProps) {
	return (
		<Stack gap={4} className={styles.root}>
			<Text size="sm" c="dimmed">
				{disputeSubtitle}
			</Text>
			<Group justify="space-between" align="flex-start">
				<Badge variant="light" color={statusColor(status)}>
					{statusLabel(status)}
				</Badge>
			</Group>
			<Title order={4}>{disputeTitle}</Title>
		</Stack>
	);
}

