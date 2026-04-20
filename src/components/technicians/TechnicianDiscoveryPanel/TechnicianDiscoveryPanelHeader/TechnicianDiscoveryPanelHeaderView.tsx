"use client";

import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelHeaderView.module.css";
import type { UserSummary } from "@/services/users";
import {
	getTechnicianDiscoveryPanelContractedLabel,
	getTechnicianDiscoveryPanelSelectedLabel,
} from "@/services/users/technicianDiscoveryPresentation";

type TechnicianDiscoveryPanelHeaderViewProps = {
	totalTechnicians: number;
	filteredTechniciansCount: number;
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	hasOpenOrder: boolean;
};

export function TechnicianDiscoveryPanelHeaderView({
	totalTechnicians,
	filteredTechniciansCount,
	selectedTechnician,
	contractedTechnician,
	hasOpenOrder,
}: TechnicianDiscoveryPanelHeaderViewProps) {
	const selectedLabel = getTechnicianDiscoveryPanelSelectedLabel(selectedTechnician);
	const contractedLabel = getTechnicianDiscoveryPanelContractedLabel(contractedTechnician, hasOpenOrder);

	let contractedBadge = null;

	if (contractedLabel) {
		contractedBadge = (
			<Badge variant="light" color="teal">
				{contractedLabel}
			</Badge>
		);
	}

	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.root}>
			<Stack gap="sm">
				<Stack gap={4}>
					<Text size="xs" tt="uppercase" fw={700} c="dimmed">
						Descoberta
					</Text>
					<Title order={1}>Encontre tecnicos elegiveis</Title>
					<Text size="sm" c="dimmed">
						O indice local mostra apenas tecnicos ativos. Saque remove a projecao, e mudanca de papel atualiza a visibilidade.
					</Text>
				</Stack>

				<Group gap="sm">
					<Badge variant="light">{totalTechnicians} cadastrados</Badge>
					<Badge variant="light">{filteredTechniciansCount} visiveis</Badge>
					<Badge variant="light">{selectedLabel}</Badge>
					{contractedBadge}
				</Group>
			</Stack>
		</Card>
	);
}

