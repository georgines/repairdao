"use client";

import { Button, Flex, Paper, Text } from "@mantine/core";
import { formatarEnderecoCurto, formatarNumero, formatarUSD } from "@/services/wallet/formatters";
import { NetworkSelector } from "@/components/wallet/NetworkSelector";

export type WalletStatusProps = {
	connected: boolean;
	loading: boolean;
	address: string | null;
	chainLabel: string;
	ethBalance: string;
	usdBalance: string;
	actionLabel: string;
	onAction: () => void;
};

export function WalletStatus({
	connected,
	loading,
	address,
	chainLabel,
	ethBalance,
	usdBalance,
	actionLabel,
	onAction,
}: WalletStatusProps) {
	return (
		<Paper
			withBorder
			radius="sm"
			p="xs"
			sx={(theme) => ({
				background: "rgba(255, 255, 255, 0.92)",
				width: "100%",
				minWidth: 0,
				boxSizing: "border-box",
				overflow: "hidden",
				paddingInline: theme.spacing.xs,
				paddingBlock: theme.spacing.xs,
			})}
		>
			<Flex align="center" justify="space-between" wrap="nowrap" gap="xs" style={{ minWidth: 0 }}>
				<Flex align="center" gap={8} wrap="nowrap" style={{ minWidth: 0, flex: "1 1 auto" }}>
					<NetworkSelector />
					<Text size="xs" fw={600} c="dimmed" truncate>
						Carteira {chainLabel}
					</Text>
					<Text size="xs" c="dimmed" truncate>
						{formatarEnderecoCurto(address)}
					</Text>
				</Flex>

				<Flex align="center" gap={10} wrap="nowrap" style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}>
					<Text size="xs" fw={700}>
						ETH {formatarNumero(ethBalance, 4)}
					</Text>
					<Text size="xs" fw={700}>
						USD {formatarUSD(usdBalance)}
					</Text>
				</Flex>

				<Button
					size="compact-xs"
					variant={connected ? "light" : "filled"}
					onClick={onAction}
					loading={loading}
					style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}
				>
					{actionLabel}
				</Button>
			</Flex>
		</Paper>
	);
}
