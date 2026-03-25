use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorDescriptor {
    pub index: i32,
    pub device_name: String,
    pub bounds_x: i32,
    pub bounds_y: i32,
    pub bounds_width: i32,
    pub bounds_height: i32,
    pub is_primary: bool,
    pub dpi_x: u32,
    pub dpi_y: u32,
    pub scale_factor: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionProfile {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: i32,
    pub username: String,
    pub domain: String,
    pub width: i32,
    pub height: i32,
    pub use_span_by_default: bool,
    pub audio_mode: i32,
    pub redirect_clipboard: bool,
    pub redirect_printers: bool,
    pub redirect_drives: bool,
    pub redirect_smart_cards: bool,
    pub show_connection_bar: bool,
}
