import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
afterEach(cleanup);
describe("Application de départ", () => {
  it("affiche les trois ateliers", () => {
    render(<App />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("Une tasse en céramique")).toBeInTheDocument();
  });
  it("recherche un atelier par son titre", async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByRole("searchbox"), "céramique");
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });
  it("affiche un résultat vide sans planter", async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByRole("searchbox"), "inexistant");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText(/Aucun atelier ne correspond/)).toBeInTheDocument();
  });
});
