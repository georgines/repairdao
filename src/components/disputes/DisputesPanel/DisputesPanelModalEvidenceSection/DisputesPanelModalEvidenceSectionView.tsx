import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import {
	formatDisputesPanelModalDateTime,
	getDisputesPanelEvidenceRoleLabel,
} from "@/services/disputes/disputesPanelModal";
import styles from "./DisputesPanelModalEvidenceSectionView.module.css";

type DisputesPanelModalEvidenceSectionViewProps = {
	dispute: DisputeItem;
	selectedEvidence: EvidenciaContratoDominio[];
};

type EvidenceTimelineProps = {
	dispute: DisputeItem;
	evidence: EvidenciaContratoDominio[];
};

function resolveEvidenceSide(
	openedBy: string,
	opposingParty: string,
	author: string,
	index: number,
) {
	if (openedBy && author === openedBy) {
		return "left" as const;
	}

	if (opposingParty && author === opposingParty) {
		return "right" as const;
	}

	if (index % 2 === 0) {
		return "left" as const;
	}

	return "right" as const;
}

function resolveEvidenceSideLabel(side: "left" | "right", sideRoleLabel: string | null) {
	let label = "Outra parte";

	if (side === "left") {
		label = "Quem abriu";
	}

	if (sideRoleLabel !== null) {
		label = sideRoleLabel;
	}

	return label;
}

function EvidenceTimeline({ dispute, evidence }: EvidenceTimelineProps) {
	return (
		<div className={styles.timelineShell}>
			<div className={styles.timelineTrack} aria-hidden="true" />
			<Stack gap="md" className={styles.timelineList}>
				{evidence.map((item, index) => {
					const author = item.submittedBy.trim().toLowerCase();
					const openedBy = dispute.contract?.openedBy?.trim().toLowerCase() ?? "";
					const opposingParty = dispute.contract?.opposingParty?.trim().toLowerCase() ?? "";
					const side = resolveEvidenceSide(openedBy, opposingParty, author, index);
					let sideColor: "teal" | "indigo" = "indigo";

					if (side === "left") {
						sideColor = "teal";
					}

					const sideRoleLabel = getDisputesPanelEvidenceRoleLabel(item.submittedBy, dispute);
					const sideLabel = resolveEvidenceSideLabel(side, sideRoleLabel);

					return (
						<div key={`${item.timestamp}-${index}`} data-evidence-side={side}>
							<Card withBorder radius="md" shadow="none" padding="md" className={styles.root}>
								<Stack gap={8}>
									<Group justify="space-between" align="flex-start" wrap="nowrap">
										<Stack gap={2}>
											<Group gap={6} wrap="nowrap" align="center">
												<Text size="sm" fw={700}>
													{item.submittedBy}
												</Text>
												<Text size="xs" c="dimmed">
													#{index + 1}
												</Text>
											</Group>
											<Text size="xs" c="dimmed">
												{formatDisputesPanelModalDateTime(item.timestamp)}
											</Text>
										</Stack>

										<Stack gap={4} align="flex-end">
											<Text size="xs" c="dimmed">
												{sideRoleLabel ?? ""}
											</Text>
											<Badge variant="light" color={sideColor}>
												{sideLabel}
											</Badge>
										</Stack>
									</Group>

									<Text size="sm" className={styles.timelineContent}>
										{item.content}
									</Text>
								</Stack>
							</Card>
						</div>
					);
				})}
			</Stack>
		</div>
	);
}

export function DisputesPanelModalEvidenceSectionView({
	dispute,
	selectedEvidence,
}: DisputesPanelModalEvidenceSectionViewProps) {
	let content = (
		<Text size="sm" c="dimmed">
			Ainda nao ha evidências registradas no contrato.
		</Text>
	);

	if (selectedEvidence.length > 0) {
		content = <EvidenceTimeline dispute={dispute} evidence={selectedEvidence} />;
	}

	return (
		<Card withBorder radius="md" shadow="none" padding="md" className={styles.root}>
			<Stack gap="sm">
				<Group justify="space-between" align="center">
					<Title order={4}>Linha do tempo das evidências</Title>
					<Text size="sm" c="dimmed">
						{selectedEvidence.length} registros
					</Text>
				</Group>

				{content}
			</Stack>
		</Card>
	);
}
