"use client";

import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./SystemConfigurationPanelHeaderView.module.css";
import type { SystemConfigurationStatusColor } from "@/services/system/systemConfigurationPresentation";

type SystemConfigurationPanelHeaderViewProps = {
	statusLabel: string;
	statusColor: SystemConfigurationStatusColor;
};

export function SystemConfigurationPanelHeaderView({
	statusLabel,
	statusColor,
}: SystemConfigurationPanelHeaderViewProps) {
	return (
		<Stack gap={4} className={styles.root}>
			<Group justify="space-between" align="flex-start">
				<Stack gap={2}>
					<Title order={3}>Configuracoes do sistema</Title>					
				</Stack>

				<Badge variant="light" color={statusColor}>
					{statusLabel}
				</Badge>
			</Group>
		</Stack>
	);
}

