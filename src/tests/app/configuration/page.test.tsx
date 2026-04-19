// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";

const pageMocks = vi.hoisted(() => ({
	SystemConfigurationPanel: vi.fn(() => <div>painel</div>),
}));

vi.mock("@/components/system/SystemConfigurationPanel/SystemConfigurationPanel", () => ({
	SystemConfigurationPanel: pageMocks.SystemConfigurationPanel,
}));

import SystemConfigurationPage from "@/app/(pages)/configuration/page";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("app/configuration/page", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
	});

	it("renderiza o painel", async () => {
		await act(async () => {
			root.render(
					<MantineProvider>
					<SystemConfigurationPage />
					</MantineProvider>,
				);
				await flush();
			});

		expect(container.textContent).toContain("painel");
	});
});