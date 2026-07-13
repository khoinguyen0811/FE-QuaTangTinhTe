export async function openQuickSettings(defaultTab = 'brand', extraParam = 0) {
  const { openQuickSettings: open } = await import('./QuickSettings/index.js');
  return open(defaultTab, extraParam);
}
