import { Stack } from "@mantine/core";
import styles from "./DepositConfigurationPanelFormView.module.css";
import { DepositConfigurationPanelFormField } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormField/DepositConfigurationPanelFormField";
import { DepositConfigurationPanelFormFooter } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormFooter/DepositConfigurationPanelFormFooter";

type DepositConfigurationPanelFormViewProps = {
	connected: boolean;
	isOwner: boolean;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelFormView({
	connected,
	isOwner,
	editingMinDeposit,
	saving,
	onEditingMinDepositChange,
	onSubmit,
}: DepositConfigurationPanelFormViewProps) {
	return (
		<Stack gap="md" className={styles.root}>
			<DepositConfigurationPanelFormField
				connected={connected}
				isOwner={isOwner}
				editingMinDeposit={editingMinDeposit}
				saving={saving}
				onEditingMinDepositChange={onEditingMinDepositChange}
			/>
			<DepositConfigurationPanelFormFooter connected={connected} isOwner={isOwner} saving={saving} onSubmit={onSubmit} />
		</Stack>
	);
}
