"use client";

import { Alert } from "@mantine/core";
import styles from "./SystemConfigurationPanelAlertView.module.css";

type SystemConfigurationPanelAlertViewProps = {
	title: string;
	message: string | null;
};

export function SystemConfigurationPanelAlertView({ title, message }: SystemConfigurationPanelAlertViewProps) {
	if (!message) {
		return null;
	}

	return (
		<Alert color="red" title={title} className={styles.root}>
			{message}
		</Alert>
	);
}

