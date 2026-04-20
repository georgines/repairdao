"use client";

import { DepositConfigurationPanelFormView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelForm/DepositConfigurationPanelFormView";

type DepositConfigurationPanelFormProps = {
	connected: boolean;
	isOwner: boolean;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export function DepositConfigurationPanelForm(props: DepositConfigurationPanelFormProps) {
	return <DepositConfigurationPanelFormView {...props} />;
}
