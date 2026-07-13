import { useState } from 'react';
import { useChatContext } from '~/providers/ChatProvider';
import type { Channel } from '~/types/chat';

type InviteUsersModalProps = {
  onClose: () => void;
  channel: Channel;
}

export const InviteUsersModal = ({ onClose, channel }: InviteUsersModalProps) => {
  const { users } = useChatContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out users who are already in the channel
  const invitableUsers = users.filter(user => !channel.member_ids?.includes(user.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`https://group-chat.shashwats018.workers.dev/channels/${channel.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('session') || '',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to invite users');
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to invite users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-5 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Invite users to {channel.name}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Select users to invite
          </label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {invitableUsers.length === 0 ? (
              <div className="px-3 py-3 text-sm text-neutral-500">
                No users available to invite
              </div>
            ) : (
              invitableUsers.map((user) => (
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
              ))
            )}
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
            disabled={isLoading || selectedUsers.length === 0}
            className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Inviting...' : 'Invite Users'}
          </button>
        </div>
      </form>
    </div>
  );
}; 