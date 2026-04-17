import { Fragment, type CSSProperties } from "react";
import { Divider, Group, Stack, Text } from "@mantine/core";
import type { BalanceSummaryModel } from "@/services/balance/balanceSummary";

export type BalanceSummaryViewProps = BalanceSummaryModel & {
	style?: CSSProperties;
};

export function BalanceSummaryView({ title, primaryText, sections, note, style }: BalanceSummaryViewProps) {
	return (
		<Stack gap={4} style={style}>
			<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
				{title}
			</Text>
			<Text size="xl" fw={800}>
				{primaryText}
			</Text>
			<Group align="stretch" wrap="nowrap" gap="md">
				{sections.map((section, index) => (
					<Fragment key={`${section.separatorText}-${index}`}>
						{index > 0 ? <Divider orientation="vertical" /> : null}
						<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
							{section.separatorText ? (
								<Text size="xs" c="dimmed" fw={700}>
									{section.separatorText}
								</Text>
							) : null}
							{section.lines.map((line) => (
								<Text key={line} size="xs" c="dimmed">
									{line}
								</Text>
							))}
						</Stack>
					</Fragment>
				))}
			</Group>
			{note ? (
				<Text size="xs" c="dimmed">
					{note}
				</Text>
			) : null}
		</Stack>
	);
}
