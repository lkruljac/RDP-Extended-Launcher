use crate::models::{ConnectionProfile, MonitorDescriptor};
use std::fs;
use std::process::Command;
use uuid::Uuid;

pub fn generate_rdp_file(
    profile: &ConnectionProfile,
    use_multi_mon: bool,
    use_span: bool,
    selected_monitors: &[MonitorDescriptor],
    width: i32,
    height: i32,
) -> Result<String, String> {
    let mut content = String::new();

    // Basic connection settings
    content.push_str(&format!(
        "full address:s:{}:{}\n",
        profile.host, profile.port
    ));

    if !profile.username.is_empty() {
        content.push_str(&format!("username:s:{}\n", profile.username));
    }

    if !profile.domain.is_empty() {
        content.push_str(&format!("domain:s:{}\n", profile.domain));
    }

    // Display settings
    content.push_str(&format!("desktopwidth:i:{}\n", width));
    content.push_str(&format!("desktopheight:i:{}\n", height));
    content.push_str("session bpp:i:32\n");
    content.push_str("compression:i:1\n");

    // Audio settings
    content.push_str("audiocapturemode:i:0\n");
    content.push_str(&format!("audiomode:i:{}\n", profile.audio_mode));

    // Redirection settings
    content.push_str(&format!(
        "redirectclipboard:i:{}\n",
        if profile.redirect_clipboard { 1 } else { 0 }
    ));
    content.push_str(&format!(
        "redirectprinters:i:{}\n",
        if profile.redirect_printers { 1 } else { 0 }
    ));
    content.push_str(&format!(
        "redirectdrives:i:{}\n",
        if profile.redirect_drives { 1 } else { 0 }
    ));
    content.push_str(&format!(
        "redirectsmartcards:i:{}\n",
        if profile.redirect_smart_cards { 1 } else { 0 }
    ));

    // Connection bar
    content.push_str(&format!(
        "displayconnectionbar:i:{}\n",
        if profile.show_connection_bar { 1 } else { 0 }
    ));

    // Multi-monitor settings
    if use_multi_mon && !selected_monitors.is_empty() {
        content.push_str("use multimon:i:1\n");

        if use_span {
            content.push_str("span monitors:i:1\n");
        }

        let selected_ids: Vec<String> = selected_monitors
            .iter()
            .map(|m| m.index.to_string())
            .collect();
        content.push_str(&format!("selectedmonitors:s:{}\n", selected_ids.join(",")));
    } else {
        content.push_str("use multimon:i:0\n");
    }

    // Additional quality settings
    content.push_str("authentication level:i:2\n");
    content.push_str("prompt for credentials:i:0\n");
    content.push_str("negotiate security layer:i:1\n");

    // Write to temp file
    let temp_dir = std::env::temp_dir();
    let filename = format!("rdp_temp_{}.rdp", Uuid::new_v4());
    let filepath = temp_dir.join(filename);

    fs::write(&filepath, content).map_err(|e| format!("Failed to write RDP file: {}", e))?;

    Ok(filepath.to_string_lossy().to_string())
}

pub fn launch_rdp(rdp_file_path: &str) -> Result<(), String> {
    Command::new("mstsc.exe")
        .arg(rdp_file_path)
        .spawn()
        .map_err(|e| format!("Failed to launch mstsc.exe: {}", e))?;

    Ok(())
}
