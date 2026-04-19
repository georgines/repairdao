import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./AccountPanelHeaderView.module.css";

type AccountPanelHeaderViewProps = {
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
};

export function AccountPanelHeaderView({ badgeLevel, isActive, perfilAtivo }: AccountPanelHeaderViewProps) {
	const statusLabel = isActive ? "Conta ativa" : "Conta inativa";
	const statusColor = isActive ? "teal" : "gray";
	let perfilBadge = null;

	if (perfilAtivo !== null) {
		perfilBadge = (
			<Badge variant="light" color="orange">
				Perfil {perfilAtivo}
			</Badge>
		);
	}

	return (
		<Stack gap={6} className={styles.root}>
			<Text size="xs" tt="uppercase" fw={700} c="dimmed">
				Conta
			</Text>
			<Title order={1}>Meu dinheiro depositado, rendimento, nivel e minhas avaliacoes</Title>
			<Text size="sm" c="dimmed">
				Resumo centralizado para acompanhar o saldo travado, os rendimentos acumulados, o nivel atual e o historico de avaliacoes.
			</Text>

			<Group gap="xs" className={styles.badgeRow}>
				<Badge variant="light" color={statusColor} className={styles.badge}>
					{statusLabel}
				</Badge>
				<Badge variant="light" color="blue" className={styles.badge}>
					Nivel {badgeLevel}
				</Badge>
				{perfilBadge}
			</Group>
		</Stack>
	);
}
