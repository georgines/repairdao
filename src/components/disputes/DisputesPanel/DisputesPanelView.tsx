import { formatUnits } from "ethers";
import {
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Group,
	Modal,
	ScrollArea,
	Select,
	SegmentedControl,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import type { DisputaContratoDominio, EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import { formatarEnderecoCurto, normalizarEnderecoComparacao } from "@/services/wallet/formatters";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import styles from "./DisputesPanelView.module.css";

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
	query?: string;
	statusFilter?: "all" | DisputaContratoDominio["estado"];
	selectedDisputeId: number | null;
	selectedDispute: DisputeItem | null;
	selectedEvidence: EvidenciaContratoDominio[];
	evidenceDraft: string;
	voteSupportOpener: boolean;
	busyDisputeId: number | null;
	votedDisputeIds: number[];
	votedDisputeChoices: Record<number, boolean>;
	evidenceSubmittedDisputeIds: number[];
	onRefresh: () => void;
	onQueryChange?: (value: string) => void;
	onStatusFilterChange?: (value: string | null) => void;
	onClearFilters?: () => void;
	onSelectDispute: (disputeId: number) => Promise<void>;
	onCloseDispute: () => void;
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
			return "Votação aberta";
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

const STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "Todas" },
	{ value: "aberta", label: "Aberta" },
	{ value: "janela_votacao", label: "Votação aberta" },
	{ value: "encerrada", label: "Votação encerrada" },
	{ value: "resolvida", label: "Resolvida" },
] as const;

function getEvidenceSide(
	evidence: EvidenciaContratoDominio,
	dispute: DisputeItem | null,
	index: number,
): "left" | "right" {
	const openedBy = normalizarEnderecoComparacao(dispute?.contract?.openedBy);
	const opposingParty = normalizarEnderecoComparacao(dispute?.contract?.opposingParty);
	const author = normalizarEnderecoComparacao(evidence.submittedBy);

	if (openedBy && author === openedBy) {
		return "left";
	}

	if (opposingParty && author === opposingParty) {
		return "right";
	}

	return index % 2 === 0 ? "left" : "right";
}

function getEvidenceSideLabel(side: "left" | "right") {
	return side === "left" ? "Quem abriu" : "Outra parte";
}

function getEvidenceRoleLabel(evidence: EvidenciaContratoDominio, dispute: DisputeItem | null) {
	const author = normalizarEnderecoComparacao(evidence.submittedBy);
	const client = normalizarEnderecoComparacao(dispute?.request.clientAddress);
	const technician = normalizarEnderecoComparacao(dispute?.request.technicianAddress);

	if (author && author === client) {
		return "Cliente";
	}

	if (author && author === technician) {
		return "Tecnico";
	}

	return null;
}

function getDisputeParticipantRoleLabel(address: string | null | undefined, dispute: DisputeItem | null) {
	const normalizedAddress = normalizarEnderecoComparacao(address);
	const client = normalizarEnderecoComparacao(dispute?.request.clientAddress);
	const technician = normalizarEnderecoComparacao(dispute?.request.technicianAddress);

	if (normalizedAddress && normalizedAddress === client) {
		return "Cliente";
	}

	if (normalizedAddress && normalizedAddress === technician) {
		return "Tecnico";
	}

	return null;
}

function isEnderecoLike(valor: string | null | undefined) {
	return typeof valor === "string" && /^0x[a-fA-F0-9]{6,}$/.test(valor.trim());
}

function formatParticipantIdentity(name: string | null | undefined, address: string | null | undefined) {
	const trimmedName = name?.trim();

	if (trimmedName && !isEnderecoLike(trimmedName)) {
		return trimmedName;
	}

	return address ?? "-";
}

function getVoteOptionLabels(dispute: DisputeItem | null) {
	const openerRole = getDisputeParticipantRoleLabel(dispute?.contract?.openedBy, dispute);
	const opposingRole = openerRole === "Cliente" ? "Tecnico" : openerRole === "Tecnico" ? "Cliente" : null;

	return {
		openerLabel: openerRole ? `Apoiar quem abriu (${openerRole})` : "Apoiar quem abriu",
		opposingLabel: opposingRole ? `Apoiar a outra parte (${opposingRole})` : "Apoiar a outra parte",
	};
}

function getEvidenceSideColor(side: "left" | "right") {
	return side === "left" ? "teal" : "indigo";
}

type EvidenceTimelineProps = {
	dispute: DisputeItem | null;
	evidence: EvidenciaContratoDominio[];
};

