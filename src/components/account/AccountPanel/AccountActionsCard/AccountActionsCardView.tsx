import type { ReactNode } from "react";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import styles from "./AccountActionsCardView.module.css";

export type AccountActionsCardViewProps = {
	walletNotice: string | null;
	withdrawingDeposit: boolean;
	withdrawingRewards: boolean;
	error: string | null;
	canWithdrawDeposit: boolean;
	canWithdrawRewards: boolean;
	onWithdrawDeposit: () => void;
	onWithdrawRewards: () => void;
	connected: boolean;
};

export function AccountActionsCardView({
	walletNotice,
	withdrawingDeposit,
	withdrawingRewards,
	error,
	canWithdrawDeposit,
	canWithdrawRewards,
	onWithdrawDeposit,
	onWithdrawRewards,
	connected,
}: AccountActionsCardViewProps) {
	const walletNoticeNode = walletNotice ? (
		<Text size="sm" c="dimmed">
			{walletNotice}
		</Text>
	) : null;

	let connectionWarningNode: ReactNode = null;
	if (!connected) {
		connectionWarningNode = (
			<Text size="sm" c="red" role="status" aria-live="polite">
				Conecte a carteira para carregar e sacar os valores da conta.
			</Text>
		);
	}

	const errorNode = error ? (
		<Text size="sm" c="red" role="status" aria-live="assertive">
			{error}
		</Text>
	) : null;

	return (
		<Card withBorder shadow="none" padding="md" radius="md" className={styles.card}>
			<Stack gap="sm">
				<Stack gap={2}>
					<Text size="xs" tt="uppercase" fw={700} c="dimmed">
						Saques
					</Text>
					<Text size="sm" c="dimmed">
						Use os botoes abaixo para sacar deposito e rendimentos de forma independente.
					</Text>
				</Stack>

				<Group grow wrap="wrap" align="stretch">
					<Button onClick={onWithdrawDeposit} loading={withdrawingDeposit} disabled={!canWithdrawDeposit}>
						Sacar deposito
					</Button>
					<Button
						variant="outline"
						onClick={onWithdrawRewards}
						loading={withdrawingRewards}
						disabled={!canWithdrawRewards}
					>
						Sacar rendimentos
					</Button>
				</Group>

				<Text size="sm" c="dimmed">
					Sacar o deposito desativa a conta e reinicia o nivel. Sacar os rendimentos mantem o deposito ativo.
				</Text>

				{walletNoticeNode}
				{connectionWarningNode}
				{errorNode}
			</Stack>
		</Card>
	);
}
