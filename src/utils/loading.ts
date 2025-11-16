// Simple global loading toggle utility.
// Register a setter from a React provider to control a global overlay.

export type LoadingSetter = (v: boolean) => void;

let globalSetter: LoadingSetter | null = null;

export function registerLoadingSetter(setter: LoadingSetter) {
  globalSetter = setter;
  return () => {
    if (globalSetter === setter) globalSetter = null;
  };
}

export function showLoading() {
  globalSetter?.(true);
}

export function hideLoading() {
  globalSetter?.(false);
}

export async function withLoading<T>(fn: () => Promise<T>) {
  try {
    showLoading();
    return await fn();
  } finally {
    hideLoading();
  }
}

export default {
  registerLoadingSetter,
  showLoading,
  hideLoading,
  withLoading,
};