function EvidenceTimeline({ dispute, evidence }: EvidenceTimelineProps) {
	return (
		<Box className={styles.timeline}>
			<Box className={styles.timelineTrack} aria-hidden="true" />

			<Stack gap="md" className={styles.timelineList}>
				{evidence.map((item, index) => {
					const side = getEvidenceSide(item, dispute, index);

					return (
						<Box key={`${item.timestamp}-${index}`} className={styles.timelineRow} data-evidence-side={side}>
							<Box className={styles.timelineEntry}>
								<Card withBorder radius="md" shadow="none" padding="md" className={styles.timelineCard}>
									<Stack gap={8}>
										<Group justify="space-between" align="flex-start" wrap="nowrap">
											<Stack gap={2}>
												<Group gap={6} wrap="nowrap" align="center">
													<Text size="sm" fw={700}>
														{formatarEnderecoCurto(item.submittedBy)}
													</Text>
													<Text size="xs" c="dimmed">
														#{index + 1}
													</Text>
												</Group>
												<Text size="xs" c="dimmed">
													{formatDateTime(item.timestamp)}
												</Text>
											</Stack>

											<Badge variant="light" color={getEvidenceSideColor(side)}>
												{getEvidenceRoleLabel(item, dispute) ?? getEvidenceSideLabel(side)}
											</Badge>
										</Group>

										<Text size="sm" className={styles.timelineContent}>
											{item.content}
										</Text>
									</Stack>
								</Card>
							</Box>

							<Box className={styles.timelineMarker} aria-hidden="true">
								<Box className={styles.timelineDot} />
							</Box>
						</Box>
					);
				})}
			</Stack>
		</Box>
	);
}

function isParticipant(walletAddress: string | null, dispute: DisputeItem | null) {
	if (!walletAddress || !dispute) {
		return false;
	}

	const normalizedWallet = normalizarEnderecoComparacao(walletAddress);

	return normalizedWallet === normalizarEnderecoComparacao(dispute.request.clientAddress)
		|| normalizedWallet === normalizarEnderecoComparacao(dispute.request.technicianAddress);
}

function countLabel(count: number, singular: string, plural: string) {
	return `${count} ${count === 1 ? singular : plural}`;
}

