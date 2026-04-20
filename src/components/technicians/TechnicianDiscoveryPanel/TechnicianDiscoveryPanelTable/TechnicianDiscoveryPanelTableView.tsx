"use client";

import { Box, Card, Table } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelTableView.module.css";
import { TechnicianDiscoveryPanelTableRow } from "@/components/technicians/TechnicianDiscoveryPanel/TechnicianDiscoveryPanelTableRow/TechnicianDiscoveryPanelTableRow";
import type { UserSummary } from "@/services/users";

type TechnicianDiscoveryPanelTableViewProps = {
	technicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	canHire: boolean;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
};

export function TechnicianDiscoveryPanelTableView({
	technicians,
	selectedTechnician,
	canHire,
	onSelectTechnician,
	onHireTechnician,
}: TechnicianDiscoveryPanelTableViewProps) {
	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.root}>
			<Box className={styles.scrollArea}>
				<Table withTableBorder withColumnBorders highlightOnHover tabularNums miw={960}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Nome</Table.Th>
							<Table.Th>Area</Table.Th>
							<Table.Th>Papel</Table.Th>
							<Table.Th>Nivel</Table.Th>
							<Table.Th>Avaliacoes do tecnico</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th>Acoes</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{technicians.map((technician) => (
							<TechnicianDiscoveryPanelTableRow
								key={technician.address}
								technician={technician}
								selected={selectedTechnician?.address === technician.address}
								canHire={canHire}
								onSelectTechnician={onSelectTechnician}
								onHireTechnician={onHireTechnician}
							/>
						))}
					</Table.Tbody>
				</Table>
			</Box>
		</Card>
	);
}

