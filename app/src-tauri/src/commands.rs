use crate::models::{ConnectionProfile, MonitorDescriptor};
use crate::monitor;
use crate::rdp;

#[tauri::command]
pub fn get_monitors() -> Result<Vec<MonitorDescriptor>, String> {
    monitor::get_all_monitors().map_err(|e| format!("Failed to get monitors: {:?}", e))
}

#[tauri::command]
pub fn launch_connection(
    profile: ConnectionProfile,
    use_multi_mon: bool,
    use_span: bool,
    selected_monitors: Vec<MonitorDescriptor>,
    width: i32,
    height: i32,
) -> Result<(), String> {
    let rdp_file =
        rdp::generate_rdp_file(&profile, use_multi_mon, use_span, &selected_monitors, width, height)?;

    rdp::launch_rdp(&rdp_file)?;

    Ok(())
}
