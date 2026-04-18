// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MantineProvider } from "@mantine/core";
import { RatingSummary } from "@/components/ratings/RatingSummary";

const ratingMocks = vi.hoisted(() => ({
	useRatingSummary: vi.fn(),
	carregarMetricasDaConta: vi.fn(),
}));

vi.mock("@/hooks/useRatingSummary", () => ({
	useRatingSummary: ratingMocks.useRatingSummary,
}));

vi.mock("@/services/account/accountMetrics", () => ({
	carregarMetricasDaConta: ratingMocks.carregarMetricasDaConta,
}));

function renderWithMantine(node: ReactElement) {
	return render(<MantineProvider>{node}</MantineProvider>);
}

describe("components/ratings/RatingSummary", () => {
	beforeEach(() => {
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
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renderiza estrelas e total com valores diretos", () => {
		ratingMocks.useRatingSummary.mockReturnValue({
			averageRating: 0,
			totalRatings: 0,
			loading: false,
		});

		renderWithMantine(<RatingSummary averageRating="4,6" totalRatings="10" />);

		expect(screen.getByLabelText("Reputacao 5 de 5, 10 avaliacoes")).toBeDefined();
		expect(screen.getByText("(10)")).toBeDefined();
	});

	it("mostra cinco estrelas cinzas quando nao ha avaliacao", () => {
		ratingMocks.useRatingSummary.mockReturnValue({
			averageRating: 0,
			totalRatings: 0,
			loading: false,
		});

		renderWithMantine(<RatingSummary averageRating={0} totalRatings={0} />);

		expect(screen.getByLabelText("Reputacao 5 de 5, 0 avaliacoes")).toBeDefined();
		expect(screen.getByText("(0)")).toBeDefined();
	});

	it("usa o hook quando recebe endereco", () => {
		ratingMocks.useRatingSummary.mockReturnValue({
			averageRating: 4,
			totalRatings: 3,
			loading: false,
		});

		renderWithMantine(<RatingSummary address="0xabc" />);

		expect(screen.getByLabelText("Reputacao 4 de 5, 3 avaliacoes")).toBeDefined();
		expect(screen.getByText("(3)")).toBeDefined();
		expect(ratingMocks.useRatingSummary).toHaveBeenCalledWith("0xabc", "technician");
	});

	it("usa o resumo da conta quando recebe source account", () => {
		ratingMocks.useRatingSummary.mockReturnValue({
			averageRating: 4,
			totalRatings: 6,
			loading: false,
		});

		renderWithMantine(<RatingSummary address="0xabc" source="account" />);

		expect(screen.getByLabelText("Reputacao 4 de 5, 6 avaliacoes")).toBeDefined();
		expect(screen.getByText("(6)")).toBeDefined();
		expect(ratingMocks.useRatingSummary).toHaveBeenCalledWith("0xabc", "account");
	});
});
