// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { EVENTO_REDE_RPC_ALTERADA, CHAVE_REDE_RPC } from "@/services/blockchain/rpcConfig";
import { NetworkSelector } from "@/components/wallet/NetworkSelector";

function renderWithMantine(node: ReactNode) {
  return render(<MantineProvider>{node}</MantineProvider>);
}

describe("NetworkSelector", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    window.localStorage.clear();
    document.cookie = `${CHAVE_REDE_RPC}=; path=/; max-age=0`;
    vi.stubEnv("NEXT_PUBLIC_NETWORK", "local");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("renderiza a rede atual e atualiza a selecao", () => {
    const eventos: string[] = [];
    const listener = (event: Event) => {
      eventos.push(((event as CustomEvent<{ rede?: string }>).detail?.rede ?? "").trim());
    };

    window.addEventListener(EVENTO_REDE_RPC_ALTERADA, listener);

    renderWithMantine(<NetworkSelector />);

    const select = screen.getAllByLabelText("Selecionar rede RPC")[0];

    expect((select as HTMLSelectElement).value).toBe("local");

    fireEvent.change(select, { target: { value: "sepolia" } });

    expect(window.localStorage.getItem(CHAVE_REDE_RPC)).toBe("sepolia");
    expect(document.cookie).toContain(`${CHAVE_REDE_RPC}=sepolia`);
    expect(eventos).toContain("sepolia");

    window.removeEventListener(EVENTO_REDE_RPC_ALTERADA, listener);
  });

  it("nao dispara evento quando a rede escolhida ja e a atual", () => {
    const listener = vi.fn();
    window.addEventListener(EVENTO_REDE_RPC_ALTERADA, listener);

    renderWithMantine(<NetworkSelector />);

    const select = screen.getByLabelText("Selecionar rede RPC");
    fireEvent.change(select, { target: { value: "local" } });

    expect(window.localStorage.getItem(CHAVE_REDE_RPC)).toBeNull();
    expect(listener).not.toHaveBeenCalled();

    window.removeEventListener(EVENTO_REDE_RPC_ALTERADA, listener);
  });
});
