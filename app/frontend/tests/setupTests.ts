import '@testing-library/jest-dom';

class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(_target: Element) {
  }
  unobserve(_target: Element) {
  }

  disconnect() {
  }
}


(global as any).ResizeObserver = ResizeObserver;
