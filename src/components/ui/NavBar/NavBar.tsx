"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, Divider, NavLink, Stack, Text } from "@mantine/core";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Loja", href: "/store" },
];

export function NavBar() {
	const pathname = usePathname();

	return (
		<Stack h="100%" gap="sm" p="md">
			<AppShell.Section>
				<Stack gap={2}>
					<Text fw={800} size="lg" c="dark">
						RepairDAO
					</Text>
				</Stack>
			</AppShell.Section>

			<Divider />

			<AppShell.Section grow>
				<Stack gap={4}>
					{menuItems.map((item) => {
						const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

						return (
							<NavLink
								key={item.href}
								component={Link}
								href={item.href}
								label={item.label}
								active={active}
								variant="subtle"
							/>
						);
					})}
				</Stack>
			</AppShell.Section>
		</Stack>
	);
}
