"use client";

import { SystemConfigurationPanelSettingView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelSetting/SystemConfigurationPanelSettingView";

type SystemConfigurationPanelSettingProps = {
	title: string;
	description: string;
	errorTitle: string;
	errorMessage: string | null;
	value: string;
	disabled: boolean;
	saving: boolean;
	unitLabel: string;
	submitLabel: string;
	onChange: (value: string) => void;
	onSubmit: () => Promise<void>;
};

export function SystemConfigurationPanelSetting({
	title,
	description,
	errorTitle,
	errorMessage,
	value,
	disabled,
	saving,
	unitLabel,
	submitLabel,
	onChange,
	onSubmit,
}: SystemConfigurationPanelSettingProps) {
	return (
		<SystemConfigurationPanelSettingView
			title={title}
			description={description}
			errorTitle={errorTitle}
			errorMessage={errorMessage}
			value={value}
			disabled={disabled}
			saving={saving}
			unitLabel={unitLabel}
			submitLabel={submitLabel}
			onChange={onChange}
			onSubmit={onSubmit}
		/>
	);
}

