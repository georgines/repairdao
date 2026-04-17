import {
	Badge,
	Box,
	Button,
	Card,
	Group,
	Modal,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import type { ServiceRequestSummary, ServiceRequestStatus } from "@/services/serviceRequests";

export type ServiceRequestsPanelViewProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	loading: boolean;
	error: string | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	requestModalOpened: boolean;
	requestModalRequest: ServiceRequestSummary | null;
	busyRequestId: number | null;
	onRefresh: () => void;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onOpenRequestModal: (requestId: number) => void;
	onCloseRequestModal: () => void;
	onAcceptBudget: () => Promise<void>;
};

const STATUS_OPTIONS = [
	{ value: "all", label: "Todas" },
	{ value: "aberta", label: "Abertas" },
	{ value: "aceita", label: "Aceitas" },
	{ value: "orcada", label: "Orcadas" },
	{ value: "aceito_cliente", label: "Aceitas pelo cliente" },
];

function formatStatus(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "Aberta";
		case "aceita":
			return "Aceita";
		case "orcada":
			return "Orcada";
		case "aceito_cliente":
			return "Aceita pelo cliente";
	}
}

function statusColor(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "teal";
		case "aceita":
			return "yellow";
		case "orcada":
			return "green";
		case "aceito_cliente":
			return "blue";
	}
}

function formatBudget(value: number | null) {
	if (value === null) {
		return "-";
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0,
	}).format(value);
}

function shortAddress(address: string) {
	if (address.length <= 12) {
		return address;
	}

	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function renderEmptyState(message: string) {
	return (
		<Text size="sm" c="dimmed">
			{message}
		</Text>
	);
}

export function ServiceRequestsPanelView({
	connected,
	walletAddress,
	walletNotice,
	loading,
	error,
	clientRequests,
	visibleRequests,
	query,
	statusFilter,
	requestModalOpened,
	requestModalRequest,
	busyRequestId,
	onRefresh,
	onQueryChange,
	onStatusFilterChange,
	onClearFilters,
	onOpenRequestModal,
	onCloseRequestModal,
	onAcceptBudget,
}: ServiceRequestsPanelViewProps) {
	const hasWallet = connected && walletAddress !== null;
	const withBudget = clientRequests.filter((request) => request.status === "orcada").length;
	const statusFilterValue = statusFilter;

	return (
		<Stack gap="lg">
			<Card withBorder radius="sm" shadow="none" padding="lg">
				<Stack gap="sm">
					<Stack gap={4}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Servicos
						</Text>
						<Title order={1}>Acompanhe suas ordens de servico</Title>
						<Text size="sm" c="dimmed">
							Aqui ficam as ordens abertas na contratacao, os orcamentos recebidos e o aceite do cliente.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{clientRequests.length} cadastradas</Badge>
						<Badge variant="light">{visibleRequests.length} visiveis</Badge>
						<Badge variant="light">{withBudget} com orcamento</Badge>
						<Badge variant="light" color={connected ? "teal" : "gray"}>
							{connected ? `carteira: ${shortAddress(walletAddress ?? "")}` : "carteira desconectada"}
						</Badge>
					</Group>

					<Group justify="space-between" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{walletNotice ?? "Use a lista para acompanhar as ordens e aceitar orcamentos quando eles chegarem."}
						</Text>

						<Button variant="light" onClick={onRefresh} loading={loading}>
							Atualizar
						</Button>
					</Group>
				</Stack>
			</Card>

			{error ? (
				<Card withBorder radius="sm" shadow="none" padding="md">
					<Text size="sm" c="red" role="status" aria-live="assertive">
						{error}
					</Text>
				</Card>
			) : null}

			<Card withBorder radius="sm" shadow="none" padding="lg">
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
							value={statusFilterValue}
							onChange={onStatusFilterChange}
							clearable={false}
						/>
					</SimpleGrid>

					<Group justify="space-between" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{visibleRequests.length > 0 ? "Use a lista para acompanhar suas ordens." : "Nenhuma ordem encontrou este criterio."}
						</Text>

						<Button variant="light" onClick={onClearFilters}>
							Limpar
						</Button>
					</Group>

					{hasWallet ? (
						visibleRequests.length > 0 ? (
							<Box style={{ overflowX: "auto" }}>
								<Table withTableBorder withColumnBorders highlightOnHover miw={920}>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>Tecnico</Table.Th>
											<Table.Th>Descricao</Table.Th>
											<Table.Th>Status</Table.Th>
											<Table.Th>Orcamento</Table.Th>
											<Table.Th>Acoes</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{visibleRequests.map((request) => (
											<Table.Tr key={request.id}>
												<Table.Td>
													<Stack gap={0}>
														<Text fw={600}>{request.technicianName}</Text>
														<Text size="xs" c="dimmed">
															{request.technicianAddress}
														</Text>
													</Stack>
												</Table.Td>
												<Table.Td>{request.description}</Table.Td>
												<Table.Td>
													<Badge variant="light" color={statusColor(request.status)}>
														{formatStatus(request.status)}
													</Badge>
												</Table.Td>
												<Table.Td>{formatBudget(request.budgetAmount)}</Table.Td>
												<Table.Td>
													<Group gap="xs" wrap="nowrap">
														<Button size="xs" variant="light" onClick={() => onOpenRequestModal(request.id)}>
															Detalhes
														</Button>
														{request.status === "orcada" ? (
															<Button
																size="xs"
																onClick={() => onOpenRequestModal(request.id)}
																loading={busyRequestId === request.id}
															>
																Aceitar orcamento
															</Button>
														) : null}
													</Group>
												</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
								</Table>
							</Box>
						) : (
							renderEmptyState("Nenhuma ordem foi encontrada para esta carteira.")
						)
					) : (
						renderEmptyState("Conecte a carteira para ver suas ordens de servico.")
					)}
				</Stack>
			</Card>

			<Modal
				opened={requestModalOpened}
				onClose={onCloseRequestModal}
				title="Confirmar aceite do orcamento"
				size="md"
				centered
				overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
				withinPortal
			>
				{requestModalRequest ? (
					<Stack gap="md">
						<Stack gap={4}>
							<Text fw={600}>{requestModalRequest.description}</Text>
							<Text size="sm" c="dimmed">
								Tecnico: {requestModalRequest.technicianName}
							</Text>
						</Stack>

						<Card withBorder radius="md" padding="md" shadow="none">
							<Stack gap="xs">
								<Text size="sm">Status: {formatStatus(requestModalRequest.status)}</Text>
								<Text size="sm">Orcamento: {formatBudget(requestModalRequest.budgetAmount)}</Text>
								<Text size="sm">Cliente: {requestModalRequest.clientName}</Text>
							</Stack>
						</Card>

						{requestModalRequest.status !== "orcada" ? (
							<Text size="sm" c="dimmed">
								Esta ordem ainda nao recebeu orcamento.
							</Text>
						) : null}

						<Group justify="flex-end">
							<Button variant="light" onClick={onCloseRequestModal}>
								Cancelar
							</Button>
							<Button
								onClick={() => void onAcceptBudget()}
								loading={busyRequestId === requestModalRequest.id}
								disabled={requestModalRequest.status !== "orcada" || requestModalRequest.budgetAmount === null}
							>
								Aceitar orcamento
							</Button>
						</Group>
					</Stack>
				) : null}
			</Modal>
		</Stack>
	);
}
