"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import {
    Anchor,
    AppShell as MantineAppShell,
    Box,
    Burger,
    Container,
    Group,
    MantineProvider,
    Stack,
    Text,
    createTheme,
} from "@mantine/core";
import { WalletStatus } from "@/components/wallet/WalletStatus";
import { useWalletStatus } from "@/hooks/useWalletStatus";
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
    const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
    const { state, actionLabel, actionHandler } = useWalletStatus();

    return (
        <MantineProvider theme={theme} defaultColorScheme="light">
            <MantineAppShell
                header={{ height: { base: 164, sm: 132 } }}
                navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !mobileOpened } }}
                padding={{ base: "sm", sm: "md" }}
                layout="default"
                withBorder={false}
            >
                <MantineAppShell.Header style={{ background: "#ffffff" }}>
                    <Box h={4} style={{ background: "linear-gradient(90deg, #0f172a 0%, #0ea5e9 45%, #14b8a6 100%)" }} />
                    <Stack h="calc(100% - 4px)" px="md" py={6} gap={6} justify="center">
                        <Group justify="space-between" wrap="nowrap">
                            <Anchor component={Link} href="/" underline="never">
                                <Text fw={800} size="lg" c="dark">
                                    RepairDAO
                                </Text>
                            </Anchor>

                            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" aria-label="Toggle navigation" />
                        </Group>

                        <Group justify="flex-end" wrap="nowrap">
                            <WalletStatus
                                connected={state.connected}
                                loading={state.loading}
                                address={state.address}
                                chainLabel={state.chainLabel}
                                tokenBalance={state.tokenBalance}
                                ethBalance={state.ethBalance}
                                usdBalance={state.usdBalance}
                                actionLabel={actionLabel}
                                onAction={actionHandler}
                            />
                        </Group>
                    </Stack>
                </MantineAppShell.Header>
                <MantineAppShell.Navbar p={0} style={{ background: "#dbe4ee" }}>
                    <NavBar onNavigate={closeMobile} />
                </MantineAppShell.Navbar>
                <MantineAppShell.Main>
                    <Container size="lg">{children}</Container>
                </MantineAppShell.Main>
            </MantineAppShell>
        </MantineProvider>
    );
}
