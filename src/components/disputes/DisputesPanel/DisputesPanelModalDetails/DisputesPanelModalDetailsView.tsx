import { Stack, Text } from "@mantine/core";
import { formatParticipantIdentity, formatVoteValue, formatDateTime } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import styles from "./DisputesPanelModalDetailsView.module.css";

type DisputesPanelModalDetailsViewProps = {
	selectedDispute: DisputeItem;
};

export function DisputesPanelModalDetailsView({ selectedDispute }: DisputesPanelModalDetailsViewProps) {
	return (
		<Stack gap={6} className={styles.root}>
			<Text size="sm">
				Cliente (quem abriu): {formatParticipantIdentity(selectedDispute.request.clientName, selectedDispute.request.clientAddress)}
			</Text>
			<Text size="sm">
				Tecnico (outra parte): {formatParticipantIdentity(selectedDispute.request.technicianName, selectedDispute.request.technicianAddress)}
			</Text>
			<Text size="sm">Motivo: {selectedDispute.request.disputeReason ?? selectedDispute.contract?.motivo ?? "-"}</Text>
			<Text size="sm">Total de RPT a favor de quem abriu: {formatVoteValue(selectedDispute.contract?.votesForOpener)}</Text>
			<Text size="sm">Total de RPT a favor da outra parte: {formatVoteValue(selectedDispute.contract?.votesForOpposing)}</Text>
			<Text size="sm">Prazo: {formatDateTime(selectedDispute.contract?.deadline)}</Text>
		</Stack>
	);
}

