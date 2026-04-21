import { Alert, Button, Group, Modal, SegmentedControl, Stack, Text, Textarea, TextInput } from "@mantine/core";
import type { GovernanceProposalAction } from "@/services/governance/governanceTypes";
import {
	getGovernanceProposalActionDescription,
	getGovernanceProposalActionLabel,
} from "@/services/governance/governancePresentation";
import styles from "./GovernancePanelCreateProposalModalView.module.css";

export type GovernancePanelCreateProposalFormProps = {
	action: GovernanceProposalAction;
	description: string;
	value: string;
	saving: boolean;
	error: string | null;
	onActionChange: (value: GovernanceProposalAction) => void;
	onDescriptionChange: (value: string) => void;
	onValueChange: (value: string) => void;
	onSubmit: () => Promise<boolean>;
};

export type GovernancePanelCreateProposalModalViewProps = {
	opened: boolean;
	connected: boolean;
	canCreateProposal: boolean;
	walletAddress: string | null;
	form: GovernancePanelCreateProposalFormProps;
	onClose: () => void;
};

function proposalActionOptions() {
	return [
		{ value: "min_deposit", label: "Deposito minimo" },
		{ value: "tokens_per_eth", label: "Taxa de cambio" },
	];
}

function getValuePlaceholder(action: GovernanceProposalAction) {
	if (action === "min_deposit") {
		return "Ex: 150";
	}

	return "Ex: 10000000";
}

export function GovernancePanelCreateProposalModalView({
	opened,
	connected,
	canCreateProposal,
	walletAddress,
	form,
	onClose,
}: GovernancePanelCreateProposalModalViewProps) {
	async function handleCreateProposal() {
		const success = await form.onSubmit();

		if (success) {
			onClose();
		}
	}

	let disconnectedNotice: React.ReactNode = null;
	let noPermissionNotice: React.ReactNode = null;
	let errorNotice: React.ReactNode = null;
	let statusLabel = "Conecte a carteira para continuar";

	if (!connected) {
		disconnectedNotice = (
			<Alert color="gray" title="Carteira desconectada">
				Conecte uma carteira para criar propostas.
			</Alert>
		);
	}

	if (connected) {
		statusLabel = `Carteira: ${walletAddress ?? "desconhecida"}`;
	}

	if (connected && !canCreateProposal) {
		noPermissionNotice = (
			<Alert color="yellow" title="Sem permissao para propor">
				Esta carteira pode acompanhar as votacoes, mas ainda nao pode criar novas propostas.
			</Alert>
		);
	}

	if (form.error) {
		errorNotice = (
			<Alert color="red" title="Nao foi possivel criar a proposta">
				{form.error}
			</Alert>
		);
	}

	const submitDisabled = !connected || !canCreateProposal;

	return (
		<Modal opened={opened} onClose={onClose} title="Criar proposta" centered>
			<Stack gap="md" className={styles.root}>
				<Text size="sm" c="dimmed">
					Selecione o tipo de modificacao, descreva o motivo e informe o novo valor. A proposta entra direto na tabela de votacao.
				</Text>

				{disconnectedNotice}
				{noPermissionNotice}
				{errorNotice}

				<SegmentedControl
					value={form.action}
					onChange={(value) => form.onActionChange(value as GovernanceProposalAction)}
					data={proposalActionOptions()}
					fullWidth
				/>

				<Textarea
					label="Descricao"
					description="Explique o motivo da mudanca. O texto fica visivel para todos os votantes."
					minRows={4}
					value={form.description}
					onChange={(event) => form.onDescriptionChange(event.currentTarget.value)}
					disabled={form.saving || submitDisabled}
				/>

				<TextInput
					label={getGovernanceProposalActionLabel(form.action)}
					description={getGovernanceProposalActionDescription(form.action)}
					placeholder={getValuePlaceholder(form.action)}
					value={form.value}
					onChange={(event) => form.onValueChange(event.currentTarget.value)}
					disabled={form.saving || submitDisabled}
				/>

				<Group justify="space-between" align="center">
					<Text size="sm" c="dimmed">
						{statusLabel}
					</Text>
					<Button onClick={() => void handleCreateProposal()} loading={form.saving} disabled={submitDisabled}>
						Criar proposta
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
