// Jest setup file for WebAuthn PRF library tests

// Mock crypto.getRandomValues for testing
let callCount = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn().mockImplementation((array: Uint8Array) => {
      // Fill with different values each call to simulate randomness
      const offset = callCount++ * 100;
      for (let i = 0; i < array.length; i++) {
        array[i] = (i + offset) % 256;
      }
      return array;
    })
  },
  writable: true
});

// Mock TextEncoder/TextDecoder
Object.defineProperty(global, 'TextEncoder', {
  value: class TextEncoder {
    encode(input: string): Uint8Array {
      const buffer = new ArrayBuffer(input.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < input.length; i++) {
        view[i] = input.charCodeAt(i);
      }
      return view;
    }
  }
});

Object.defineProperty(global, 'TextDecoder', {
  value: class TextDecoder {
    decode(input: Uint8Array): string {
      return String.fromCharCode(...input);
    }
  }
});

// Mock btoa/atob for base64 operations
Object.defineProperty(global, 'btoa', {
  value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  writable: true
});

Object.defineProperty(global, 'atob', {
  value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
  writable: true
});

// Mock window object for browser APIs
Object.defineProperty(global, 'window', {
  value: {
    location: {
      hostname: 'localhost'
    }
  },
  writable: true
});

// Suppress console warnings during tests
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});