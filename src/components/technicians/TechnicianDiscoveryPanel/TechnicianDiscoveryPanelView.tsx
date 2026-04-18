import {
	Badge,
	Box,
	Button,
	Card,
	Group,
	Modal,
	NumberInput,
	Rating,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
	Textarea,
	Title,
} from "@mantine/core";
import Link from "next/link";
import type { UserSummary } from "@/services/users";

export type TechnicianDiscoveryPanelViewProps = {
	query: string;
	minReputation: number;
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	hasOpenOrder: boolean;
	canHire: boolean;
	technicianModalMode: "details" | "hire" | null;
	technicianModalOpened: boolean;
	hasResults: boolean;
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
	onClearFilters: () => void;
};

function formatSituation(technician: UserSummary) {
	if (!technician.isActive) {
		return "inativo";
	}

	return technician.isEligible ? "elegivel" : "fora da busca";
}

function formatRole(role: UserSummary["role"]) {
	return role === "tecnico" ? "Tecnico" : "Cliente";
}

function formatDetail(value: string | number | boolean | null) {
	if (typeof value === "boolean") {
		return value ? "sim" : "nao";
	}

	return value ?? "-";
}

function formatReputationStars(reputation: number) {
	return Math.min(5, Math.max(0, Math.trunc(reputation)));
}

export function TechnicianDiscoveryPanelView({
	query,
	minReputation,
	totalTechnicians,
	filteredTechnicians,
	selectedTechnician,
	contractedTechnician,
	hasOpenOrder,
	canHire,
	technicianModalMode,
	technicianModalOpened,
	hasResults,
	serviceDescription,
	submittingRequest,
	requestError,
	onQueryChange,
	onMinReputationChange,
	onSelectTechnician,
	onHireTechnician,
	onCloseTechnicianModal,
	onServiceDescriptionChange,
	onConfirmTechnicianHire,
	onClearFilters,
}: TechnicianDiscoveryPanelViewProps) {
	const modalTitle =
		technicianModalMode === "hire" ? "Confirmar contratacao" : "Detalhes do tecnico";

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
							O indice local mostra apenas tecnicos ativos. Saque remove a projecao, e mudanca de papel atualiza a visibilidade.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{totalTechnicians} cadastrados</Badge>
						<Badge variant="light">{filteredTechnicians.length} visiveis</Badge>
						<Badge variant="light">
							{selectedTechnician ? `selecionado: ${selectedTechnician.name}` : "nenhum selecionado"}
						</Badge>
						{contractedTechnician ? (
							<Badge variant="light" color="teal">
								{hasOpenOrder ? `ordem aberta: ${contractedTechnician.name}` : `contratado: ${contractedTechnician.name}`}
							</Badge>
						) : null}
						<Button component={Link} href="/services" variant="light" size="xs">
							Servicos
						</Button>
					</Group>
				</Stack>
			</Card>

			<Card withBorder radius="sm" shadow="none" padding="lg">
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
							{hasResults ? "Use a lista para comparar tecnicos." : "Nenhum tecnico encontrou este criterio."}
						</Text>

						<Button variant="light" onClick={onClearFilters}>
							Limpar
						</Button>
					</Group>

					<Box style={{ overflowX: "auto" }}>
						<Table withTableBorder withColumnBorders highlightOnHover tabularNums miw={960}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Nome</Table.Th>
									<Table.Th>Area</Table.Th>
									<Table.Th>Papel</Table.Th>
									<Table.Th>Nivel</Table.Th>
									<Table.Th>Reputacao</Table.Th>
									<Table.Th>Status</Table.Th>
									<Table.Th>Acoes</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{filteredTechnicians.map((technician) => (
									<Table.Tr
										key={technician.address}
										data-selected={selectedTechnician?.address === technician.address}
									>
										<Table.Td>
											<Stack gap={0}>
												<Text fw={600}>{technician.name}</Text>
												<Text size="xs" c="dimmed">
													{technician.address}
												</Text>
											</Stack>
										</Table.Td>
										<Table.Td>{technician.expertiseArea ?? "-"}</Table.Td>
										<Table.Td>{formatRole(technician.role)}</Table.Td>
										<Table.Td>{technician.badgeLevel}</Table.Td>
										<Table.Td>
											<Group gap={4} aria-label={`Reputacao ${formatReputationStars(technician.reputation)} de 5`}>
												<Rating value={formatReputationStars(technician.reputation)} readOnly size="sm" />
											</Group>
										</Table.Td>
										<Table.Td>{formatSituation(technician)}</Table.Td>
										<Table.Td>
											<Group gap="xs" wrap="nowrap">
												<Button size="xs" variant="light" onClick={() => onSelectTechnician(technician.address)}>
													Detalhes
												</Button>
												{canHire ? (
													<Button size="xs" onClick={() => onHireTechnician(technician.address)}>
														Contratar
													</Button>
												) : null}
											</Group>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Box>
				</Stack>
			</Card>

			<Modal
				opened={technicianModalOpened}
				onClose={onCloseTechnicianModal}
				title={modalTitle}
				size="lg"
				centered
				overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
				withinPortal
			>
				{selectedTechnician ? (
					<Stack gap="md">
						<Stack gap={4}>
							<Title order={3}>{selectedTechnician.name}</Title>
							<Text size="sm" c="dimmed">
								{selectedTechnician.address}
							</Text>
						</Stack>

						<Group gap="xs">
							<Badge variant="light">{formatRole(selectedTechnician.role)}</Badge>
							<Badge variant="light">{selectedTechnician.badgeLevel}</Badge>
							<Group gap={4} aria-label={`Reputacao ${formatReputationStars(selectedTechnician.reputation)} de 5`}>
								<Rating value={formatReputationStars(selectedTechnician.reputation)} readOnly size="sm" />
							</Group>
						</Group>

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
							<Text size="sm">Area: {formatDetail(selectedTechnician.expertiseArea)}</Text>
							<Text size="sm">Ativo: {formatDetail(selectedTechnician.isActive)}</Text>
							<Text size="sm">Elegivel: {formatDetail(selectedTechnician.isEligible)}</Text>
							<Text size="sm">Atualizado em: {selectedTechnician.updatedAt}</Text>
						</SimpleGrid>

						{technicianModalMode === "hire" ? (
							<Card withBorder radius="md" padding="md" shadow="none">
								<Stack gap="sm">
									<Text size="sm">
										Descreva o servico para abrir uma ordem de servico para este tecnico.
									</Text>
									<Textarea
										label="Descricao do servico"
										placeholder="Explique o problema, o local e o que precisa ser feito."
										minRows={4}
										value={serviceDescription}
										onChange={(event) => onServiceDescriptionChange(event.currentTarget.value)}
									/>
									{requestError ? (
										<Text size="sm" c="red" role="status" aria-live="assertive">
											{requestError}
										</Text>
									) : null}
									<Group justify="flex-end">
										<Button variant="light" onClick={onCloseTechnicianModal}>
											Cancelar
										</Button>
										<Button
											onClick={() => void onConfirmTechnicianHire()}
											loading={submittingRequest}
											disabled={!serviceDescription.trim()}
										>
											Contratar tecnico
										</Button>
									</Group>
								</Stack>
							</Card>
						) : (
							<Group justify="flex-end">
								<Button variant="light" onClick={onCloseTechnicianModal}>
									Fechar
								</Button>
							</Group>
						)}
					</Stack>
				) : null}
			</Modal>
		</Stack>
	);
}
