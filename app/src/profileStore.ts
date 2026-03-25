import { ConnectionProfile } from './types';

const STORAGE_KEY = 'rdp_profiles';

export function loadProfiles(): ConnectionProfile[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultProfiles();
  }
  try {
    return JSON.parse(stored);
  } catch {
    return getDefaultProfiles();
  }
}

export function saveProfiles(profiles: ConnectionProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function getDefaultProfiles(): ConnectionProfile[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Default Profile',
      host: '',
      port: 3389,
      username: '',
      domain: '',
      width: 1920,
      height: 1080,
      use_span_by_default: false,
      audio_mode: 0,
      redirect_clipboard: true,
      redirect_printers: true,
      redirect_drives: false,
      redirect_smart_cards: false,
      show_connection_bar: true,
    },
  ];
}
