import { Card, Stack, Text, Title } from "@mantine/core";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { DisputesPanelHeaderBadges } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderBadges/DisputesPanelHeaderBadges";
import { DisputesPanelHeaderNotice } from "@/components/disputes/DisputesPanel/DisputesPanelHeaderNotice/DisputesPanelHeaderNotice";
import styles from "./DisputesPanelHeaderView.module.css";

type DisputesPanelHeaderViewProps = {
	disputes: DisputeItem[];
	visibleDisputes: DisputeItem[];
	connected: boolean;
	walletAddress: string | null;
	walletNotice: string | null;
	perfilAtivo: "cliente" | "tecnico" | null;
	loading: boolean;
	onRefresh: () => void;
};

export function DisputesPanelHeaderView({
	disputes,
	visibleDisputes,
	connected,
	walletAddress,
	walletNotice,
	perfilAtivo,
	loading,
	onRefresh,
}: DisputesPanelHeaderViewProps) {
	return (
		<Card withBorder radius="sm" shadow="none" padding="lg" className={styles.card}>
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

				<DisputesPanelHeaderBadges
					disputes={disputes}
					visibleDisputes={visibleDisputes}
					connected={connected}
					walletAddress={walletAddress}
					perfilAtivo={perfilAtivo}
				/>

				<DisputesPanelHeaderNotice walletNotice={walletNotice} loading={loading} onRefresh={onRefresh} />
			</Stack>
		</Card>
	);
}

