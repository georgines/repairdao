import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type DisputeItem = {
	request: ServiceRequestSummary;
	contract: DisputaContratoDominio | null;
};

export type DisputesPanelViewProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	error: string | null;
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	selectedDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	busyDisputeId: number | null;
	onRefresh: () => void;
	onSelectDispute: (disputeId: number) => void;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
};

function statusLabel(status?: DisputaContratoDominio["estado"]) {
	switch (status) {
		case "aberta":
			return "Aberta";
		case "janela_votacao":
			return "Janela de votacao";
		case "encerrada":
			return "Encerrada";
		case "resolvida":
			return "Resolvida";
		default:
			return "Em disputa";
	}
}

function statusColor(status?: DisputaContratoDominio["estado"]) {
	switch (status) {
		case "aberta":
			return "blue";
		case "janela_votacao":
			return "yellow";
		case "encerrada":
			return "orange";
		case "resolvida":
			return "gray";
		default:
			return "red";
	}
}

function formatDateTime(value?: string) {
	if (!value) {
		return "-";
	}

	return new Date(value).toLocaleString("pt-BR");
}

function renderEmptyState(message: string) {
	return (
		<Text size="sm" c="dimmed">
			{message}
		</Text>
	);
}

function isParticipant(walletAddress: string | null, dispute: DisputeItem | null) {
	if (!walletAddress || !dispute) {
		return false;
	}

	return walletAddress === dispute.request.clientAddress || walletAddress === dispute.request.technicianAddress;
}

