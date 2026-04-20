import { Text, TextInput } from "@mantine/core";
import styles from "./DepositConfigurationPanelFormFieldView.module.css";

type DepositConfigurationPanelFormFieldViewProps = {
	connected: boolean;
	isOwner: boolean;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
};

export function DepositConfigurationPanelFormFieldView({
	connected,
	isOwner,
	editingMinDeposit,
	saving,
	onEditingMinDepositChange,
}: DepositConfigurationPanelFormFieldViewProps) {
	return (
		<div className={styles.root}>
			<TextInput
				label="Deposito minimo (RPT)"
				description="Use o valor em RPT que a conta precisa depositar para ficar ativa."
				value={editingMinDeposit}
				onChange={(event) => onEditingMinDepositChange(event.currentTarget.value)}
				disabled={!connected || !isOwner || saving}
				rightSection={<Text size="xs" c="dimmed">RPT</Text>}
			/>
		</div>
	);
}
