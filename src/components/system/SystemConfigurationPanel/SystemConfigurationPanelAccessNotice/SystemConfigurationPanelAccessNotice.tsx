"use client";

import { SystemConfigurationPanelAccessNoticeView } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanelAccessNotice/SystemConfigurationPanelAccessNoticeView";

type SystemConfigurationPanelAccessNoticeProps = {
	heading: string | null;
	title: string;
	message: string;
	color: "yellow" | "gray";
};

export function SystemConfigurationPanelAccessNotice({
	heading,
	title,
	message,
	color,
}: SystemConfigurationPanelAccessNoticeProps) {
	return <SystemConfigurationPanelAccessNoticeView heading={heading} title={title} message={message} color={color} />;
}
