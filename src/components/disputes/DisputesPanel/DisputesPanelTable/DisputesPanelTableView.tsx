import { Box, Card, Table } from "@mantine/core";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelTableEmpty } from "@/components/disputes/DisputesPanel/DisputesPanelTableEmpty/DisputesPanelTableEmpty";
import { DisputesPanelTableRow } from "@/components/disputes/DisputesPanel/DisputesPanelTableRow/DisputesPanelTableRow";
import styles from "./DisputesPanelTableView.module.css";

type DisputesPanelTableViewProps = {
	visibleDisputes: DisputeItem[];
	selectedDisputeId: number | null;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export function DisputesPanelTableView({ visibleDisputes, selectedDisputeId, onSelectDispute }: DisputesPanelTableViewProps) {
	let tableContent = <DisputesPanelTableEmpty />;

	if (visibleDisputes.length > 0) {
		tableContent = (
			<Box className={styles.tableWrap}>
				<Table withTableBorder withColumnBorders highlightOnHover miw={760}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th className={styles.tableTitleCell}>Disputa</Table.Th>
							<Table.Th className={styles.tableHeadCell}>Motivo</Table.Th>
							<Table.Th className={styles.tableHeadCell}>Status</Table.Th>
							<Table.Th className={styles.tableHeadCell}>Acoes</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{visibleDisputes.map((dispute) => (
							<DisputesPanelTableRow
								key={dispute.request.id}
								dispute={dispute}
								selected={dispute.request.id === selectedDisputeId}
								onSelectDispute={onSelectDispute}
							/>
						))}
					</Table.Tbody>
				</Table>
			</Box>
		);
	}

	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.card}>
			{tableContent}
		</Card>
	);
}
