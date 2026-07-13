import { Upload } from '@phosphor-icons/react';
import { useState, useRef } from 'react';
import type { MessageAsset } from '~/types/chat';

interface ChatInputProps {
  message: string;
  onChange: (message: string) => void;
  onSubmit: (e: React.FormEvent, assets: string[]) => void;
  isSending?: boolean;
  channelId: string;
  sessionId: string;
}

export function ChatInput({ 
  message, 
  onChange, 
  onSubmit, 
  isSending = false,
  channelId,
  sessionId 
}: ChatInputProps) {
  const [pendingAssets, setPendingAssets] = useState<MessageAsset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    const uploads = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://group-chat.shashwats018.workers.dev/channel/upload', {
        method: 'POST',
        headers: {
          'X-Channel-Id': channelId,
          'X-Session-Id': sessionId,
        },
        body: formData
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error('Upload failed');
      }
      
      return {
        url: data.url,
        filename: file.name,
        contentType: file.type,
        size: file.size
      };
    });

    try {
      const assets = await Promise.all(uploads);
      setPendingAssets([...pendingAssets, ...assets]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';  // Reset the file input
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = e.clipboardData.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e, pendingAssets.map(asset => asset.url));
        setPendingAssets([]); // Clear assets after sending
      }} className="border-t border-neutral-200/80 bg-white/70 p-3 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-950/70 sm:p-4">
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/90">
          <textarea 
            value={message}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Message #channel-name"
            className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500 sm:text-base"
            rows={4}
            disabled={isSending}
          />

          {pendingAssets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pendingAssets.map((asset) => (
                <div 
                  key={asset.url} 
                  className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <span className="max-w-40 truncate">{asset.filename}</span>
                  <button
                    type="button"
                    onClick={() => setPendingAssets(
                      pendingAssets.filter(a => a.url !== asset.url)
                    )}
                    title={`Remove ${asset.filename}`}
                    aria-label={`Remove ${asset.filename}`}
                    className="rounded-full px-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload files"
              aria-label="Upload files"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Upload size={16} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              title="Upload files"
              aria-label="Upload files"
              onChange={(e) => handleFileSelect(e.target.files!)}
            />

            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 