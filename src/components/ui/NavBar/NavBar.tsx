"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, NavLink, ScrollArea, Stack } from "@mantine/core";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Minha conta", href: "/account" },
  { label: "Loja", href: "/store" },
  { label: "Elegibilidade", href: "/eligibility" },
];

type NavBarProps = {
	onNavigate?: () => void;
};

export function NavBar({ onNavigate }: NavBarProps) {
	const pathname = usePathname();

	return (
		<Stack h="100%" gap="sm" p="md">
			<AppShell.Section grow component={ScrollArea}>
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
								onClick={onNavigate}
							/>
						);
					})}
				</Stack>
			</AppShell.Section>
		</Stack>
	);
}
