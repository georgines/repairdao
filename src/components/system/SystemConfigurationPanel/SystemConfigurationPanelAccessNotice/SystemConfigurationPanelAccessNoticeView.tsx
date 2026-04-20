"use client";

import { Alert, Paper, Stack, Text } from "@mantine/core";
import styles from "./SystemConfigurationPanelAccessNoticeView.module.css";

type SystemConfigurationPanelAccessNoticeViewProps = {
	heading: string | null;
	title: string;
	message: string;
	color: "yellow" | "gray";
};

export function SystemConfigurationPanelAccessNoticeView({
	heading,
	title,
	message,
	color,
}: SystemConfigurationPanelAccessNoticeViewProps) {
	let headingNode = null;

	if (heading) {
		headingNode = <Text fw={700}>{heading}</Text>;
	}

	return (
		<Paper p="lg" withBorder radius="md" className={styles.root}>
			<Stack gap="sm">
				{headingNode}
				<Alert color={color} title={title}>
					{message}
				</Alert>
			</Stack>
		</Paper>
	);
}
