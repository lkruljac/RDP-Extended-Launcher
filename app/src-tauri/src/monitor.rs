#[cfg(target_os = "windows")]
use windows::{
    Win32::Foundation::*,
    Win32::Graphics::Gdi::*,
    Win32::UI::HiDpi::*,
};

use crate::models::MonitorDescriptor;

const MONITORINFOF_PRIMARY_FLAG: u32 = 0x0000_0001;

#[cfg(target_os = "windows")]
pub fn get_all_monitors() -> std::result::Result<Vec<MonitorDescriptor>, String> {
    let mut monitors = Vec::new();

    unsafe {
        let _ = EnumDisplayMonitors(
            None,
            None,
            Some(enum_monitor_callback),
            LPARAM(&mut monitors as *mut _ as isize),
        );
    }

    Ok(monitors)
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_monitor_callback(
    hmonitor: HMONITOR,
    _hdc: HDC,
    _rect: *mut RECT,
    data: LPARAM,
) -> BOOL {
    let monitors = &mut *(data.0 as *mut Vec<MonitorDescriptor>);

    let mut info = MONITORINFOEXW {
        monitorInfo: MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFOEXW>() as u32,
            ..Default::default()
        },
        ..Default::default()
    };

    if GetMonitorInfoW(hmonitor, &mut info.monitorInfo as *mut _ as *mut _).as_bool() {
        let device_name = String::from_utf16_lossy(
            &info
                .szDevice
                .iter()
                .take_while(|&&c| c != 0)
                .map(|&c| c)
                .collect::<Vec<_>>(),
        );

        let is_primary = (info.monitorInfo.dwFlags & MONITORINFOF_PRIMARY_FLAG) != 0;
        let mut dpi_x: u32 = 96;
        let mut dpi_y: u32 = 96;
        let _ = GetDpiForMonitor(hmonitor, MDT_EFFECTIVE_DPI, &mut dpi_x, &mut dpi_y);
        let scale_factor = dpi_x as f32 / 96.0;

        let monitor = MonitorDescriptor {
            index: monitors.len() as i32,
            device_name,
            bounds_x: info.monitorInfo.rcMonitor.left,
            bounds_y: info.monitorInfo.rcMonitor.top,
            bounds_width: info.monitorInfo.rcMonitor.right - info.monitorInfo.rcMonitor.left,
            bounds_height: info.monitorInfo.rcMonitor.bottom - info.monitorInfo.rcMonitor.top,
            is_primary,
            dpi_x,
            dpi_y,
            scale_factor,
        };

        monitors.push(monitor);
    }

    true.into()
}

#[cfg(not(target_os = "windows"))]
pub fn get_all_monitors() -> std::result::Result<Vec<MonitorDescriptor>, String> {
    Err("Monitor detection is only supported on Windows".to_string())
}
