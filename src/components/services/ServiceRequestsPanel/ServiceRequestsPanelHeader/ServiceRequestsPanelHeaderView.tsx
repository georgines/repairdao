import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./ServiceRequestsPanelHeaderView.module.css";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import { shortServiceRequestAddress } from "@/services/serviceRequests/serviceRequestPresentation";

type ServiceRequestsPanelHeaderViewProps = {
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	clientRequests: ServiceRequestSummary[];
	visibleRequests: ServiceRequestSummary[];
	loading: boolean;
	onRefresh: () => void;
};

export function ServiceRequestsPanelHeaderView({
	connected,
	walletAddress,
	walletNotice,
	perfilAtivo,
	clientRequests,
	visibleRequests,
	loading,
	onRefresh,
}: ServiceRequestsPanelHeaderViewProps) {
	const withBudget = clientRequests.filter((request) => request.status === "orcada").length;
	const completedRequests = clientRequests.filter((request) => request.status === "concluida").length;
	const disputedRequests = clientRequests.filter((request) => request.status === "disputada").length;
	const walletLabel = connected ? `carteira: ${shortServiceRequestAddress(walletAddress ?? "")}` : "carteira desconectada";
	const perfilBadgeColor = perfilAtivo === "tecnico" ? "blue" : "grape";
	const connectionBadgeColor = connected ? "teal" : "gray";

	let perfilBadge = null;
	if (perfilAtivo) {
		perfilBadge = (
			<Badge variant="light" color={perfilBadgeColor}>
				{perfilAtivo}
			</Badge>
		);
	}

	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.card}>
			<Stack gap="sm">
				<Stack gap={4}>
					<Text size="xs" tt="uppercase" fw={700} c="dimmed">
						Servicos
					</Text>
					<Title order={1}>Acompanhe suas ordens de servico</Title>
					<Text size="sm" c="dimmed">
						Aqui ficam as ordens do cliente e do tecnico, os valores em RPT, o pagamento e a conclusao.
					</Text>
				</Stack>

				<Group gap="sm">
					<Badge variant="light">{clientRequests.length} cadastradas</Badge>
					<Badge variant="light">{visibleRequests.length} visiveis</Badge>
					<Badge variant="light">{withBudget} com valor em RPT</Badge>
					<Badge variant="light">{completedRequests} concluidas</Badge>
					<Badge variant="light">{disputedRequests} em disputa</Badge>
					{perfilBadge}
					<Badge variant="light" color={connectionBadgeColor}>
						{walletLabel}
					</Badge>
				</Group>

				<Group justify="space-between" wrap="nowrap">
					<Text size="sm" c="dimmed">
						{walletNotice ?? "Use a lista para acompanhar suas ordens, aprovar pagamentos e concluir servicos."}
					</Text>

					<Button variant="light" onClick={onRefresh} loading={loading}>
						Atualizar
					</Button>
				</Group>
			</Stack>
		</Card>
	);
}
