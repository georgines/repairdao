"use client";

import { Group, Loader, Paper, Text } from "@mantine/core";
import styles from "./SystemConfigurationPanelLoadingView.module.css";

export function SystemConfigurationPanelLoadingView() {
	return (
		<Paper p="lg" withBorder radius="md" className={styles.root}>
			<Group gap="sm" align="center">
				<Loader size="sm" />
				<Text size="sm">Carregando configuracoes do sistema...</Text>
			</Group>
		</Paper>
	);
}

