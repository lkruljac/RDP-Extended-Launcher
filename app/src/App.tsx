import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { ConnectionProfile, MonitorDescriptor } from './types';
import { loadProfiles, saveProfiles } from './profileStore';
import { getMonitors, launchConnection } from './api';

type ProfileKey = keyof ConnectionProfile;
type SettingSection = 'display' | 'redirection' | 'session';

interface ControlRowProps {
  label: string;
  description: string;
  children: ReactNode;
}

function ControlRow({ label, description, children }: ControlRowProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-3 xl:gap-4 items-start py-3 border-b border-white/5 last:border-b-0">
      <div>
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="text-xs text-text-secondary mt-1">{description}</div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

function SectionCard({ title, subtitle, children, className = '', contentClassName = '' }: SectionCardProps) {
  return (
    <section className={`rounded border border-border bg-surface-elevated/40 p-4 ${className}`}>
      <div className="mb-3">
        <div className="text-xs tracking-wide font-semibold text-primary uppercase">{title}</div>
        <div className="text-xs text-text-secondary mt-1">{subtitle}</div>
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

function App() {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ConnectionProfile | null>(null);
  const [monitors, setMonitors] = useState<MonitorDescriptor[]>([]);
  const [selectedMonitors, setSelectedMonitors] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState('Ready');
  const [hoveredMonitor, setHoveredMonitor] = useState<MonitorDescriptor | null>(null);
  const [activeSection, setActiveSection] = useState<SettingSection>('display');
  const [monitorCanvasElement, setMonitorCanvasElement] = useState<HTMLDivElement | null>(null);
  const [monitorCanvasSize, setMonitorCanvasSize] = useState({ width: 1, height: 1 });

  const fieldClassName =
    'w-full px-3 py-2 bg-surface border border-border rounded text-text-primary focus:outline-none focus:border-primary/80';

  const monitorLayout = useMemo(() => {
    if (monitors.length === 0) {
      return {
        minX: 0,
        minY: 0,
        totalWidth: 1,
        totalHeight: 1,
      };
    }

    const minX = Math.min(...monitors.map((m) => m.bounds_x));
    const minY = Math.min(...monitors.map((m) => m.bounds_y));
    const maxX = Math.max(...monitors.map((m) => m.bounds_x + m.bounds_width));
    const maxY = Math.max(...monitors.map((m) => m.bounds_y + m.bounds_height));

    return {
      minX,
      minY,
      totalWidth: Math.max(maxX - minX, 1),
      totalHeight: Math.max(maxY - minY, 1),
    };
  }, [monitors]);

  const monitorDrawing = useMemo(() => {
    const padding = 12;
    const availableWidth = Math.max(monitorCanvasSize.width - padding * 2, 1);
    const availableHeight = Math.max(monitorCanvasSize.height - padding * 2, 1);
    const fitScale = Math.min(
      availableWidth / monitorLayout.totalWidth,
      availableHeight / monitorLayout.totalHeight
    );

    const smallestMonitorWidth = Math.max(1, Math.min(...monitors.map((m) => m.bounds_width)));
    const smallestMonitorHeight = Math.max(1, Math.min(...monitors.map((m) => m.bounds_height)));
    const minimumVisibleScale = Math.max(28 / smallestMonitorWidth, 18 / smallestMonitorHeight);

    // Keep monitors readable; if needed, allow scrolling instead of shrinking to near-zero.
    const scale = Math.max(fitScale, minimumVisibleScale);

    const stageWidth = monitorLayout.totalWidth * scale;
    const stageHeight = monitorLayout.totalHeight * scale;
    const contentWidth = Math.max(stageWidth + padding * 2, monitorCanvasSize.width);
    const contentHeight = Math.max(stageHeight + padding * 2, monitorCanvasSize.height);
    const offsetX = stageWidth < availableWidth ? (monitorCanvasSize.width - stageWidth) / 2 : padding;
    const offsetY = stageHeight < availableHeight ? (monitorCanvasSize.height - stageHeight) / 2 : padding;

    return {
      scale,
      offsetX,
      offsetY,
      stageWidth,
      stageHeight,
      contentWidth,
      contentHeight,
    };
  }, [monitorCanvasSize, monitorLayout, monitors]);

  useEffect(() => {
    if (!monitorCanvasElement) {
      return;
    }

    const updateSize = () => {
      const rect = monitorCanvasElement.getBoundingClientRect();
      setMonitorCanvasSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      setMonitorCanvasSize({ width, height });
    });

    observer.observe(monitorCanvasElement);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [monitorCanvasElement]);

  useEffect(() => {
    const loaded = loadProfiles();
    setProfiles(loaded);
    if (loaded.length > 0) {
      setSelectedProfile(loaded[0]);
    }
    loadMonitors();
  }, []);

  const loadMonitors = async () => {
    try {
      const mons = await getMonitors();
      setMonitors(mons);
      setStatus(`Detected ${mons.length} monitor(s)`);
    } catch (error) {
      setStatus(`Error loading monitors: ${error}`);
    }
  };

  const handleConnect = async () => {
    if (!selectedProfile || !selectedProfile.host) {
      setStatus('Please enter a host address');
      return;
    }

    try {
      setStatus('Connecting...');
      const selectedMons = monitors.filter((m) => selectedMonitors.has(m.index));
      await launchConnection(
        selectedProfile,
        selectedMons.length > 0,
        selectedProfile.use_span_by_default,
        selectedMons,
        selectedProfile.width,
        selectedProfile.height
      );
      setStatus('Connection launched successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleSave = () => {
    saveProfiles(profiles);
    setStatus('Profiles saved');
  };

  const handleAddProfile = () => {
    const newProfile: ConnectionProfile = {
      id: crypto.randomUUID(),
      name: `New Profile ${profiles.length + 1}`,
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
    };
    setProfiles([...profiles, newProfile]);
    setSelectedProfile(newProfile);
  };

  const handleDeleteProfile = () => {
    if (!selectedProfile || profiles.length === 1) return;
    const filtered = profiles.filter((p) => p.id !== selectedProfile.id);
    setProfiles(filtered);
    setSelectedProfile(filtered[0]);
    saveProfiles(filtered);
  };

  const updateProfile = (updates: Partial<ConnectionProfile>) => {
    if (!selectedProfile) return;
    const updated = { ...selectedProfile, ...updates };
    setSelectedProfile(updated);
    setProfiles(profiles.map((p) => (p.id === updated.id ? updated : p)));
  };

  const toggleMonitor = (index: number) => {
    const newSet = new Set(selectedMonitors);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedMonitors(newSet);
  };

  const updateTextField = (key: ProfileKey, value: string) => {
    updateProfile({ [key]: value } as Partial<ConnectionProfile>);
  };

  const updateNumericField = (key: ProfileKey, value: string) => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    updateProfile({ [key]: parsed } as Partial<ConnectionProfile>);
  };

  const updateToggleField = (key: ProfileKey, checked: boolean) => {
    updateProfile({ [key]: checked } as Partial<ConnectionProfile>);
  };

  const sectionTitleMap: Record<SettingSection, string> = {
    display: 'Display',
    redirection: 'Redirection',
    session: 'Session',
  };

  const sectionDescriptionMap: Record<SettingSection, string> = {
    display: 'Desktop size and monitor behavior.',
    redirection: 'Device and data redirection during session.',
    session: 'Connection bar and media behavior.',
  };

  const advancedSections: SettingSection[] = ['display', 'redirection', 'session'];

  return (
    <div className="h-dvh w-full flex flex-col bg-background">
      <div className="flex-1 flex gap-3 xl:gap-4 p-3 xl:p-5 min-h-0 min-w-0 overflow-hidden">
        {/* Profiles Panel */}
        <div className="w-[clamp(12rem,22vw,20rem)] bg-surface border border-border rounded flex flex-col p-3 min-h-0 overflow-hidden shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-text-secondary">PROFILES</span>
            <button
              onClick={handleAddProfile}
              className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-primary"
              title="Add Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className={`p-2 rounded cursor-pointer ${
                  selectedProfile?.id === profile.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-white/5 text-text-primary'
                }`}
              >
                {profile.name}
              </div>
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
          <div className="flex-1 bg-surface border border-border rounded p-4 overflow-hidden min-h-0">
            {selectedProfile && (
              <div className="h-full overflow-y-auto pr-1 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-text-secondary">PROFILE SETTINGS</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 rounded bg-surface-elevated hover:bg-white/10 text-text-primary text-sm"
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="px-3 py-1 rounded bg-danger hover:bg-red-700 text-white text-sm"
                      title="Delete"
                      disabled={profiles.length === 1}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <SectionCard title="General Settings" subtitle="Core identity and server endpoint">
                  <ControlRow label="Profile Name" description="Display name used in your profile list.">
                    <input
                      type="text"
                      value={selectedProfile.name}
                      onChange={(e) => updateTextField('name', e.target.value)}
                      className={fieldClassName}
                    />
                  </ControlRow>
                  <ControlRow label="Host / IP" description="Remote desktop server address.">
                    <input
                      type="text"
                      value={selectedProfile.host}
                      onChange={(e) => updateTextField('host', e.target.value)}
                      className={fieldClassName}
                      placeholder="server.example.com"
                    />
                  </ControlRow>
                  <ControlRow label="Port" description="RDP service port, usually 3389.">
                    <input
                      type="number"
                      min={1}
                      max={65535}
                      value={selectedProfile.port}
                      onChange={(e) => updateNumericField('port', e.target.value)}
                      className={fieldClassName}
                    />
                  </ControlRow>
                  <ControlRow label="Username" description="Optional prefilled user account.">
                    <input
                      type="text"
                      value={selectedProfile.username}
                      onChange={(e) => updateTextField('username', e.target.value)}
                      className={fieldClassName}
                    />
                  </ControlRow>
                  <ControlRow label="Domain" description="Windows domain or workgroup.">
                    <input
                      type="text"
                      value={selectedProfile.domain}
                      onChange={(e) => updateTextField('domain', e.target.value)}
                      className={fieldClassName}
                    />
                  </ControlRow>
                </SectionCard>

                <SectionCard title="Monitor Selection" subtitle="Choose which monitors are used for this launch.">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMonitors(new Set(monitors.map((m) => m.index)))}
                        className="px-2 py-1 text-xs rounded bg-surface hover:bg-white/10 text-text-primary"
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedMonitors(new Set())}
                        className="px-2 py-1 text-xs rounded bg-surface hover:bg-white/10 text-text-primary"
                      >
                        Clear
                      </button>
                      <button
                        onClick={loadMonitors}
                        className="px-2 py-1 text-xs rounded bg-surface hover:bg-white/10 text-text-primary"
                        title="Refresh"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div
                    className="bg-surface border border-border rounded p-3 min-h-[140px] max-h-[70vh] relative overflow-hidden"
                    style={{
                      aspectRatio: `${monitorLayout.totalWidth} / ${monitorLayout.totalHeight}`,
                    }}
                  >
                    <div ref={setMonitorCanvasElement} className="relative w-full h-full overflow-auto">
                      <div
                        className="relative"
                        style={{
                          width: `${monitorDrawing.contentWidth}px`,
                          height: `${monitorDrawing.contentHeight}px`,
                        }}
                      >
                        {monitors.map((monitor) => {
                          const width = monitor.bounds_width * monitorDrawing.scale;
                          const height = monitor.bounds_height * monitorDrawing.scale;
                          const left =
                            monitorDrawing.offsetX +
                            (monitor.bounds_x - monitorLayout.minX) * monitorDrawing.scale;
                          const top =
                            monitorDrawing.offsetY +
                            (monitor.bounds_y - monitorLayout.minY) * monitorDrawing.scale;
                          const showLabel = width >= 36 && height >= 22;

                          return (
                            <div
                              key={monitor.index}
                              onClick={() => toggleMonitor(monitor.index)}
                              onMouseEnter={() => setHoveredMonitor(monitor)}
                              onMouseLeave={() => setHoveredMonitor((current) => (current?.index === monitor.index ? null : current))}
                              className={`absolute border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
                                selectedMonitors.has(monitor.index)
                                  ? 'border-primary bg-primary/20'
                                  : 'border-border hover:border-primary/50 bg-black/20'
                              }`}
                              style={{
                                left: `${left}px`,
                                top: `${top}px`,
                                width: `${width}px`,
                                height: `${height}px`,
                              }}
                              title={`${monitor.device_name} (${monitor.bounds_width}x${monitor.bounds_height}, ${Math.round(monitor.scale_factor * 100)}%)`}
                            >
                              {showLabel && (
                                <span className="text-xs text-text-primary font-medium">
                                  {monitor.index + 1}
                                  {monitor.is_primary && ' ★'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {monitors.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
                            No monitors detected
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute right-3 bottom-3 text-[10px] text-text-secondary bg-black/50 border border-border rounded px-2 py-1 pointer-events-none">
                      Ratio preserved. Scales with available space.
                    </div>
                    {hoveredMonitor && (
                      <div className="absolute left-3 bottom-3 text-xs text-text-primary bg-black/70 border border-border rounded px-2 py-1 pointer-events-none">
                        <div className="font-semibold">{hoveredMonitor.device_name}</div>
                        <div>
                          {hoveredMonitor.bounds_width}x{hoveredMonitor.bounds_height} px at {Math.round(hoveredMonitor.scale_factor * 100)}%
                        </div>
                        <div>
                          Position: {hoveredMonitor.bounds_x}, {hoveredMonitor.bounds_y}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-3 xl:gap-4 min-w-0">
                  <div className="rounded border border-border bg-surface-elevated/40 p-3">
                    <div className="text-xs font-semibold tracking-wide text-text-secondary uppercase mb-2">
                      Advanced Settings
                    </div>
                    <div className="text-xs text-text-secondary mb-2">Other settings grouped by category</div>
                    <div className="text-xs font-semibold text-primary uppercase px-2 py-1">Other Settings</div>
                    <div className="space-y-1">
                      {advancedSections.map((section) => (
                        <button
                          key={section}
                          type="button"
                          onClick={() => setActiveSection(section)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            activeSection === section
                              ? 'bg-primary/20 text-primary border border-primary/40'
                              : 'text-text-primary hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          {sectionTitleMap[section]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SectionCard
                    title={`Advanced Settings: ${sectionTitleMap[activeSection]}`}
                    subtitle={sectionDescriptionMap[activeSection]}
                  >
                    <div className="pr-1">
                      {activeSection === 'display' && (
                        <>
                          <ControlRow label="Desktop Size" description="Single-monitor fallback resolution.">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                min={640}
                                step={1}
                                value={selectedProfile.width}
                                onChange={(e) => updateNumericField('width', e.target.value)}
                                className={fieldClassName}
                                placeholder="Width"
                              />
                              <input
                                type="number"
                                min={480}
                                step={1}
                                value={selectedProfile.height}
                                onChange={(e) => updateNumericField('height', e.target.value)}
                                className={fieldClassName}
                                placeholder="Height"
                              />
                            </div>
                          </ControlRow>
                          <ControlRow label="Span Monitors" description="Span selected monitors as one desktop.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.use_span_by_default}
                                onChange={(e) => updateToggleField('use_span_by_default', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                        </>
                      )}

                      {activeSection === 'redirection' && (
                        <>
                          <ControlRow label="Clipboard" description="Allow copy and paste between local and remote.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.redirect_clipboard}
                                onChange={(e) => updateToggleField('redirect_clipboard', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                          <ControlRow label="Printers" description="Expose local printers inside remote session.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.redirect_printers}
                                onChange={(e) => updateToggleField('redirect_printers', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                          <ControlRow label="Drives" description="Share local drives with remote machine.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.redirect_drives}
                                onChange={(e) => updateToggleField('redirect_drives', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                          <ControlRow label="Smart Cards" description="Use local smart card devices remotely.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.redirect_smart_cards}
                                onChange={(e) => updateToggleField('redirect_smart_cards', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                        </>
                      )}

                      {activeSection === 'session' && (
                        <>
                          <ControlRow label="Connection Bar" description="Show the RDP bar in full-screen sessions.">
                            <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProfile.show_connection_bar}
                                onChange={(e) => updateToggleField('show_connection_bar', e.target.checked)}
                                className="w-4 h-4"
                              />
                              Enabled
                            </label>
                          </ControlRow>
                          <ControlRow label="Audio Mode" description="0: local playback, 1: remote, 2: disabled.">
                            <select
                              value={selectedProfile.audio_mode}
                              onChange={(e) => updateNumericField('audio_mode', e.target.value)}
                              className={fieldClassName}
                            >
                              <option value={0}>Play on this computer</option>
                              <option value={1}>Leave at remote computer</option>
                              <option value={2}>Do not play</option>
                            </select>
                          </ControlRow>
                        </>
                      )}
                    </div>
                  </SectionCard>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <span className="text-text-secondary">{status}</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConnect}
            className="h-[clamp(2rem,4.2vh,3rem)] px-3 bg-accent hover:bg-purple-700 text-white rounded font-medium text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
