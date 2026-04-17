"use client";

import type { ReactNode } from "react";
import { AppShell as MantineAppShell, Container, MantineProvider, createTheme } from "@mantine/core";
import { NavBar } from "@/components/ui/NavBar/NavBar";

const theme = createTheme({
	primaryColor: "teal",
	defaultRadius: "sm",
	fontFamily: 'var(--font-geist-sans), "Inter", sans-serif',
	headings: {
		fontFamily: 'var(--font-geist-sans), "Inter", sans-serif',
	},
});

type AppShellProps = {
	children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
	return (
		<MantineProvider theme={theme} defaultColorScheme="light">
			<MantineAppShell
				header={{ height: 4 }}
				navbar={{ width: 280, breakpoint: 0 }}
				padding="md"
				layout="default"
				withBorder={false}
			>
				<MantineAppShell.Header
					style={{ background: "linear-gradient(90deg, #0f172a 0%, #0ea5e9 45%, #14b8a6 100%)" }}
				/>
				<MantineAppShell.Navbar p={0}>
					<NavBar />
				</MantineAppShell.Navbar>
				<MantineAppShell.Main>
					<Container size="lg">{children}</Container>
				</MantineAppShell.Main>
			</MantineAppShell>
		</MantineProvider>
	);
}
