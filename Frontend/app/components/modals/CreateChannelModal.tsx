import { useState } from 'react';
import { useChatContext } from '~/providers/ChatProvider';
import { Lock } from "@phosphor-icons/react";
import type { User } from '~/types/chat';

type CreateChannelModalProps = {
  onClose: () => void;
}

export const CreateChannelModal = ({ onClose }: CreateChannelModalProps) => {
  const { users, addChannel } = useChatContext();
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([
    localStorage.getItem('userId') || '' // Include current user by default
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('https://group-chat.shashwats018.workers.dev/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('session') || ''
        },
        body: JSON.stringify({
          name: channelName,
          description,
          is_private: isPrivate,
          member_ids: selectedUsers
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create channel');
      }

      addChannel(data.channel);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create channel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-5 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Create a new channel</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Channel name
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
            placeholder="e.g. project-discussion"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:bg-neutral-950 dark:focus:ring-blue-400/10"
            placeholder="What's this channel about?"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-neutral-300 dark:border-neutral-700"
          />
          <label htmlFor="private" className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <Lock size={16} />
            Private channel
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Add members
          </label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center px-3 py-3 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    setSelectedUsers(prev =>
                      e.target.checked
                        ? [...prev, user.id]
                        : prev.filter(id => id !== user.id)
                    );
                  }}
                  className="mr-2 rounded border-neutral-300 dark:border-neutral-700"
                />
                {user.first_name} {user.last_name}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !channelName.trim()}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </form>
    </div>
  );
}; 