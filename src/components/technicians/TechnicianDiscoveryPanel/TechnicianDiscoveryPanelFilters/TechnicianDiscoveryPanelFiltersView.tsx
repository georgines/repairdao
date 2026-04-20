"use client";

import { Button, Card, Group, NumberInput, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import styles from "./TechnicianDiscoveryPanelFiltersView.module.css";

type TechnicianDiscoveryPanelFiltersViewProps = {
	query: string;
	minReputation: number;
	resultsNotice: string;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onClearFilters: () => void;
};

export function TechnicianDiscoveryPanelFiltersView({
	query,
	minReputation,
	resultsNotice,
	onQueryChange,
	onMinReputationChange,
	onClearFilters,
}: TechnicianDiscoveryPanelFiltersViewProps) {
	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.root}>
			<Stack gap="md">
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
					<TextInput
						label="Buscar tecnico"
						description="Pesquise por nome, endereco, badge ou area de atuacao."
						placeholder="Ex.: ana, 0xabc, bronze ou eletrica"
						value={query}
						onChange={(event) => onQueryChange(event.currentTarget.value)}
					/>

					<NumberInput
						label="Reputacao minima"
						description="Filtra tecnicos com reputacao igual ou maior."
						value={minReputation}
						min={0}
						clampBehavior="strict"
						onChange={onMinReputationChange}
					/>
				</SimpleGrid>

				<Group justify="space-between" wrap="nowrap">
					<Text size="sm" c="dimmed">
						{resultsNotice}
					</Text>

					<Button variant="light" onClick={onClearFilters}>
						Limpar
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}

