import {
	Badge,
	Box,
	Button,
	Card,
	Group,
	Modal,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { formatarRPT } from "@/services/wallet";
import type { ServiceRequestSummary, ServiceRequestStatus } from "@/services/serviceRequests";

export type ServiceRequestsPanelViewProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	error: string | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	query: string;
	statusFilter: ServiceRequestStatus | "all";
	requestModalOpened: boolean;
	requestModalRequest: ServiceRequestSummary | null;
	requestModalAction: "details" | "budget" | "pay" | "complete" | "rate" | null;
	requestModalBudget: number | null;
	requestModalRating: number;
	busyRequestId: number | null;
	onRefresh: () => void;
	onQueryChange: (value: string) => void;
	onStatusFilterChange: (value: string | null) => void;
	onClearFilters: () => void;
	onOpenRequestModal: (requestId: number, action: "details" | "budget" | "pay" | "complete" | "rate") => void;
	onCloseRequestModal: () => void;
	onRequestModalBudgetChange: (value: number | null) => void;
	onRequestModalRatingChange: (value: number) => void;
	onSubmitBudget: () => Promise<void>;
	onPayBudget: () => Promise<void>;
	onCompleteOrder: () => Promise<void>;
	onRateService: () => Promise<void>;
};

const STATUS_OPTIONS = [
	{ value: "all", label: "Todas" },
	{ value: "aberta", label: "Abertas" },
	{ value: "aceita", label: "Aceitas" },
	{ value: "orcada", label: "Aguardando pagamento" },
	{ value: "aceito_cliente", label: "Pagas" },
	{ value: "concluida", label: "Concluidas" },
];

function formatStatus(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "Aberta";
		case "aceita":
			return "Aceita";
		case "orcada":
			return "Aguardando pagamento";
		case "aceito_cliente":
			return "Paga";
		case "concluida":
			return "Concluida";
	}
}

function statusColor(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "teal";
		case "aceita":
			return "yellow";
		case "orcada":
			return "orange";
		case "aceito_cliente":
			return "teal";
		case "concluida":
			return "gray";
	}
}

