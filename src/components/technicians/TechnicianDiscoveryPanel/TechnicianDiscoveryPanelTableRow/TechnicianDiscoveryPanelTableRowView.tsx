"use client";

import { Button, Group, Stack, Table, Text } from "@mantine/core";
import { RatingSummary } from "@/components/ratings/RatingSummary";
import type { UserSummary } from "@/services/users";
import {
	getTechnicianRoleLabel,
	getTechnicianSituationLabel,
} from "@/services/users/technicianDiscoveryPresentation";

type TechnicianDiscoveryPanelTableRowViewProps = {
	technician: UserSummary;
	selected: boolean;
	canHire: boolean;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
};

export function TechnicianDiscoveryPanelTableRowView({
	technician,
	selected,
	canHire,
	onSelectTechnician,
	onHireTechnician,
}: TechnicianDiscoveryPanelTableRowViewProps) {
	let hireButtonTitle = "A contratacao fica disponivel apenas para clientes sem ordem aberta";

	if (canHire) {
		hireButtonTitle = "Abrir a contratacao deste tecnico";
	}

	return (
		<Table.Tr data-selected={selected}>
			<Table.Td>
				<Stack gap={0}>
					<Text fw={600}>{technician.name}</Text>
					<Text size="xs" c="dimmed">
						{technician.address}
					</Text>
				</Stack>
			</Table.Td>
			<Table.Td>{technician.expertiseArea ?? "-"}</Table.Td>
			<Table.Td>{getTechnicianRoleLabel(technician.role)}</Table.Td>
			<Table.Td>{technician.badgeLevel}</Table.Td>
			<Table.Td>
				<RatingSummary address={technician.address} />
			</Table.Td>
			<Table.Td>{getTechnicianSituationLabel(technician)}</Table.Td>
			<Table.Td>
				<Group gap="xs" wrap="nowrap">
					<Button size="xs" variant="light" onClick={() => onSelectTechnician(technician.address)}>
						Detalhes
					</Button>
					<Button
						size="xs"
						onClick={() => onHireTechnician(technician.address)}
						disabled={!canHire}
						title={hireButtonTitle}
					>
						Contratar tecnico
					</Button>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}
