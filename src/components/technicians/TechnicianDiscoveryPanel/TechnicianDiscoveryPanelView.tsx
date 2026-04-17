import { Badge, Box, Button, Card, Group, NumberInput, SimpleGrid, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import type { UserSummary } from "@/services/users";

export type TechnicianDiscoveryPanelViewProps = {
	query: string;
	minReputation: number;
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	hasResults: boolean;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onSelectTechnician: (address: string) => void;
	onClearFilters: () => void;
};

function formatarSituacao(tecnico: UserSummary) {
	if (!tecnico.isActive) {
		return "inativo";
	}

	return tecnico.isEligible ? "elegivel" : "fora da busca";
}

export function TechnicianDiscoveryPanelView({
	query,
	minReputation,
	totalTechnicians,
	filteredTechnicians,
	selectedTechnician,
	hasResults,
	onQueryChange,
	onMinReputationChange,
	onSelectTechnician,
	onClearFilters,
}: TechnicianDiscoveryPanelViewProps) {
	return (
		<Stack gap="lg">
			<Card withBorder radius="sm" shadow="none" padding="lg">
				<Stack gap="sm">
					<Stack gap={4}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Descoberta
						</Text>
						<Title order={1}>Encontre tecnicos elegiveis</Title>
						<Text size="sm" c="dimmed">
							O indice local mostra apenas tecnicos ativos. Saque remove a projeção, e mudanca de papel atualiza a visibilidade.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{totalTechnicians} cadastrados</Badge>
						<Badge variant="light">{filteredTechnicians.length} visiveis</Badge>
						<Badge variant="light">{selectedTechnician ? `selecionado: ${selectedTechnician.name}` : "nenhum selecionado"}</Badge>
					</Group>
				</Stack>
			</Card>

			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
				<Card withBorder radius="sm" shadow="none" padding="lg">
					<Stack gap="md">
						<TextInput
							label="Buscar tecnico"
							description="Pesquise por nome, endereco ou badge."
							placeholder="Ex.: ana, 0xabc ou bronze"
							value={query}
							onChange={(event) => onQueryChange(event.currentTarget.value)}
						/>

						<NumberInput
							label="Reputacao minima"
							description="Filtra tecnicos com reputacao igual ou maior."
							value={minReputation}
							onChange={onMinReputationChange}
							min={0}
							step={1}
							hideControls
						/>

						<Group justify="space-between" wrap="nowrap">
							<Text size="sm" c="dimmed">
								{hasResults ? "Use a lista para comparar tecnicos." : "Nenhum tecnico encontrou este criterio."}
							</Text>

							<Button variant="light" onClick={onClearFilters}>
								Limpar
							</Button>
						</Group>

						<Box style={{ overflowX: "auto" }}>
							<Table withTableBorder withColumnBorders highlightOnHover tabularNums>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Nome</Table.Th>
										<Table.Th>Papel</Table.Th>
										<Table.Th>Nivel</Table.Th>
										<Table.Th>Reputacao</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th>Acoes</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{filteredTechnicians.map((tecnico) => (
										<Table.Tr key={tecnico.address} data-selected={selectedTechnician?.address === tecnico.address}>
											<Table.Td>
												<Stack gap={0}>
													<Text fw={600}>{tecnico.name}</Text>
													<Text size="xs" c="dimmed">
														{tecnico.address}
													</Text>
												</Stack>
											</Table.Td>
											<Table.Td>{tecnico.role}</Table.Td>
											<Table.Td>{tecnico.badgeLevel}</Table.Td>
											<Table.Td>{tecnico.reputation}</Table.Td>
											<Table.Td>{formatarSituacao(tecnico)}</Table.Td>
											<Table.Td>
												<Button size="xs" variant="light" onClick={() => onSelectTechnician(tecnico.address)}>
													Ver detalhes
												</Button>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Box>
					</Stack>
				</Card>

				<Card withBorder radius="sm" shadow="none" padding="lg">
					<Stack gap="sm">
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Detalhes
						</Text>

						{selectedTechnician ? (
							<>
								<Title order={3}>{selectedTechnician.name}</Title>
								<Text size="sm" c="dimmed">
									{selectedTechnician.address}
								</Text>

								<Group gap="xs">
									<Badge variant="light">{selectedTechnician.role}</Badge>
									<Badge variant="light">{selectedTechnician.badgeLevel}</Badge>
									<Badge variant="light">reputacao {selectedTechnician.reputation}</Badge>
								</Group>

								<Stack gap={4}>
									<Text size="sm">Nivel de deposito: {selectedTechnician.depositLevel}</Text>
									<Text size="sm">Ativo: {selectedTechnician.isActive ? "sim" : "nao"}</Text>
									<Text size="sm">Elegivel: {selectedTechnician.isEligible ? "sim" : "nao"}</Text>
									<Text size="sm">Atualizado em: {selectedTechnician.updatedAt}</Text>
								</Stack>
							</>
						) : (
							<Text size="sm" c="dimmed">
								Selecione um tecnico na tabela para ver os dados completos.
							</Text>
						)}
					</Stack>
				</Card>
			</SimpleGrid>
		</Stack>
	);
}