function formatBudget(value: number | null) {
	if (value === null) {
		return "-";
	}

	return formatarRPT(value, 0);
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

function obterAcaoPrincipal(
	request: ServiceRequestSummary,
	perfilAtivo: "cliente" | "tecnico" | null,
	walletAddress: string | null,
) {
	if (!walletAddress) {
		return null;
	}

	const ehCliente = perfilAtivo === "cliente" && request.clientAddress === walletAddress;
	const ehTecnico = perfilAtivo === "tecnico" && request.technicianAddress === walletAddress;

	if (request.status === "concluida" && (ehCliente || ehTecnico)) {
		return { label: "Avaliar", action: "rate" as const };
	}

	if (ehTecnico && (request.status === "aberta" || request.status === "aceita")) {
		return { label: "Gerar detalhes", action: "budget" as const };
	}

	if (ehCliente && request.status === "orcada") {
		return { label: "Pagar", action: "pay" as const };
	}

	if (ehTecnico && request.status === "aceito_cliente") {
		return { label: "Finalizar", action: "complete" as const };
	}

	return null;
}

export function ServiceRequestsPanelView({
	connected,
	walletAddress,
	walletNotice,
	perfilAtivo,
	loading,
	error,
	clientRequests,
	visibleRequests,
	query,
	statusFilter,
	requestModalOpened,
	requestModalRequest,
	requestModalAction,
	requestModalBudget,
	requestModalRating,
	busyRequestId,
	onRefresh,
	onQueryChange,
	onStatusFilterChange,
	onClearFilters,
	onOpenRequestModal,
	onCloseRequestModal,
	onRequestModalBudgetChange,
	onRequestModalRatingChange,
	onSubmitBudget,
	onPayBudget,
	onCompleteOrder,
	onRateService,
}: ServiceRequestsPanelViewProps) {
	const hasWallet = connected && walletAddress !== null;
	const withBudget = clientRequests.filter((request) => request.status === "orcada").length;
	const completedRequests = clientRequests.filter((request) => request.status === "concluida").length;
	const statusFilterValue = statusFilter;
	const modalAction = requestModalAction ?? "details";

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
							Aqui ficam as ordens do cliente e do tecnico, os valores em RPT, o pagamento e a conclusao.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{clientRequests.length} cadastradas</Badge>
						<Badge variant="light">{visibleRequests.length} visiveis</Badge>
						<Badge variant="light">{withBudget} com valor em RPT</Badge>
						<Badge variant="light">{completedRequests} concluidas</Badge>
						{perfilAtivo ? (
							<Badge variant="light" color={perfilAtivo === "tecnico" ? "blue" : "grape"}>
								{perfilAtivo}
							</Badge>
						) : null}
						<Badge variant="light" color={connected ? "teal" : "gray"}>
							{connected ? `carteira: ${shortAddress(walletAddress ?? "")}` : "carteira desconectada"}
						</Badge>
					</Group>

					<Group justify="space-between" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{walletNotice ?? "Use a lista para acompanhar suas ordens, aprovar pagamentos e concluir servicos."}
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
											<Table.Th>Orcamento (RPT)</Table.Th>
											<Table.Th>Acoes</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{visibleRequests.map((request) => {
											const acaoPrincipal = obterAcaoPrincipal(request, perfilAtivo, walletAddress);

											return (
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
															<Button size="xs" variant="light" onClick={() => onOpenRequestModal(request.id, "details")}>
																Detalhes
															</Button>
															{acaoPrincipal ? (
																<Button
																	size="xs"
																	onClick={() => onOpenRequestModal(request.id, acaoPrincipal.action)}
																	loading={busyRequestId === request.id}
																>
																	{acaoPrincipal.label}
																</Button>
															) : null}
														</Group>
													</Table.Td>
												</Table.Tr>
											);
										})}
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
				title={
					modalAction === "budget"
						? "Definir valor do servico"
						: modalAction === "pay"
							? "Confirmar pagamento do orcamento"
							: modalAction === "complete"
								? "Confirmar finalizacao da ordem"
								: modalAction === "rate"
									? "Avaliar servico"
									: "Detalhes da ordem"
				}
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
								Cliente: {requestModalRequest.clientName}
							</Text>
							<Text size="sm" c="dimmed">
								Tecnico: {requestModalRequest.technicianName}
							</Text>
						</Stack>

						<Card withBorder radius="md" padding="md" shadow="none">
							<Stack gap="xs">
								<Text size="sm">Status: {formatStatus(requestModalRequest.status)}</Text>
								<Text size="sm">Orcamento: {formatBudget(requestModalRequest.budgetAmount)}</Text>
								{modalAction === "budget" ? (
									<Text size="sm">Informe o valor que sera enviado ao cliente para aprovacao.</Text>
								) : null}
								{modalAction === "pay" ? (
									<Text size="sm">O pagamento trava o valor no contrato ate a conclusao.</Text>
								) : null}
								{modalAction === "complete" ? (
									<Text size="sm">A finalizacao libera o valor ao tecnico.</Text>
								) : null}
								{modalAction === "rate" ? <Text size="sm">A avaliacao fica disponivel depois da finalizacao.</Text> : null}
							</Stack>
						</Card>

						{modalAction === "budget" ? (
							<NumberInput
								label="Valor do servico"
								description="Esse valor sera salvo como orcamento da ordem em RPT."
								placeholder="Ex.: 250"
								min={1}
								clampBehavior="strict"
								value={requestModalBudget ?? ""}
								onChange={(value) => onRequestModalBudgetChange(typeof value === "number" ? value : null)}
							/>
						) : null}

						{modalAction === "rate" ? (
							<NumberInput
								label="Nota"
								description="Escolha uma nota entre 1 e 5."
								placeholder="5"
								min={1}
								max={5}
								clampBehavior="strict"
								value={requestModalRating}
								onChange={(value) => onRequestModalRatingChange(typeof value === "number" ? value : 5)}
							/>
						) : null}

						{modalAction === "pay" && requestModalRequest.status !== "orcada" ? (
							<Text size="sm" c="dimmed">
								Esta ordem ainda nao recebeu um orcamento.
							</Text>
						) : null}

						{modalAction === "complete" && requestModalRequest.status !== "aceito_cliente" ? (
							<Text size="sm" c="dimmed">
								O cliente ainda nao pagou o orcamento.
							</Text>
						) : null}

						{modalAction === "rate" && requestModalRequest.status !== "concluida" ? (
							<Text size="sm" c="dimmed">
								A ordem ainda nao foi finalizada.
							</Text>
						) : null}

						<Group justify="flex-end">
							<Button variant="light" onClick={onCloseRequestModal}>
								{modalAction === "details" ? "Fechar" : "Cancelar"}
							</Button>

							{modalAction === "budget" ? (
								<Button
									onClick={() => void onSubmitBudget()}
									loading={busyRequestId === requestModalRequest.id}
									disabled={requestModalBudget === null || requestModalBudget <= 0}
								>
									Aceitar orcamento
								</Button>
							) : null}

							{modalAction === "pay" ? (
								<Button
									onClick={() => void onPayBudget()}
									loading={busyRequestId === requestModalRequest.id}
									disabled={requestModalRequest.status !== "orcada" || requestModalRequest.budgetAmount === null}
								>
									Pagar
								</Button>
							) : null}

							{modalAction === "complete" ? (
								<Button
									onClick={() => void onCompleteOrder()}
									loading={busyRequestId === requestModalRequest.id}
									disabled={requestModalRequest.status !== "aceito_cliente"}
								>
									Finalizar
								</Button>
							) : null}

							{modalAction === "rate" ? (
								<Button
									onClick={() => void onRateService()}
									loading={busyRequestId === requestModalRequest.id}
									disabled={requestModalRequest.status !== "concluida"}
								>
									Avaliar
								</Button>
							) : null}
						</Group>
					</Stack>
				) : null}
			</Modal>
		</Stack>
	);
}
