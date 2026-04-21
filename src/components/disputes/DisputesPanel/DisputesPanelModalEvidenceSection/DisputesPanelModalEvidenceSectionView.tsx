import { Badge, Card, Group, Stack, Text, ThemeIcon, Timeline, Title } from "@mantine/core";
import type { EvidenciaContratoDominio } from "@/services/blockchain/adapters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import {
	formatDisputesPanelModalDateTime,
	getDisputesPanelEvidenceRoleLabel,
} from "@/services/disputes/disputesPanelModal";
import { formatarEnderecoCurto } from "@/services/wallet";
import styles from "./DisputesPanelModalEvidenceSectionView.module.css";

type DisputesPanelModalEvidenceSectionViewProps = {
	dispute: DisputeItem;
	selectedEvidence: EvidenciaContratoDominio[];
};

type EvidenceTimelineProps = {
	dispute: DisputeItem;
	evidence: EvidenciaContratoDominio[];
};

function resolveEvidenceCardSide(openedBy: string, opposingParty: string, author: string, index: number) {
	if (openedBy && author === openedBy) {
		return "left" as const;
	}

	if (opposingParty && author === opposingParty) {
		return "right" as const;
	}

	return index % 2 === 0 ? "left" as const : "right" as const;
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
		<Timeline active={evidence.length - 1} bulletSize={22} lineWidth={2} align="left" color="teal" className={styles.timelineRoot}>
			{evidence.map((item, index) => {
				const author = item.submittedBy.trim().toLowerCase();
				const openedBy = dispute.contract?.openedBy?.trim().toLowerCase() ?? "";
				const opposingParty = dispute.contract?.opposingParty?.trim().toLowerCase() ?? "";
				const side = resolveEvidenceCardSide(openedBy, opposingParty, author, index);
				const sideColor: "teal" | "indigo" = side === "left" ? "teal" : "indigo";

				const sideRoleLabel = getDisputesPanelEvidenceRoleLabel(item.submittedBy, dispute);
				const sideLabel = resolveEvidenceSideLabel(side, sideRoleLabel);
				const titleNode = (
					<Stack gap={4}>
						<Group justify="space-between" align="flex-start" wrap="nowrap">
							<Stack gap={0}>
								<Text size="sm" fw={700} title={item.submittedBy}>
									{formatarEnderecoCurto(item.submittedBy)}
								</Text>
								<Text size="xs" c="dimmed" title={item.timestamp}>
									{formatDisputesPanelModalDateTime(item.timestamp)}
								</Text>
								<Text size="xs" c="dimmed" title={sideRoleLabel ?? undefined}>
									{sideRoleLabel ?? ""}
								</Text>
							</Stack>

							<Badge variant="light" color={sideColor} title={sideLabel}>
								{sideLabel}
							</Badge>
						</Group>
					</Stack>
				);

				return (
					<Timeline.Item
						key={`${item.timestamp}-${index}`}
						bullet={
							<ThemeIcon radius="xl" size={22} variant="light" color={sideColor}>
								<Text size="xs" fw={700}>
									{index + 1}
								</Text>
							</ThemeIcon>
						}
						title={titleNode}
						lineVariant={index === evidence.length - 1 ? "solid" : "dashed"}
					>
						<Card withBorder radius="md" shadow="none" padding="md" className={styles.timelineCard} data-evidence-side={side}>
							<Stack gap={8}>
								<Text size="sm" className={styles.timelineContent}>
									{item.content}
								</Text>
							</Stack>
						</Card>
					</Timeline.Item>
				);
			})}
		</Timeline>
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
