import { Badge, Button, Stack, Table, Text } from "@mantine/core";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import { statusColor, statusLabel } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import styles from "./DisputesPanelTableRowView.module.css";

type DisputesPanelTableRowViewProps = {
	dispute: DisputeItem;
	selected: boolean;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export function DisputesPanelTableRowView({ dispute, selected, onSelectDispute }: DisputesPanelTableRowViewProps) {
	const estado = dispute.contract?.estado;

	return (
		<Table.Tr data-selected={selected || undefined}>
			<Table.Td className={styles.titleCell}>
				<Stack gap={0} align="flex-start">
					<Text fw={600}>Disputa #{dispute.request.id}</Text>
					<Text size="xs" c="dimmed">
						{formatarEnderecoCurto(dispute.request.clientName)} x {formatarEnderecoCurto(dispute.request.technicianName)}
					</Text>
				</Stack>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Text fw={500} lineClamp={2}>
					{dispute.contract?.motivo ?? dispute.request.disputeReason ?? "-"}
				</Text>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Badge variant="light" color={statusColor(estado)}>
					{statusLabel(estado)}
				</Badge>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Button size="xs" variant="light" onClick={() => void onSelectDispute(dispute.request.id)}>
					Detalhes
				</Button>
			</Table.Td>
		</Table.Tr>
	);
}

