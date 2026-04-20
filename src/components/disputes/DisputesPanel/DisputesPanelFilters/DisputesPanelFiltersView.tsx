import { Button, Card, Group, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import styles from "./DisputesPanelFiltersView.module.css";

type DisputesPanelFiltersViewProps = {
	query?: string;
	statusFilter?: string;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

const STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "Todas" },
	{ value: "aberta", label: "Aberta" },
	{ value: "janela_votacao", label: "Votacao aberta" },
	{ value: "encerrada", label: "Votacao encerrada" },
	{ value: "resolvida", label: "Resolvida" },
] as const;

export function DisputesPanelFiltersView({
	query = "",
	statusFilter = "all",
	onQueryChange,
	onStatusFilterChange,
	onClearFilters,
}: DisputesPanelFiltersViewProps) {
	let feedbackText = "Nenhuma disputa aberta no momento.";

	if (query.trim().length > 0 || statusFilter !== "all") {
		feedbackText = "Nenhuma disputa encontrou este criterio.";
	}

	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.card}>
			<Stack gap="md">
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
					<TextInput
						label="Buscar disputa"
						description="Pesquise por motivo, participantes, status ou RPT."
						placeholder="Ex.: janela, cliente, 3 RPT"
						value={query}
						onChange={(event) => onQueryChange(event.currentTarget.value)}
					/>

					<Select
						label="Status"
						description="Filtra disputas pelo andamento atual."
						placeholder="Selecione um status"
						data={STATUS_FILTER_OPTIONS}
						value={statusFilter}
						onChange={onStatusFilterChange}
						clearable={false}
					/>
				</SimpleGrid>

				<Group justify="space-between" align="center" wrap="nowrap" className={styles.feedbackRow}>
					<Text size="sm" c="dimmed">
						{feedbackText}
					</Text>

					<Button variant="light" onClick={onClearFilters}>
						Limpar
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}
