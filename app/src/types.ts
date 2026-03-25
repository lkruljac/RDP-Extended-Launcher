export interface MonitorDescriptor {
  index: number;
  device_name: string;
  bounds_x: number;
  bounds_y: number;
  bounds_width: number;
  bounds_height: number;
  is_primary: boolean;
  dpi_x: number;
  dpi_y: number;
  scale_factor: number;
}

export interface ConnectionProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  domain: string;
  width: number;
  height: number;
  use_span_by_default: boolean;
  audio_mode: number;
  redirect_clipboard: boolean;
  redirect_printers: boolean;
  redirect_drives: boolean;
  redirect_smart_cards: boolean;
  show_connection_bar: boolean;
}
