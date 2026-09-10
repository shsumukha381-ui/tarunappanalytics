import React, { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { DownloadCloud, Info, CheckCircle2, X } from 'lucide-react';

export const Updater: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // In a real Tauri environment, this checks against the endpoints configured in tauri.conf.json
      // Make sure the @tauri-apps/plugin-updater is installed via `npm i @tauri-apps/plugin-updater`
      const update = await check();
      
      if (update) {
        setUpdateInfo(update);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
    }
  };

  const downloadAndInstall = async () => {
    if (!updateInfo) return;
    
    setIsDownloading(true);
    setError(null);
    setProgress(0);

    try {
      let downloaded = 0;
      let contentLength = 0;

      await updateInfo.downloadAndInstall((event: any) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            console.log(`started downloading ${contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              const currentProgress = Math.round((downloaded / contentLength) * 100);
              setProgress(currentProgress);
            }
            break;
          case 'Finished':
            setIsDownloading(false);
            setIsDownloaded(true);
            break;
        }
      });
    } catch (err: any) {
      setIsDownloading(false);
      setError(`Update failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleRelaunch = async () => {
    try {
      await relaunch();
    } catch (err) {
      console.error('Failed to relaunch:', err);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-creator-card border border-creator-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-ai-cyan/10 text-ai-cyan">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Update Available!</h2>
                <p className="text-xs text-creator-muted">Version {updateInfo?.version}</p>
              </div>
            </div>
            
            {!isDownloading && !isDownloaded && (
              <button 
                onClick={() => setShowModal(false)}
                className="text-creator-muted hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-creator-border text-sm text-slate-300">
            <div className="flex items-center gap-2 mb-2 font-semibold text-white">
              <Info className="w-4 h-4 text-ai-cyan" /> Release Notes
            </div>
            <div className="text-xs text-creator-muted whitespace-pre-wrap max-h-32 overflow-y-auto">
              {updateInfo?.body || "Improvements, bug fixes, and performance enhancements."}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {isDownloading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-white mb-1">
                <span>Downloading Update...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 border border-slate-700 overflow-hidden">
                <div 
                  className="bg-ai-cyan h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : isDownloaded ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Update downloaded successfully. Restart required.
              </div>
              <button
                onClick={handleRelaunch}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-sm font-bold rounded-xl transition shadow-glow-cyan"
              >
                Restart & Install Update
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-transparent border border-creator-border hover:bg-creator-hover text-white text-sm font-semibold rounded-xl transition"
              >
                Remind Me Later
              </button>
              <button
                onClick={downloadAndInstall}
                className="flex-1 py-2.5 bg-gradient-to-r from-ai-cyan to-ai-indigo hover:brightness-110 text-white text-sm font-bold rounded-xl transition shadow-glow-cyan"
              >
                Download Update
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