function formatVoteValue(value?: bigint) {
	if (value === undefined) {
		return "0";
	}

	const rawValue = formatUnits(value, 18);
	const [integerPart, fractionPart] = rawValue.split(".");
	const formattedInteger = new Intl.NumberFormat("pt-BR").format(BigInt(integerPart));

	if (!fractionPart) {
		return formattedInteger;
	}

	const trimmedFraction = fractionPart.replace(/0+$/, "");

	return trimmedFraction.length > 0 ? `${formattedInteger},${trimmedFraction}` : formattedInteger;
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
	query = "",
	statusFilter = "all",
	selectedDisputeId,
	selectedDispute,
	selectedEvidence,
	evidenceDraft,
	voteSupportOpener,
	busyDisputeId,
	votedDisputeIds,
	votedDisputeChoices,
	evidenceSubmittedDisputeIds,
	onRefresh,
	onQueryChange = () => {},
	onStatusFilterChange = () => {},
	onClearFilters = () => {},
	onSelectDispute,
	onCloseDispute,
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
	const selectedVoteChoice = selectedDispute ? votedDisputeChoices[selectedDispute.request.id] : undefined;
	const selectedVoteLocked = selectedVoteAlreadySubmitted && selectedVoteChoice !== undefined;
	const selectedVoteSupportOpener = selectedVoteChoice ?? voteSupportOpener;
	const selectedEvidenceAlreadySubmitted = selectedDispute ? evidenceSubmittedDisputeIds.includes(selectedDispute.request.id) : false;
	const selectedCanSendEvidence = connected && selectedVotingWindow && selectedIsParticipant && !selectedEvidenceAlreadySubmitted;
	const selectedCanVote = connected && selectedVotingWindow && !selectedIsParticipant;
	const selectedCanResolve = connected && selectedEncerrada;
	const voteOptionLabels = getVoteOptionLabels(selectedDispute);
	const totalOpen = visibleDisputes.length;
	const disputeTitle = selectedDispute?.request.description ?? "Disputa";
	const disputeSubtitle = selectedDispute
		? `Ordem ${selectedDispute.request.id} · ${selectedDispute.request.clientName} x ${selectedDispute.request.technicianName}`
		: "";

	return (
		<Stack gap="lg">
			<Card withBorder radius="sm" shadow="none" padding="lg">
				<Stack gap="sm">
					<Stack gap={4}>
						<Text size="xs" tt="uppercase" fw={700} c="dimmed">
							Disputas
						</Text>
						<Title order={1}>Acompanhe as disputas em uma lista unica</Title>
						<Text size="sm" c="dimmed">
							O contrato define o estado real. A tela organiza leitura, filtros e acoes disponiveis.
						</Text>
					</Stack>

					<Group gap="sm">
						<Badge variant="light">{countLabel(disputes.length, "registrada", "registradas")}</Badge>
						<Badge variant="light">{countLabel(totalOpen, "visivel", "visiveis")}</Badge>
						{perfilAtivo ? <Badge variant="light">{perfilAtivo}</Badge> : null}
						<Badge variant="light" color={connected ? "teal" : "gray"}>
							{connected ? `carteira: ${formatarEnderecoCurto(walletAddress ?? "")}` : "carteira desconectada"}
						</Badge>
					</Group>

					<Group justify="space-between" align="center" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{walletNotice ?? "Selecione uma disputa para abrir o modal e interagir."}
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

			<Card withBorder radius="sm" shadow="none" padding="lg">
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

					<Group justify="space-between" align="center" wrap="nowrap">
						<Text size="sm" c="dimmed">
							{visibleDisputes.length > 0
								? "Use a lista para acompanhar suas disputas."
								: query.trim().length > 0 || statusFilter !== "all"
									? "Nenhuma disputa encontrou este criterio."
									: "Nenhuma disputa aberta no momento."}
						</Text>

						<Button variant="light" onClick={onClearFilters}>
							Limpar
						</Button>
					</Group>

					{visibleDisputes.length > 0 ? (
						<Box style={{ overflowX: "auto" }}>
							<Table withTableBorder withColumnBorders highlightOnHover miw={760}>
								<Table.Thead>
									<Table.Tr>
										<Table.Th style={{ textAlign: "left", verticalAlign: "middle" }}>Disputa</Table.Th>
										<Table.Th style={{ textAlign: "center", verticalAlign: "middle" }}>Motivo</Table.Th>
										<Table.Th style={{ textAlign: "center", verticalAlign: "middle" }}>Status</Table.Th>
										<Table.Th style={{ textAlign: "center", verticalAlign: "middle" }}>Acoes</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{visibleDisputes.map((dispute) => {
										const active = dispute.request.id === selectedDisputeId;
										const estado = dispute.contract?.estado;

										return (
											<Table.Tr key={dispute.request.id} data-selected={active || undefined}>
												<Table.Td style={{ textAlign: "left", verticalAlign: "middle" }}>
													<Stack gap={0} align="flex-start">
														<Text fw={600}>Disputa #{dispute.request.id}</Text>
													</Stack>
												</Table.Td>
												<Table.Td style={{ textAlign: "center", verticalAlign: "middle" }}>
													<Text fw={500} lineClamp={2}>
														{dispute.contract?.motivo ?? dispute.request.disputeReason ?? "-"}
													</Text>
												</Table.Td>
												<Table.Td style={{ textAlign: "center", verticalAlign: "middle" }}>
													<Badge variant="light" color={statusColor(estado)}>
														{statusLabel(estado)}
													</Badge>
												</Table.Td>
												<Table.Td style={{ textAlign: "center", verticalAlign: "middle" }}>
													<Group gap="xs" wrap="nowrap" justify="center">
														<Button size="xs" variant="light" onClick={() => void onSelectDispute(dispute.request.id)}>
															Detalhes
														</Button>
													</Group>
												</Table.Td>
											</Table.Tr>
										);
									})}
								</Table.Tbody>
							</Table>
						</Box>
					) : (
						renderEmptyState("Sem disputas para exibir.")
					)}
				</Stack>
			</Card>

			<Modal
				opened={selectedDispute !== null}
				onClose={onCloseDispute}
				title={disputeTitle}
				size="xl"
				centered={false}
				fullScreen={false}
				scrollAreaComponent={ScrollArea.Autosize}
				transitionProps={{ transition: "fade", duration: 150 }}
				overlayProps={{ opacity: 0.55, blur: 3 }}
			>
				{selectedDispute ? (
					<Stack gap="lg">
						<Stack gap={4}>
							<Text size="sm" c="dimmed">
								{disputeSubtitle}
							</Text>
							<Group justify="space-between" align="flex-start">
								<Badge variant="light" color={statusColor(selectedState)}>
									{statusLabel(selectedState)}
								</Badge>
							</Group>
						</Stack>

						<Stack gap={6}>
							<Text size="sm">
								Cliente (quem abriu): {formatParticipantIdentity(selectedDispute.request.clientName, selectedDispute.request.clientAddress)}
							</Text>
							<Text size="sm">
								Tecnico (outra parte): {formatParticipantIdentity(selectedDispute.request.technicianName, selectedDispute.request.technicianAddress)}
							</Text>
							<Text size="sm">Motivo: {selectedDispute.request.disputeReason ?? selectedDispute.contract?.motivo ?? "-"}</Text>
							<Text size="sm">
								Total de RPT a favor de quem abriu: {formatVoteValue(selectedDispute.contract?.votesForOpener)}
							</Text>
							<Text size="sm">
								Total de RPT a favor da outra parte: {formatVoteValue(selectedDispute.contract?.votesForOpposing)}
							</Text>
							<Text size="sm">Prazo: {formatDateTime(selectedDispute.contract?.deadline)}</Text>
						</Stack>

						<Divider />

						<Card withBorder radius="md" shadow="none" padding="md" bg="var(--mantine-color-gray-0)">
							<Stack gap="sm">
								<Group justify="space-between" align="center">
									<Title order={4}>Linha do tempo das evidências</Title>
									<Text size="sm" c="dimmed">
										{selectedEvidence.length} registros
									</Text>
								</Group>

								{selectedEvidence.length > 0 ? (
									<EvidenceTimeline dispute={selectedDispute} evidence={selectedEvidence} />
								) : (
									renderEmptyState("Ainda nao ha evidencias registradas no contrato.")
								)}
							</Stack>
						</Card>

						<Divider />

						{!connected ? (
							<Text size="sm" c="dimmed">
								Conecte a carteira para interagir com o contrato.
							</Text>
						) : selectedResolved ? (
							<Text size="sm" c="dimmed">
								Esta disputa ja foi resolvida no contrato. O modal fica apenas em leitura.
							</Text>
						) : selectedCanSendEvidence ? (
							<Stack gap="md">
								<Stack gap={2}>
									<Title order={4}>Enviar evidência</Title>
									<Text size="sm" c="dimmed">
										Apenas cliente ou tecnico da ordem podem registrar evidencia enquanto a janela estiver aberta.
									</Text>
								</Stack>

								<Textarea
									label="Nova evidência"
									description="Escreva o que precisa ficar gravado no contrato."
									minRows={5}
									value={evidenceDraft}
									onChange={(event) => onEvidenceDraftChange(event.currentTarget.value)}
								/>

								<Group justify="flex-end">
									<Button
										type="button"
										onClick={() => void onSubmitEvidence()}
										loading={busyDisputeId === selectedDispute.request.id}
										disabled={evidenceDraft.trim().length === 0}
									>
										Enviar evidência
									</Button>
								</Group>
							</Stack>
						) : selectedCanVote ? (
							<Stack gap="md">
								<Stack gap={2}>
									<Title order={4}>Votar na disputa</Title>
									<Text size="sm" c="dimmed">
										Quem nao participa da ordem pode votar enquanto a janela estiver aberta. O contrato soma o saldo de RTP
										do votante como peso do voto no momento do envio.
									</Text>
								</Stack>

								<SegmentedControl
									value={selectedVoteSupportOpener ? "apoio_opener" : "apoio_opposing"}
									onChange={(value) => {
										if (!selectedVoteLocked) {
											onVoteSupportChange(value === "apoio_opener");
										}
									}}
									disabled={selectedVoteLocked}
									data={[
										{
											label: voteOptionLabels.openerLabel,
											value: "apoio_opener",
											disabled: selectedVoteLocked && selectedVoteSupportOpener === false,
										},
										{
											label: voteOptionLabels.opposingLabel,
											value: "apoio_opposing",
											disabled: selectedVoteLocked && selectedVoteSupportOpener === true,
										},
									]}
								/>

								<Text size="sm" c={hasVotingTokens ? "dimmed" : "red"}>
									{selectedVoteLocked
										? "Seu voto ja foi registrado nesta disputa."
										: hasVotingTokens
										? "Seu voto sera enviado ao contrato e contabilizado pelo saldo de RTP do momento."
										: "Voce precisa ter RPT para votar."}
								</Text>

								<Group justify="flex-end">
									<Button
										type="button"
										onClick={() => void onSubmitVote()}
										loading={busyDisputeId === selectedDispute.request.id}
										disabled={!hasVotingTokens || selectedVoteLocked}
									>
										Registrar voto
									</Button>
								</Group>
							</Stack>
						) : selectedCanResolve ? (
							<Group justify="flex-end">
								<Button
									type="button"
									onClick={() => void onResolveDispute()}
									loading={busyDisputeId === selectedDispute.request.id}
								>
									Resolver disputa
								</Button>
							</Group>
						) : (
							<Text size="sm" c="dimmed">
								A disputa ainda nao esta em uma janela valida para interacoes.
							</Text>
						)}
					</Stack>
				) : null}
			</Modal>
		</Stack>
	);
}
