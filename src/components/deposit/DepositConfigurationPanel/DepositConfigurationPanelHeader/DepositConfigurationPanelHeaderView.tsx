import { Stack } from "@mantine/core";
import styles from "./DepositConfigurationPanelHeaderView.module.css";
import { DepositConfigurationPanelHeaderDetails } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderDetails/DepositConfigurationPanelHeaderDetails";
import { DepositConfigurationPanelHeaderTop } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderTop/DepositConfigurationPanelHeaderTop";

type DepositConfigurationPanelHeaderViewProps = {
	statusLabel: string;
	statusColor: "teal" | "gray";
	minDeposit: string;
	donoAtualCurto: string;
	walletNotice: string;
};

export function DepositConfigurationPanelHeaderView({
	statusLabel,
	statusColor,
	minDeposit,
	donoAtualCurto,
	walletNotice,
}: DepositConfigurationPanelHeaderViewProps) {
	return (
		<Stack gap={4} className={styles.root}>
			<DepositConfigurationPanelHeaderTop statusLabel={statusLabel} statusColor={statusColor} />
			<DepositConfigurationPanelHeaderDetails
				minDeposit={minDeposit}
				donoAtualCurto={donoAtualCurto}
				walletNotice={walletNotice}
			/>
		</Stack>
	);
}
