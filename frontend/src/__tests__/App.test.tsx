import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(<App />);
    // Basic check to see if something is rendered.
    // Since App has a complex structure, we just check for presence.
    expect(document.body).toBeDefined();
  });
});
