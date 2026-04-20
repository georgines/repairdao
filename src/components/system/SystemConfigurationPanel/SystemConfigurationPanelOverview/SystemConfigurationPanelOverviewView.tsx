"use client";

import { Stack, Text } from "@mantine/core";
import styles from "./SystemConfigurationPanelOverviewView.module.css";
import { formatarRPT } from "@/services/wallet/formatters";

type SystemConfigurationPanelOverviewViewProps = {
	minDeposit: string;
	tokensPerEth: string;
	donoDepositoAtualCurto: string;
	donoTokenAtualCurto: string;
	walletNotice: string;
};

export function SystemConfigurationPanelOverviewView({
	minDeposit,
	tokensPerEth,
	donoDepositoAtualCurto,
	donoTokenAtualCurto,
	walletNotice,
}: SystemConfigurationPanelOverviewViewProps) {
	return (
		<Stack gap={4} className={styles.root}>
			<Text size="sm">
				Deposito minimo atual: <strong>{formatarRPT(minDeposit)}</strong>
			</Text>
			<Text size="sm">
				Taxa atual: <strong>1 ETH = {tokensPerEth} RPT</strong>
			</Text>
			<Text size="sm" c="dimmed">
				Dono do deposito: {donoDepositoAtualCurto}
			</Text>
			<Text size="sm" c="dimmed">
				Dono da taxa de cambio: {donoTokenAtualCurto}
			</Text>
			<Text size="sm" c="dimmed">
				Carteira conectada: {walletNotice}
			</Text>
		</Stack>
	);
}
