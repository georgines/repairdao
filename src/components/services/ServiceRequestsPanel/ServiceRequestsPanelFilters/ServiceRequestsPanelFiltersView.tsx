import { Button, Card, Group, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import styles from "./ServiceRequestsPanelFiltersView.module.css";
import { getServiceRequestPanelStatusMessage } from "@/services/serviceRequests/serviceRequestPresentation";
import type { ServiceRequestStatus } from "@/services/serviceRequests";

type ServiceRequestsPanelFiltersViewProps = {
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	visibleRequests: number;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
};

const STATUS_OPTIONS = [
	{ value: "all", label: "Todas" },
	{ value: "aberta", label: "Abertas" },
	{ value: "aceita", label: "Aceitas" },
	{ value: "orcada", label: "Aguardando pagamento" },
	{ value: "aceito_cliente", label: "Pagas" },
	{ value: "concluida", label: "Concluidas" },
	{ value: "disputada", label: "Em disputa" },
];

export function ServiceRequestsPanelFiltersView({
	query,
	statusFilter,
	visibleRequests,
	onQueryChange,
	onStatusFilterChange,
	onClearFilters,
}: ServiceRequestsPanelFiltersViewProps) {
	const statusMessage = getServiceRequestPanelStatusMessage(visibleRequests > 0);

	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.card}>
			<Stack gap="md">
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
					<TextInput
						label="Buscar ordem"
						description="Pesquise por tecnico, descricao, status ou valor."
						placeholder="Ex.: troca de tomadas, 0xtec, orcada"
						value={query}
						onChange={(event) => onQueryChange(event.currentTarget.value)}
					/>

					<Select
						label="Status"
						description="Filtra ordens pelo andamento atual."
						placeholder="Selecione um status"
						data={STATUS_OPTIONS}
						value={statusFilter}
						onChange={onStatusFilterChange}
						clearable={false}
					/>
				</SimpleGrid>

				<Group justify="space-between" wrap="nowrap">
					<Text size="sm" c="dimmed">
						{statusMessage}
					</Text>

					<Button variant="light" onClick={onClearFilters}>
						Limpar
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}
