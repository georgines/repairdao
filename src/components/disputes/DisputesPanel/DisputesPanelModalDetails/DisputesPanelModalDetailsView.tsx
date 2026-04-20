import { Stack, Text } from "@mantine/core";
import { formatParticipantIdentity, formatVoteValue, formatDateTime } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import styles from "./DisputesPanelModalDetailsView.module.css";

type DisputesPanelModalDetailsViewProps = {
	selectedDispute: DisputeItem;
};

export function DisputesPanelModalDetailsView({ selectedDispute }: DisputesPanelModalDetailsViewProps) {
	const clientLabel = formatParticipantIdentity(selectedDispute.request.clientName, selectedDispute.request.clientAddress);
	const technicianLabel = formatParticipantIdentity(selectedDispute.request.technicianName, selectedDispute.request.technicianAddress);
	let motivoLabel = "-";

	if (selectedDispute.request.disputeReason) {
		motivoLabel = selectedDispute.request.disputeReason;
	} else if (selectedDispute.contract?.motivo) {
		motivoLabel = selectedDispute.contract.motivo;
	}

	const votesForOpenerLabel = formatVoteValue(selectedDispute.contract?.votesForOpener);
	const votesForOpposingLabel = formatVoteValue(selectedDispute.contract?.votesForOpposing);
	const deadlineLabel = formatDateTime(selectedDispute.contract?.deadline);

	return (
		<Stack gap={6} className={styles.root}>
			<Text size="sm">Cliente (quem abriu): {clientLabel}</Text>
			<Text size="sm">Tecnico (outra parte): {technicianLabel}</Text>
			<Text size="sm">Motivo: {motivoLabel}</Text>
			<Text size="sm">Total de RPT a favor de quem abriu: {votesForOpenerLabel}</Text>
			<Text size="sm">Total de RPT a favor da outra parte: {votesForOpposingLabel}</Text>
			<Text size="sm">Prazo: {deadlineLabel}</Text>
		</Stack>
	);
}
