import { appWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  title: string;
}

export default function TitleBar({ title }: TitleBarProps) {
  const minimize = () => appWindow.minimize();
  const toggleMaximize = () => appWindow.toggleMaximize();
  const close = () => appWindow.close();

  return (
    <div
      data-tauri-drag-region
      className="h-8 bg-surface-elevated flex items-center justify-between px-3 select-none"
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span className="text-xs text-text-primary font-normal">{title}</span>
      </div>
      <div className="flex">
        <button
          onClick={minimize}
          className="w-12 h-8 hover:bg-white/10 flex items-center justify-center text-text-primary"
          title="Minimize"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={toggleMaximize}
          className="w-12 h-8 hover:bg-white/10 flex items-center justify-center text-text-primary"
          title="Maximize"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </button>
        <button
          onClick={close}
          className="w-12 h-8 hover:bg-red-600 flex items-center justify-center text-text-primary"
          title="Close"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
