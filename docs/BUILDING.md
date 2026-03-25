# Building from Source

## Prerequisites

You need the following tools installed before building:

| Tool | Minimum version | Download |
|------|----------------|---------|
| Node.js | 18 | https://nodejs.org/ |
| Rust | 1.70 | https://rustup.rs/ |
| Visual Studio Build Tools | 2019 or later | https://visualstudio.microsoft.com/downloads/ |

When installing Visual Studio Build Tools, select the **Desktop development with C++** workload. This is required to compile the Windows API bindings used by the Rust backend.

After installing Node.js and Rust, restart your terminal so the new `PATH` entries take effect.

## Development

```powershell
# 1. Enter the app directory
cd app

# 2. Install Node.js dependencies
npm install

# 3. Start the dev server (frontend hot-reload + Rust backend)
npm run tauri dev
```

The first run downloads and compiles all Rust crates, which takes several minutes. Subsequent runs are fast.

## Production Build

```powershell
cd app
npm run tauri build
```

The standalone executable is output to:

```
src-tauri/target/release/rdp-extended.exe
```

### Creating an Installer

To generate a Windows NSIS or MSI installer:

```powershell
# NSIS installer (default)
npm run tauri build

# MSI installer
npm run tauri build -- --bundles msi
```

Installers are placed in `src-tauri/target/release/bundle/`.

## GitHub Releases

This repository is configured to create real Windows release assets through GitHub Actions.

### What the workflow does

- Pushes to `main` and pull requests only validate that the app builds successfully.
- Pushing a tag that starts with `v` creates a **draft GitHub Release**.
- The release includes the Tauri-generated Windows installer and bundle artifacts, not just GitHub's default source code zip files.

### How to publish a release

1. Update the version in [app/package.json](../app/package.json) and [app/src-tauri/tauri.conf.json](../app/src-tauri/tauri.conf.json).
2. Commit and push the version change to `main`.
3. Create and push a version tag:

```powershell
git tag v0.1.0
git push origin v0.1.0
```

4. Open the repository's Releases page on GitHub.
5. Open the draft release created by the workflow.
6. Review the attached assets and publish the release.

### Expected assets

Depending on the active Tauri bundle targets, GitHub Releases will include assets such as:

- `.msi`
- `setup.exe`
- updater metadata files, if updater support is enabled later

## Troubleshooting

**`npm: command not found`**  
Install Node.js and restart your terminal.

**`rustc: command not found`**  
Install Rust via `rustup` and restart your terminal.

**`error: linker 'link.exe' not found`**  
Open the build in a **Developer PowerShell for VS** or run the build from within Visual Studio's integrated terminal, which pre-loads the MSVC environment variables.

**Monitor list is empty at runtime**  
Confirm you are running on Windows with at least one display connected.

**RDP session does not launch**  
Ensure `mstsc.exe` is available (included in Windows Pro and Enterprise editions).
