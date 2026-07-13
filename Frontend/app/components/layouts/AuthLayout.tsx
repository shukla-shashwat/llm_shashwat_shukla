import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Moon, Sun, Plus, Lock, SignOut, Chats } from "@phosphor-icons/react";
import { useChatContext } from "~/providers/ChatProvider";
import { useWebSocket } from "~/providers/WebSocketProvider";
import { useModal } from '~/providers/ModalProvider';
import { CreateChannelModal } from '~/components/modals/CreateChannelModal';

export default function AuthLayout() {
    const location = useLocation();
    const { channels, onlineUsers, offlineUsers, isLoadingChannels, users, updateUserStatus } = useChatContext();
    const { addMessageListener, removeMessageListener } = useWebSocket();
    const [showThemeDropdown, setShowThemeDropdown] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            return (savedTheme || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) as 'light' | 'dark';
        }
        return 'light';
    });
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();
    const [unreadChannels, setUnreadChannels] = useState<Set<string>>(new Set());

    // Get current user's initials
    const userInitials = useMemo(() => {
        if (typeof window === 'undefined') return '';
        
        const userId = localStorage.getItem('userId');
        const currentUser = users.find(user => user.id === userId);
        if (currentUser) {
            return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
        }
        return 'B';
    }, [users]);

    // Listen for user status changes
    useEffect(() => {
        const handleUserStatus = (message: any) => {
            if (message.type === 'USER_CONNECTED' || message.type === 'USER_DISCONNECTED') {
                updateUserStatus(
                    message.userId, 
                    message.type === 'USER_CONNECTED' ? 'online' : 'offline'
                );
            }
        };

        const handleNewMessage = (message: any) => {
            console.log('New message received:', message);
            if (message.type === 'NEW_MESSAGE') {
                const currentChannelId = location.pathname.split('/').pop();
                // If message is for a different channel than the current one, mark it as unread
                if (message.channelId !== currentChannelId) {
                    setUnreadChannels(prev => {
                        const next = new Set(prev);
                        next.add(message.channelId);
                        return next;
                    });
                }
            }
        };

        addMessageListener('NEW_MESSAGE', handleNewMessage);
        addMessageListener('USER_STATUS', handleUserStatus);

        return () => {
            removeMessageListener('NEW_MESSAGE');
            removeMessageListener('USER_STATUS');
        };
    }, [addMessageListener, removeMessageListener, updateUserStatus, location.pathname]);

    // Apply theme on initial render and theme changes
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    // Add after the previous useEffect
    useEffect(() => {
        const channelId = location.pathname.split('/').pop();
        if (channelId) {
            setUnreadChannels(prev => {
                const next = new Set(prev);
                next.delete(channelId);
                return next;
            });
        }
    }, [location.pathname]);

    const toggleTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        setShowThemeDropdown(false);
    };

    const handleSignOut = async () => {
        try {
            const sessionId = localStorage.getItem('session');
            await fetch('https://group-chat.shashwats018.workers.dev/logout', {
                method: 'POST',
                headers: {
                    'X-Session-Id': sessionId || ''
                }
            });
            
            // Clear local storage
            localStorage.removeItem('session');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            
            // Redirect to login
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
        setShowThemeDropdown(false);
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <div className="flex w-full items-center justify-between border-b border-neutral-200/80 bg-white/75 px-4 py-3 backdrop-blur-xl transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/75 sm:px-6">
                <div className="flex flex-1 items-center gap-2 text-sm font-medium tracking-tight sm:text-base">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900">
                        <Chats size={16} weight="fill" />
                    </span>
                    <div>Group<strong>Chat</strong></div>
                </div>

                <div className="flex flex-row-reverse flex-1 items-center justify-end gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                        >
                            {userInitials}
                        </button>
                        
                        {showThemeDropdown && (
                            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
                                <div className="py-1">
                                    <button
                                        onClick={() => toggleTheme('light')}
                                        className="flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <Sun size={16} className="mr-2" />
                                        Light
                                    </button>
                                    <button
                                        onClick={() => toggleTheme('dark')}
                                        className="flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <Moon size={16} className="mr-2" />
                                        Dark
                                    </button>
                                    <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                                    <button
                                        onClick={handleSignOut}
                                        className="flex w-full items-center px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <SignOut size={16} className="mr-2" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
                {/* Sidebar */}
                <div className="max-h-72 w-full overflow-y-auto border-b border-neutral-200/80 bg-white/70 px-3 py-4 backdrop-blur-xl transition-colors dark:border-neutral-800/80 dark:bg-neutral-950/70 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
                    {/* Channels Section */}
                    <div className="mb-2 flex items-center justify-between px-2">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Channels
                        </h2>
                        <Plus 
                            size={16} 
                            className="cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            onClick={() => {
                                openModal(<CreateChannelModal onClose={closeModal} />);
                            }}
                        />
                    </div>
                    {isLoadingChannels ? (
                        <div className="px-2 py-1.5 text-sm text-neutral-500">Loading channels...</div>
                    ) : (
                        <div className="space-y-1">
                        {channels.map((channel) => (
                            <Link
                                key={channel.id}
                                to={`/channel/${channel.id}`}
                                className="flex items-center rounded-xl px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100/80 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-white"
                            >
                                <div className="flex min-w-0 flex-1 items-center">
                                    {channel.is_private ? (
                                        <Lock size={14} className="mr-2" />
                                    ) : (
                                        <span className="mr-2">#</span>
                                    )}
                                    <span className={`truncate ${unreadChannels.has(channel.id) ? 'font-semibold text-neutral-950 dark:text-white' : ''}`}>
                                        {channel.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        </div>
                    )}

                    {/* Users Section */}
                    <div className="mt-6 mb-2 flex items-center justify-between px-2">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                            Users
                        </h2>
                        <Plus 
                            size={16} 
                            className="cursor-pointer text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" 
                        />
                    </div>
                    {/* Online Users */}
                    <div className="space-y-1">
                        {onlineUsers.map((user) => (
                            <div 
                                key={user.id}
                                className="flex items-center rounded-xl px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100/80 dark:text-neutral-300 dark:hover:bg-neutral-900/80"
                            >
                                <span className="mr-2 size-2 rounded-full bg-green-500"></span>
                                <span className="truncate">{user.first_name} {user.last_name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Offline Users */}
                    <div className="space-y-1">
                        {offlineUsers.map((user) => (
                            <div 
                                key={user.id}
                                className="flex items-center rounded-xl px-3 py-2 text-sm text-neutral-700 opacity-60 transition-colors hover:bg-neutral-100/80 dark:text-neutral-300 dark:hover:bg-neutral-900/80"
                            >
                                <span className="mr-2 size-2 rounded-full bg-neutral-400"></span>
                                <span className="truncate">{user.first_name} {user.last_name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
} 