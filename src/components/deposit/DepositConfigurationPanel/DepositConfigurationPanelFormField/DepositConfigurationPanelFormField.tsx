"use client";

import { DepositConfigurationPanelFormFieldView } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormField/DepositConfigurationPanelFormFieldView";

type DepositConfigurationPanelFormFieldProps = {
	connected: boolean;
	isOwner: boolean;
	editingMinDeposit: string;
	saving: boolean;
	onEditingMinDepositChange: (value: string) => void;
};

export function DepositConfigurationPanelFormField(props: DepositConfigurationPanelFormFieldProps) {
	return <DepositConfigurationPanelFormFieldView {...props} />;
}
