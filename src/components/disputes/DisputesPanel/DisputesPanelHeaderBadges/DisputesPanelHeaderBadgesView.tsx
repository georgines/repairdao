import { Badge, Group } from "@mantine/core";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import styles from "./DisputesPanelHeaderBadgesView.module.css";

type DisputesPanelHeaderBadgesViewProps = {
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	connected: boolean;
	walletAddress: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
};

function countLabel(count: number, singular: string, plural: string) {
	return `${count} ${count === 1 ? singular : plural}`;
}

export function DisputesPanelHeaderBadgesView({
	disputes,
	visibleDisputes,
	connected,
	walletAddress,
	perfilAtivo,
}: DisputesPanelHeaderBadgesViewProps) {
	let perfilBadge = null;
	let walletBadgeColor: "teal" | "gray" = "gray";
	let walletBadgeLabel = "carteira desconectada";

	if (perfilAtivo !== null) {
		perfilBadge = <Badge variant="light">{perfilAtivo}</Badge>;
	}

	if (connected) {
		walletBadgeColor = "teal";
		walletBadgeLabel = `carteira: ${formatarEnderecoCurto(walletAddress ?? "")}`;
	}

	return (
		<Group gap="sm" className={styles.root}>
			<Badge variant="light">{countLabel(disputes.length, "registrada", "registradas")}</Badge>
			<Badge variant="light">{countLabel(visibleDisputes.length, "visivel", "visiveis")}</Badge>
			{perfilBadge}
			<Badge variant="light" color={walletBadgeColor}>
				{walletBadgeLabel}
			</Badge>
		</Group>
	);
}
