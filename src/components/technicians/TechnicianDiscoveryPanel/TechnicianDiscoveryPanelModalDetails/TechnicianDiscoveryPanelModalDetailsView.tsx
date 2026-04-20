"use client";

import { Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelModalDetailsView.module.css";
import { RatingSummary } from "@/components/ratings/RatingSummary";
import type { UserSummary } from "@/services/users";
import {
	formatTechnicianDetail,
	getTechnicianRoleLabel,
} from "@/services/users/technicianDiscoveryPresentation";

type TechnicianDiscoveryPanelModalDetailsViewProps = {
	selectedTechnician: UserSummary;
};

export function TechnicianDiscoveryPanelModalDetailsView({
	selectedTechnician,
}: TechnicianDiscoveryPanelModalDetailsViewProps) {
	return (
		<Stack gap="md" className={styles.root}>
			<Stack gap={4}>
				<Title order={3}>{selectedTechnician.name}</Title>
				<Text size="sm" c="dimmed">
					{selectedTechnician.address}
				</Text>
			</Stack>

			<Group gap="xs">
				<Badge variant="light">{getTechnicianRoleLabel(selectedTechnician.role)}</Badge>
				<Badge variant="light">{selectedTechnician.badgeLevel}</Badge>
				<RatingSummary address={selectedTechnician.address} />
			</Group>

			<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
				<Text size="sm">Area: {formatTechnicianDetail(selectedTechnician.expertiseArea)}</Text>
				<Text size="sm">Ativo: {formatTechnicianDetail(selectedTechnician.isActive)}</Text>
				<Text size="sm">Elegivel: {formatTechnicianDetail(selectedTechnician.isEligible)}</Text>
				<Text size="sm">Atualizado em: {selectedTechnician.updatedAt}</Text>
			</SimpleGrid>
		</Stack>
	);
}

