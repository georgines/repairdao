import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppShell from "@/components/ui/AppShell/AppShell";

vi.mock("next/navigation", () => ({
	usePathname: () => "/",
}));

describe("components/ui/AppShell/AppShell", () => {
	it("envolve o conteudo no shell global", () => {
		const markup = renderToStaticMarkup(
			<AppShell>
				<div>conteudo</div>
			</AppShell>,
		);

		expect(markup).toContain("conteudo");
		expect(markup).toContain("RepairDAO");
		expect(markup).toContain("Toggle navigation");
	});
});
