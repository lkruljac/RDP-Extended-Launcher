# Connection Profile Configuration

Each connection profile stores all the settings needed to launch an RDP session. This page describes every available option.

## Basic Settings

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name for the profile in the sidebar | `Production Server` |
| **Host** | Hostname or IP address of the remote machine | `192.168.1.100` or `server.example.com` |
| **Port** | RDP port on the remote machine (default: 3389) | `3389` |
| **Username** | Account to authenticate with on the remote machine | `Administrator` |
| **Domain** | Active Directory domain (leave blank for local accounts) | `CORP` |

## Display

| Field | Description |
|-------|-------------|
| **Width / Height** | Desktop resolution in pixels. Set both to `0` to match the selected monitor's native resolution. |
| **Span across monitors** | When enabled, the RDP session spans all selected monitors as a single large desktop instead of mirroring the primary. |

### Monitor selection

The monitor canvas shows a live map of your physical displays. Click any monitor to include or exclude it from the session. The RDP client will use only the selected monitors.

## Redirection

These settings control what local resources are accessible within the remote session.

| Setting | Description |
|---------|-------------|
| **Clipboard** | Share clipboard content between your local machine and the remote session. |
| **Printers** | Make locally installed printers available inside the remote session. |
| **Drives** | Map local drives into the remote session (appears under "This PC" on the remote machine). |
| **Smart cards** | Forward smart card readers connected to the local machine. |

## Session

| Field | Description |
|-------|-------------|
| **Audio mode** | `0` — play audio on the local machine (default). `1` — play audio on the remote machine. `2` — disable audio. |
| **Connection bar** | Show or hide the floating connection bar at the top of the RDP window (useful for full-screen sessions). |
