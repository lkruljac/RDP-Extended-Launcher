# RDP Extended

A lightweight Windows desktop app for managing Remote Desktop (RDP) connection profiles with multi-monitor support.

## Features

- **Profile management** — create, edit, and delete named RDP connection profiles
- **Multi-monitor support** — visually select which monitors to use for each session
- **Per-profile settings** — control audio redirection, clipboard, printers, drives, and smart cards
- **Fast and lean** — ~5–15 MB bundle, <1 s startup, no .NET runtime required
- **Dark UI** — clean dark-themed interface with keyboard shortcuts

## Installation

Download the latest installer from the [Releases](../../releases) page and run it. No additional dependencies required.

## Usage

### Connecting

1. Click **+** to create a new connection profile
2. Enter the **Host**, **Username**, and optionally a **Domain**
3. Choose your monitor layout and display settings
4. Click **Connect** (or press `Enter`)

### Managing profiles

- Click any profile in the sidebar to select it
- Edit fields directly — changes are saved with `Ctrl+S` or the Save button
- Press `Delete` to remove the selected profile

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+S` | Save profiles |
| `Enter` | Connect |
| `Delete` | Delete selected profile |

## Building from Source

See [docs/BUILDING.md](docs/BUILDING.md). In short: install Node.js, Rust, and VS Build Tools, then run `cd app && npm install && npm run tauri dev`.

## Configuration Reference

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for a full description of all connection profile settings.

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.

## License

MIT — see [LICENSE](LICENSE) for details.

