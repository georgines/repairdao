import { Text } from "@mantine/core";
import { formatarRPT } from "@/services/wallet/formatters";
import styles from "./DepositConfigurationPanelHeaderDetailsView.module.css";

type DepositConfigurationPanelHeaderDetailsViewProps = {
	minDeposit: string;
	donoAtualCurto: string;
	walletNotice: string;
};

export function DepositConfigurationPanelHeaderDetailsView({
	minDeposit,
	donoAtualCurto,
	walletNotice,
}: DepositConfigurationPanelHeaderDetailsViewProps) {
	return (
		<div className={styles.root}>
			<Text size="sm">
				Valor atual: <strong>{formatarRPT(minDeposit)}</strong>
			</Text>
			<Text size="sm" c="dimmed">
				Dono do contrato: {donoAtualCurto}
			</Text>
			<Text size="sm" c="dimmed">
				Carteira conectada: {walletNotice}
			</Text>
		</div>
	);
}
