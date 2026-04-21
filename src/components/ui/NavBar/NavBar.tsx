"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, NavLink, ScrollArea, Stack } from "@mantine/core";
import { useAccountProfile } from "@/hooks/useAccountProfile";

const menuItems = [
  { label: "Minha conta", href: "/account" },
	{ label: "Loja", href: "/store" },
	{ label: "Elegibilidade", href: "/eligibility" },
	{ label: "Servicos", href: "/services" },
	{ label: "Disputas", href: "/disputes" },
	{ label: "Votacoes", href: "/governance" },
	{ label: "Tecnicos disponiveis", href: "/technicians", visibleFor: "cliente" },
];

type NavBarProps = {
	onNavigate?: () => void;
};

export function NavBar({ onNavigate }: NavBarProps) {
	const pathname = usePathname();
	const { perfilAtivo } = useAccountProfile();

	return (
		<Stack h="100%" gap="sm" p="md">
			<AppShell.Section grow component={ScrollArea}>
				<Stack gap={4}>
					{menuItems.map((item) => {
						if ("visibleFor" in item && item.visibleFor !== perfilAtivo) {
							return null;
						}

						const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
