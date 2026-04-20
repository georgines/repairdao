"use client";

import { SystemConfigurationPanelAlertView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAlert/SystemConfigurationPanelAlertView";

type SystemConfigurationPanelAlertProps = {
	title: string;
	message: string | null;
};

export function SystemConfigurationPanelAlert({ title, message }: SystemConfigurationPanelAlertProps) {
	return <SystemConfigurationPanelAlertView title={title} message={message} />;
}

