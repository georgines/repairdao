// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserSummary } from "@/services/users";
import { useTechnicianDiscoveryPanel } from "@/hooks/useTechnicianDiscoveryPanel";

const initialTechnicians: UserSummary[] = [
	{
		address: "0xbbb",
		name: "Bruno Silva",
		role: "tecnico",
		badgeLevel: "bronze",
		reputation: 12,
		depositLevel: 1,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T10:00:00.000Z",
	},
	{
		address: "0xaaa",
		name: "Ana Costa",
		role: "tecnico",
		badgeLevel: "silver",
		reputation: 18,
		depositLevel: 2,
		isActive: true,
		isEligible: true,
		updatedAt: "2026-04-17T11:00:00.000Z",
	},
];

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useTechnicianDiscoveryPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useTechnicianDiscoveryPanel>) => void>();

	function Probe() {
		capture(useTechnicianDiscoveryPanel({ initialTechnicians }));
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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

	it("expõe os tecnicos iniciais e seleciona o primeiro", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.totalTechnicians).toBe(2);
		expect(getLatest()?.filteredTechnicians).toHaveLength(2);
		expect(getLatest()?.selectedTechnician?.name).toBe("Bruno Silva");
	});

	it("filtra por texto e reputacao", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("ana");
			getLatest()?.onMinReputationChange(15);
			await flush();
		});

		expect(getLatest()?.filteredTechnicians).toHaveLength(1);
		expect(getLatest()?.filteredTechnicians[0].name).toBe("Ana Costa");
	});

	it("limpa os filtros e mantem a selecao quando ja existe", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onQueryChange("ana");
			getLatest()?.onSelectTechnician("0xaaa");
			await flush();
		});

		await act(async () => {
			getLatest()?.onClearFilters();
			await flush();
		});

		expect(getLatest()?.query).toBe("");
		expect(getLatest()?.minReputation).toBe(0);
		expect(getLatest()?.selectedTechnician?.address).toBe("0xaaa");
	});

	it("mantem estado vazio quando nao ha tecnicos iniciais e ignora reputacao invalida", async () => {
		function EmptyProbe() {
			capture(useTechnicianDiscoveryPanel({ initialTechnicians: [] }));
			return null;
		}

		await act(async () => {
			root.render(<EmptyProbe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.onMinReputationChange("abc");
			getLatest()?.onClearFilters();
			await flush();
		});

		expect(getLatest()?.totalTechnicians).toBe(0);
		expect(getLatest()?.selectedTechnician).toBeNull();
		expect(getLatest()?.minReputation).toBe(0);
		expect(getLatest()?.hasResults).toBe(false);
	});
});
