import { Badge, Button, Card, Divider, Group, SegmentedControl, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";
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
	hasVotingTokens: boolean;
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
	votedDisputeIds: number[];
	evidenceSubmittedDisputeIds: number[];
	onRefresh: () => void;
	onSelectDispute: (disputeId: number) => void;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
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

function countLabel(count: number, singular: string, plural: string) {
	return `${count} ${count === 1 ? singular : plural}`;
}

export function DisputesPanelView({
	connected,
	walletAddress,
	walletNotice,
	perfilAtivo,
	hasVotingTokens,
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
	votedDisputeIds,
	evidenceSubmittedDisputeIds,
	onRefresh,
	onSelectDispute,
	onEvidenceDraftChange,
	onVoteSupportChange,
	onSubmitEvidence,
	onSubmitVote,
	onResolveDispute,
}: DisputesPanelViewProps) {
	const selectedIsParticipant = isParticipant(walletAddress, selectedDispute);
	const selectedState = selectedDispute?.contract?.estado;
	const selectedResolved = selectedDispute?.contract?.resolved === true || selectedState === "resolvida";
	const selectedVotingWindow = selectedState === "janela_votacao";
	const selectedEncerrada = selectedState === "encerrada";
	const selectedVoteAlreadySubmitted = selectedDispute ? votedDisputeIds.includes(selectedDispute.request.id) : false;
	const selectedEvidenceAlreadySubmitted = selectedDispute ? evidenceSubmittedDisputeIds.includes(selectedDispute.request.id) : false;
	const selectedCanSendEvidence = connected && selectedVotingWindow && selectedIsParticipant;
	const selectedCanVote = connected && selectedVotingWindow && !selectedIsParticipant;
	const selectedCanResolve = connected && selectedEncerrada;
	const totalOpen = visibleDisputes.length;
	const voteSegmentValue = voteSupportOpener ? "apoio_opener" : "apoio_opposing";
	const selectedActionLocked = selectedEvidenceAlreadySubmitted || selectedVoteAlreadySubmitted;

	return (
		<Stack gap="lg">
			<Card withBorder radius="sm" shadow="none" padding="lg">
				<Stack gap="sm">
					<Stack gap={4}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Disputas
						</Text>
						<Title order={1}>Acompanhe, leia e participe da disputa no contrato</Title>
						<Text size="sm" c="dimmed">
							O contrato decide o estado real. O banco apenas espelha as ordens abertas para navegação.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{countLabel(disputes.length, "registrada", "registradas")}</Badge>
						<Badge variant="light">{countLabel(totalOpen, "aberta", "abertas")}</Badge>
						{perfilAtivo ? <Badge variant="light">{perfilAtivo}</Badge> : null}
						{selectedState ? (
							<Badge variant="light" color={statusColor(selectedState)}>
								{statusLabel(selectedState)}
							</Badge>
						) : null}
						<Badge variant="light" color={connected ? "teal" : "gray"}>
							{connected ? `carteira: ${formatarEnderecoCurto(walletAddress ?? "")}` : "carteira desconectada"}
						</Badge>
					</Group>

					<Group justify="space-between" align="center" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{walletNotice ?? "Escolha uma disputa para ver o resumo, as evidencias e a acao disponivel."}
						</Text>

						<Button type="button" variant="light" onClick={onRefresh} loading={loading}>
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
								{visibleDisputes.length > 0 ? "Selecione uma disputa para ler o contrato e interagir." : "Nenhuma disputa aberta no momento."}
							</Text>
						</Stack>

						{visibleDisputes.length > 0 ? (
							<Stack gap="sm">
								{visibleDisputes.map((dispute) => {
									const active = dispute.request.id === selectedDisputeId;
									const stateLabel = statusLabel(dispute.contract?.estado);

									return (
										<Button
											key={dispute.request.id}
											variant={active ? "filled" : "light"}
											color={active ? "teal" : "gray"}
											fullWidth
											onClick={() => onSelectDispute(dispute.request.id)}
										>
											<Stack gap={6} w="100%" align="stretch">
												<Group justify="space-between" align="flex-start" wrap="nowrap">
													<Stack gap={2} align="flex-start">
														<Text fw={700} lineClamp={2} ta="left">
															{dispute.request.description}
														</Text>
														<Text size="xs" c={active ? "white" : "dimmed"} ta="left">
															{dispute.request.clientName} x {dispute.request.technicianName}
														</Text>
													</Stack>
													<Badge variant="light" color={statusColor(dispute.contract?.estado)}>
														{stateLabel}
													</Badge>
												</Group>
												<Text size="xs" c={active ? "white" : "dimmed"} ta="left">
													{dispute.request.disputeReason ?? "Sem motivo espelhado no banco"} · Ordem {dispute.request.id}
												</Text>
											</Stack>
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
										<Title order={3} lineClamp={2}>
											{selectedDispute.request.description}
										</Title>
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

							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap={4}>
										<Text size="xs" tt="uppercase" fw={700} c="dimmed">
											Status do contrato
										</Text>
										<Text fw={700}>{statusLabel(selectedState)}</Text>
										<Text size="sm" c="dimmed">
											{selectedVotingWindow
												? "Janela aberta para votos e evidencias."
												: selectedEncerrada
													? "Janela encerrada. A disputa pode ser resolvida."
													: selectedResolved
														? "Disputa resolvida no contrato."
														: "Estado espelhado indisponivel no momento."}
										</Text>
									</Stack>
								</Card>

								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap={4}>
										<Text size="xs" tt="uppercase" fw={700} c="dimmed">
											Partes
										</Text>
										<Text size="sm">Quem abriu: {selectedDispute.contract?.openedBy ?? "-"}</Text>
										<Text size="sm">Parte oposta: {selectedDispute.contract?.opposingParty ?? "-"}</Text>
										<Text size="sm">
											Sua funcao: {selectedIsParticipant ? "parte da disputa" : "observador com voto"}
										</Text>
									</Stack>
								</Card>

								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap={4}>
										<Text size="xs" tt="uppercase" fw={700} c="dimmed">
											Votacao
										</Text>
										<Text size="sm">
											Favor de quem abriu: {selectedDispute.contract?.votesForOpener ?? 0}
										</Text>
										<Text size="sm">
											Favor da outra parte: {selectedDispute.contract?.votesForOpposing ?? 0}
										</Text>
									</Stack>
								</Card>

								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap={4}>
										<Text size="xs" tt="uppercase" fw={700} c="dimmed">
											Prazo
										</Text>
										<Text size="sm">{formatDateTime(selectedDispute.contract?.deadline)}</Text>
										<Text size="sm" c="dimmed">
											{selectedEncerrada
												? "A janela terminou."
												: "Enquanto o prazo estiver aberto, evidencias e votos ainda podem ser registrados."}
										</Text>
									</Stack>
								</Card>
							</SimpleGrid>

							<Divider />

							<Stack gap={6}>
								<Group justify="space-between" align="center">
									<Title order={4}>Interacoes registradas no contrato</Title>
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

							<Divider />

							{!connected ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Text size="sm" c="dimmed">
										Conecte a carteira para enviar evidencia, votar ou resolver a disputa.
									</Text>
								</Card>
							) : selectedResolved ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Text size="sm" c="dimmed">
										Esta disputa ja foi resolvida no contrato. O painel fica apenas em leitura.
									</Text>
								</Card>
							) : selectedActionLocked ? null : selectedCanSendEvidence ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap="md">
										<Stack gap={2}>
											<Title order={4}>Enviar evidencia</Title>
											<Text size="sm" c="dimmed">
												Apenas cliente ou tecnico da ordem podem registrar evidencia enquanto a janela esta aberta.
											</Text>
										</Stack>

										<Textarea
											label="Nova evidencia"
											description="Escreva o que precisa ficar gravado no contrato."
											minRows={4}
											value={evidenceDraft}
											onChange={(event) => onEvidenceDraftChange(event.currentTarget.value)}
										/>

										<Text size="sm" c="dimmed">
											Seu texto sera enviado ao contrato e ficara disponivel para leitura.
										</Text>

										<Group justify="flex-end">
											<Button
												type="button"
												onClick={() => void onSubmitEvidence()}
												loading={busyDisputeId === selectedDispute.request.id}
												disabled={evidenceDraft.trim().length === 0}
											>
												Enviar evidencia
											</Button>
										</Group>
									</Stack>
								</Card>
							) : selectedCanVote ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap="md">
										<Stack gap={2}>
											<Title order={4}>Votar na disputa</Title>
											<Text size="sm" c="dimmed">
												Quem nao participa da ordem pode votar enquanto a janela estiver aberta.
											</Text>
										</Stack>

										<SegmentedControl
											value={voteSegmentValue}
											onChange={(value) => onVoteSupportChange(value === "apoio_opener")}
											data={[
												{ label: "Apoiar quem abriu", value: "apoio_opener" },
												{ label: "Apoiar a outra parte", value: "apoio_opposing" },
											]}
										/>

										<Text size="sm" c={hasVotingTokens ? "dimmed" : "red"}>
											{hasVotingTokens
												? "Seu voto sera enviado ao contrato e contabilizado de acordo com a posicao escolhida."
												: "Voce precisa ter RPT para votar."}
										</Text>

										<Group justify="flex-end">
											<Button
												type="button"
												onClick={() => void onSubmitVote()}
												loading={busyDisputeId === selectedDispute.request.id}
												disabled={!hasVotingTokens}
											>
												Registrar voto
											</Button>
										</Group>
									</Stack>
								</Card>
							) : selectedCanResolve ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Stack gap="md">
										<Stack gap={2}>
											<Title order={4}>Resolver disputa</Title>
											<Text size="sm" c="dimmed">
												O prazo terminou. Qualquer conta conectada pode pedir a resolucao do contrato.
											</Text>
										</Stack>

										<Group justify="flex-end">
											<Button
												type="button"
												onClick={() => void onResolveDispute()}
												loading={busyDisputeId === selectedDispute.request.id}
											>
												Resolver disputa
											</Button>
										</Group>
									</Stack>
								</Card>
							) : !selectedActionLocked ? (
								<Card withBorder radius="md" padding="md" shadow="none">
									<Text size="sm" c="dimmed">
										A disputa ainda nao esta em uma janela valida para interacoes.
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