export function DisputesPanelView({
	connected,
	walletAddress,
	walletNotice,
	perfilAtivo,
	loading,
	error,
	disputes,
	visibleDisputes,
	selectedDisputeId,
	selectedDispute,
	selectedEvidence,
	evidenceDraft,
	voteSupportOpener,
	busyDisputeId,
	onRefresh,
	onSelectDispute,
	onEvidenceDraftChange,
	onVoteSupportChange,
	onSubmitEvidence,
	onSubmitVote,
}: DisputesPanelViewProps) {
	const selectedIsParticipant = isParticipant(walletAddress, selectedDispute);
	const selectedState = selectedDispute?.contract?.estado;
	const selectedResolved = selectedDispute?.contract?.resolved === true || selectedState === "resolvida";
	const totalOpen = visibleDisputes.length;

	return (
		<Stack gap="lg">
			<Card withBorder radius="sm" shadow="none" padding="lg">
				<Stack gap="sm">
					<Stack gap={4}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Disputas
						</Text>
						<Title order={1}>Acompanhe e participe das disputas</Title>
						<Text size="sm" c="dimmed">
							Quem faz parte da disputa envia evidencias. Quem esta fora dela le as interacoes e vota.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{disputes.length} registradas</Badge>
						<Badge variant="light">{totalOpen} abertas</Badge>
						{perfilAtivo ? <Badge variant="light">{perfilAtivo}</Badge> : null}
						<Badge variant="light" color={connected ? "teal" : "gray"}>
							{connected ? `carteira: ${formatarEnderecoCurto(walletAddress ?? "")}` : "carteira desconectada"}
						</Badge>
					</Group>

					<Group justify="space-between" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{walletNotice ?? "Selecione uma disputa para ler as evidencias e interagir com o contrato."}
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

			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
				<Card withBorder radius="sm" shadow="none" padding="lg">
					<Stack gap="md">
						<Stack gap={2}>
							<Title order={3}>Disputas abertas</Title>
							<Text size="sm" c="dimmed">
								{visibleDisputes.length > 0 ? "Escolha uma disputa para ler as interacoes." : "Nenhuma disputa aberta no momento."}
							</Text>
						</Stack>

						{visibleDisputes.length > 0 ? (
							<Stack gap="sm">
								{visibleDisputes.map((dispute) => {
									const active = dispute.request.id === selectedDisputeId;

									return (
										<Button
											key={dispute.request.id}
											variant={active ? "filled" : "light"}
											color={active ? "teal" : "gray"}
											fullWidth
											onClick={() => onSelectDispute(dispute.request.id)}
										>
											<Group justify="space-between" wrap="nowrap" w="100%">
												<Stack gap={0} align="flex-start">
													<Text fw={600}>{dispute.request.description}</Text>
													<Text size="xs" c={active ? "white" : "dimmed"}>
														{dispute.request.clientName} x {dispute.request.technicianName}
													</Text>
												</Stack>
												<Badge variant="light" color={statusColor(dispute.contract?.estado)}>
													{statusLabel(dispute.contract?.estado)}
												</Badge>
											</Group>
										</Button>
									);
								})}
							</Stack>
						) : (
							renderEmptyState("Sem disputas para exibir.")
						)}
					</Stack>
				</Card>

				<Card withBorder radius="sm" shadow="none" padding="lg">
					{selectedDispute ? (
						<Stack gap="md">
							<Stack gap={4}>
								<Group justify="space-between" align="flex-start">
									<Stack gap={0}>
										<Title order={3}>{selectedDispute.request.description}</Title>
										<Text size="sm" c="dimmed">
											Ordem {selectedDispute.request.id}
										</Text>
									</Stack>
									<Badge variant="light" color={statusColor(selectedState)}>
										{statusLabel(selectedState)}
									</Badge>
								</Group>

								<Text size="sm" c="dimmed">
									Cliente: {selectedDispute.request.clientName} ({selectedDispute.request.clientAddress})
								</Text>
								<Text size="sm" c="dimmed">
									Tecnico: {selectedDispute.request.technicianName} ({selectedDispute.request.technicianAddress})
								</Text>
								<Text size="sm" c="dimmed">
									Motivo: {selectedDispute.request.disputeReason ?? selectedDispute.contract?.motivo ?? "-"}
								</Text>
							</Stack>

							<Card withBorder radius="md" padding="md" shadow="none">
								<Stack gap="xs">
									<Text size="sm">Quem abriu: {selectedDispute.contract?.openedBy ?? "-"}</Text>
									<Text size="sm">Parte oposta: {selectedDispute.contract?.opposingParty ?? "-"}</Text>
									<Text size="sm">Votos a favor de quem abriu: {selectedDispute.contract?.votesForOpener ?? 0}</Text>
									<Text size="sm">Votos a favor da outra parte: {selectedDispute.contract?.votesForOpposing ?? 0}</Text>
									<Text size="sm">Prazo: {formatDateTime(selectedDispute.contract?.deadline)}</Text>
								</Stack>
							</Card>

							<Stack gap={6}>
								<Group justify="space-between" align="center">
									<Title order={4}>Interacoes</Title>
									<Text size="sm" c="dimmed">
										{selectedEvidence.length} registros
									</Text>
								</Group>

								{selectedEvidence.length > 0 ? (
									<Stack gap="sm">
										{selectedEvidence.map((evidence, index) => (
											<Card key={`${evidence.timestamp}-${index}`} withBorder radius="md" padding="md" shadow="none">
												<Stack gap={4}>
													<Group justify="space-between" wrap="nowrap">
														<Text fw={600}>{formatarEnderecoCurto(evidence.submittedBy)}</Text>
														<Text size="xs" c="dimmed">
															{formatDateTime(evidence.timestamp)}
														</Text>
													</Group>
													<Text size="sm">{evidence.content}</Text>
												</Stack>
											</Card>
										))}
									</Stack>
								) : (
									renderEmptyState("Ainda nao ha interacoes registradas no contrato.")
								)}
							</Stack>

							{!connected ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Text size="sm" c="dimmed">
										Conecte a carteira para enviar evidencia ou votar na disputa.
									</Text>
								</Card>
							) : null}

							{connected && !selectedResolved && selectedIsParticipant ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap="md">
										<Stack gap={2}>
											<Title order={4}>Enviar evidencia</Title>
											<Text size="sm" c="dimmed">
												Somente cliente ou tecnico da ordem podem registrar evidencia.
											</Text>
										</Stack>

										<Textarea
											label="Nova evidencia"
											description="Descreva o que precisa ficar registrado no contrato."
											minRows={4}
											value={evidenceDraft}
											onChange={(event) => onEvidenceDraftChange(event.currentTarget.value)}
										/>

										<Group justify="flex-end">
											<Button
												onClick={() => void onSubmitEvidence()}
												loading={busyDisputeId === selectedDispute.request.id}
												disabled={evidenceDraft.trim().length === 0}
											>
												Enviar evidencia
											</Button>
										</Group>
									</Stack>
								</Card>
							) : null}

							{connected && !selectedResolved && !selectedIsParticipant ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap="md">
										<Stack gap={2}>
											<Title order={4}>Votar na disputa</Title>
											<Text size="sm" c="dimmed">
												Quem nao participa da ordem pode ler as interacoes e votar com os RPT disponiveis.
											</Text>
										</Stack>

										<Group gap="sm">
											<Button
												variant={voteSupportOpener ? "filled" : "light"}
												onClick={() => onVoteSupportChange(true)}
											>
												Apoiar abertura
											</Button>
											<Button
												variant={!voteSupportOpener ? "filled" : "light"}
												onClick={() => onVoteSupportChange(false)}
											>
												Apoiar a outra parte
											</Button>
										</Group>

										<Group justify="flex-end">
											<Button
												onClick={() => void onSubmitVote()}
												loading={busyDisputeId === selectedDispute.request.id}
											>
												Registrar voto
											</Button>
										</Group>
									</Stack>
								</Card>
							) : null}

							{selectedResolved ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Text size="sm" c="dimmed">
										Esta disputa ja foi resolvida no contrato.
									</Text>
								</Card>
							) : null}
						</Stack>
					) : (
						renderEmptyState("Selecione uma disputa para ver os detalhes.")
					)}
				</Card>
			</SimpleGrid>
		</Stack>
	);
}
