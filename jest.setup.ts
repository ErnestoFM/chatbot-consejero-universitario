import "@testing-library/jest-dom";

// Mock scrollIntoView which is not implemented in jsdom
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
