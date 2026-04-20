import { Button, Group, Text } from "@mantine/core";
import { getDepositConfigurationFooterNotice } from "@/services/deposit/depositConfigurationPresentation";
import styles from "./DepositConfigurationPanelFormFooterView.module.css";

type DepositConfigurationPanelFormFooterViewProps = {
	connected: boolean;
	isOwner: boolean;
	saving: boolean;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelFormFooterView({
	connected,
	isOwner,
	saving,
	onSubmit,
}: DepositConfigurationPanelFormFooterViewProps) {
	const footerNotice = getDepositConfigurationFooterNotice(connected);

	return (
		<Group justify="space-between" align="center" className={styles.root}>
			<Text size="sm" c="dimmed">
				{footerNotice}
			</Text>
			<Button onClick={() => void onSubmit()} loading={saving} disabled={!connected || !isOwner}>
				Salvar no contrato
			</Button>
		</Group>
	);
}
