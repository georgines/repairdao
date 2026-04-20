"use client";

import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import styles from "./SystemConfigurationPanelSettingView.module.css";
import { SystemConfigurationPanelAlert } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAlert/SystemConfigurationPanelAlert";

type SystemConfigurationPanelSettingViewProps = {
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

export function SystemConfigurationPanelSettingView({
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
}: SystemConfigurationPanelSettingViewProps) {
	return (
		<Stack gap="md" className={styles.root}>
			<Stack gap={4}>
				<Title order={4}>{title}</Title>
				<Text size="sm" c="dimmed">
					{description}
				</Text>
			</Stack>

			<SystemConfigurationPanelAlert title={errorTitle} message={errorMessage} />

			<TextInput
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				disabled={disabled || saving}
				rightSection={<Text size="xs" c="dimmed">{unitLabel}</Text>}
			/>

			<Group justify="flex-end" align="center">
				<Button onClick={() => void onSubmit()} loading={saving} disabled={disabled}>
					{submitLabel}
				</Button>
			</Group>
		</Stack>
	);
}

