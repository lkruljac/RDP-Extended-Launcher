import { invoke } from '@tauri-apps/api/tauri';
import type { MonitorDescriptor, ConnectionProfile } from './types';

function isTauriRuntimeAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as typeof window & { __TAURI_IPC__?: unknown }).__TAURI_IPC__ === 'function';
}

export async function getMonitors(): Promise<MonitorDescriptor[]> {
  if (!isTauriRuntimeAvailable()) {
    return [];
  }

  return await invoke('get_monitors');
}

export async function launchConnection(
  profile: ConnectionProfile,
  useMultiMon: boolean,
  useSpan: boolean,
  selectedMonitors: MonitorDescriptor[],
  width: number,
  height: number
): Promise<void> {
  if (!isTauriRuntimeAvailable()) {
    throw new Error('Tauri runtime is not available. Start the app with `npm run tauri dev` or launch the packaged app.');
  }

  await invoke('launch_connection', {
    profile,
    useMultiMon,
    useSpan,
    selectedMonitors,
    width,
    height,
  });
}
