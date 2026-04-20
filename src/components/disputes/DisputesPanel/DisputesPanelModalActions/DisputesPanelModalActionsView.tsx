import { Button, Group, SegmentedControl, Stack, Text, Textarea, Title } from "@mantine/core";
import styles from "./DisputesPanelModalActionsView.module.css";

type DisputesPanelModalActionsViewProps = {
	kind: "disconnected" | "resolved" | "evidence" | "vote" | "resolve" | "fallback";
	hasVotingTokens: boolean;
	busyDisputeId: number | null;
	selectedDisputeId: number;
	selectedVoteLocked: boolean;
	selectedVoteSupportOpener: boolean;
	voteOptionLabels: { openerLabel: string; opposingLabel: string };
	evidenceDraft: string;
	onEvidenceDraftChange: (value: string) => void;
	onVoteSupportChange: (value: boolean) => void;
	onSubmitEvidence: () => Promise<void>;
	onSubmitVote: () => Promise<void>;
	onResolveDispute: () => Promise<void>;
};

function Notice({ children }: { children: string }) {
	return <Text size="sm" c="dimmed">{children}</Text>;
}

function EvidenceAction({
	busyDisputeId,
	selectedDisputeId,
	evidenceDraft,
	onEvidenceDraftChange,
	onSubmitEvidence,
}: Pick<
	DisputesPanelModalActionsViewProps,
	"busyDisputeId" | "selectedDisputeId" | "evidenceDraft" | "onEvidenceDraftChange" | "onSubmitEvidence"
>) {
	return (
		<Stack gap="md">
			<Stack gap={2}>
				<Title order={4}>Enviar evidência</Title>
				<Text size="sm" c="dimmed">
					Apenas cliente ou tecnico da ordem podem registrar evidência enquanto a janela estiver aberta.
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
					loading={busyDisputeId === selectedDisputeId}
					disabled={evidenceDraft.trim().length === 0}
				>
					Enviar evidência
				</Button>
			</Group>
		</Stack>
	);
}

function VoteAction({
	busyDisputeId,
	selectedDisputeId,
	hasVotingTokens,
	selectedVoteLocked,
	selectedVoteSupportOpener,
	voteOptionLabels,
	onVoteSupportChange,
	onSubmitVote,
}: Pick<
	DisputesPanelModalActionsViewProps,
	| "busyDisputeId"
	| "selectedDisputeId"
	| "hasVotingTokens"
	| "selectedVoteLocked"
	| "selectedVoteSupportOpener"
	| "voteOptionLabels"
	| "onVoteSupportChange"
	| "onSubmitVote"
>) {
	const voteControlValue = selectedVoteSupportOpener ? "apoio_opener" : "apoio_opposing";
	const voteMessage = selectedVoteLocked
		? "Seu voto ja foi registrado nesta disputa."
		: hasVotingTokens
			? "Seu voto sera enviado ao contrato e contabilizado pelo saldo de RTP do momento."
			: "Voce precisa ter RPT para votar.";
	const voteMessageColor = hasVotingTokens ? "dimmed" : "red";

	return (
		<Stack gap="md">
			<Stack gap={2}>
				<Title order={4}>Votar na disputa</Title>
				<Text size="sm" c="dimmed">
					Quem nao participa da ordem pode votar enquanto a janela estiver aberta. O contrato soma o saldo de RTP do votante
					como peso do voto no momento do envio.
				</Text>
			</Stack>
			<SegmentedControl
				value={voteControlValue}
				onChange={(value) => {
					if (!selectedVoteLocked) {
						onVoteSupportChange(value === "apoio_opener");
					}
				}}
				disabled={selectedVoteLocked}
				data={[
					{ label: voteOptionLabels.openerLabel, value: "apoio_opener", disabled: selectedVoteLocked && selectedVoteSupportOpener === false },
					{ label: voteOptionLabels.opposingLabel, value: "apoio_opposing", disabled: selectedVoteLocked && selectedVoteSupportOpener === true },
				]}
			/>
			<Text size="sm" c={voteMessageColor}>
				{voteMessage}
			</Text>
			<Group justify="flex-end">
				<Button
					type="button"
					onClick={() => void onSubmitVote()}
					loading={busyDisputeId === selectedDisputeId}
					disabled={!hasVotingTokens || selectedVoteLocked}
				>
					Registrar voto
				</Button>
			</Group>
		</Stack>
	);
}

function ResolveAction({
	busyDisputeId,
	selectedDisputeId,
	onResolveDispute,
}: Pick<DisputesPanelModalActionsViewProps, "busyDisputeId" | "selectedDisputeId" | "onResolveDispute">) {
	return (
		<Group justify="flex-end">
			<Button type="button" onClick={() => void onResolveDispute()} loading={busyDisputeId === selectedDisputeId}>
				Resolver disputa
			</Button>
		</Group>
	);
}

export function DisputesPanelModalActionsView(props: DisputesPanelModalActionsViewProps) {
	let actionNode = <Notice>A disputa ainda nao esta em uma janela valida para interacoes.</Notice>;

	if (props.kind === "disconnected") {
		actionNode = <Notice>Conecte a carteira para interagir com o contrato.</Notice>;
	} else if (props.kind === "resolved") {
		actionNode = <Notice>Esta disputa ja foi resolvida no contrato. O modal fica apenas em leitura.</Notice>;
	} else if (props.kind === "evidence") {
		actionNode = (
			<EvidenceAction
				busyDisputeId={props.busyDisputeId}
				selectedDisputeId={props.selectedDisputeId}
				evidenceDraft={props.evidenceDraft}
				onEvidenceDraftChange={props.onEvidenceDraftChange}
				onSubmitEvidence={props.onSubmitEvidence}
			/>
		);
	} else if (props.kind === "vote") {
		actionNode = (
			<VoteAction
				busyDisputeId={props.busyDisputeId}
				selectedDisputeId={props.selectedDisputeId}
				hasVotingTokens={props.hasVotingTokens}
				selectedVoteLocked={props.selectedVoteLocked}
				selectedVoteSupportOpener={props.selectedVoteSupportOpener}
				voteOptionLabels={props.voteOptionLabels}
				onVoteSupportChange={props.onVoteSupportChange}
				onSubmitVote={props.onSubmitVote}
			/>
		);
	} else if (props.kind === "resolve") {
		actionNode = (
			<ResolveAction
				busyDisputeId={props.busyDisputeId}
				selectedDisputeId={props.selectedDisputeId}
				onResolveDispute={props.onResolveDispute}
			/>
		);
	}

	return (
		<div className={styles.root}>
			{actionNode}
		</div>
	);
}
