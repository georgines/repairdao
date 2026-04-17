"use client";

import { Badge, Button, Group, Paper, Text } from "@mantine/core";

export type WalletStatusProps = {
	connected: boolean;
	loading: boolean;
	address: string | null;
	chainLabel: string;
	tokenBalance: string;
	ethBalance: string;
	usdBalance: string;
	actionLabel: string;
	onAction: () => void;
	formatarEnderecoCurto: (address?: string | null) => string;
	formatarNumero: (valor: string, casasDecimais?: number) => string;
	formatarUSD: (valor: string) => string;
};

export function WalletStatus({
	connected,
	loading,
	address,
	chainLabel,
	tokenBalance,
	ethBalance,
	usdBalance,
	actionLabel,
	onAction,
	formatarEnderecoCurto,
	formatarNumero,
	formatarUSD,
}: WalletStatusProps) {
	return (
		<Paper
			withBorder
			radius="sm"
			p="xs"
			sx={(theme) => ({
				background: "rgba(255, 255, 255, 0.92)",
				display: "flex",
				alignItems: "center",
				gap: 6,
				flexWrap: "nowrap",
				justifyContent: "flex-end",
				minWidth: 120,
				maxWidth: "min(500px, 100%)",
				boxSizing: "border-box",
				overflowX: "auto",
				paddingRight: theme.spacing.xs,
			})}
		>
			<Group spacing={4} align="center" sx={{ flexWrap: "nowrap" }}>
				<Badge color={connected ? "teal" : "gray"} variant="light" radius="sm">
					{chainLabel}
				</Badge>
				<Text size="xs" c="dimmed">
					{formatarEnderecoCurto(address)}
				</Text>
			</Group>

			<Group spacing={6} align="center" sx={{ marginLeft: "auto", whiteSpace: "nowrap", minWidth: 0 }}>
				<Text size="xs" fw={700}>
					RPT {formatarNumero(tokenBalance, 2)}
				</Text>
				<Text size="xs" fw={700}>
					ETH {formatarNumero(ethBalance, 4)}
				</Text>
				<Text size="xs" fw={700}>
					USD {formatarUSD(usdBalance)}
				</Text>
			</Group>

			<Button size="compact-xs" variant={connected ? "light" : "filled"} onClick={onAction} loading={loading}>
				{actionLabel}
			</Button>
		</Paper>
	);
}
