"use client";

import { SystemConfigurationPanelHeaderView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelHeader/SystemConfigurationPanelHeaderView";
import type { SystemConfigurationStatusColor } from "@/services/system/systemConfigurationPresentation";

type SystemConfigurationPanelHeaderProps = {
	statusLabel: string;
	statusColor: SystemConfigurationStatusColor;
};

export function SystemConfigurationPanelHeader({ statusLabel, statusColor }: SystemConfigurationPanelHeaderProps) {
	return <SystemConfigurationPanelHeaderView statusLabel={statusLabel} statusColor={statusColor} />;
}

