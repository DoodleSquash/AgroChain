import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { apiFetch, API, authHeaders } from '../../lib/api';
import { usePersistentState } from '../../hooks/usePersistentState';

interface UserResult {
  id: string;
  name: string;
  role: string;
  profile?: { profile_picture: string | null };
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

interface Chat {
  id: string;
  farmer_id: string;
  buyer_id: string;
  updated_at: string;
  otherUser?: UserResult;
  messages?: Message[];
}

function Avatar({ user, size = 'md' }: { user?: UserResult | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-12 h-12 text-base';
  return (
    <div className={`${sizeClass} rounded-full flex-shrink-0 bg-primary-100 flex items-center justify-center overflow-hidden border border-outline-variant/20`}>
      {user?.profile?.profile_picture ? (
        <img src={user.profile.profile_picture} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-primary-700">{user?.name?.charAt(0) ?? '?'}</span>
      )}
    </div>
  );
}

export default function Chats() {
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = usePersistentState(`chat_draft_${activeChat?.id || 'none'}`, '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<Chat | null>(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Socket setup
  useEffect(() => {
    const newSocket = io(API.replace('/api', ''));
    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const fetchChats = async () => {
    try {
      const data = await apiFetch<Chat[]>('/chat');
      setChats(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const openOrCreateChat = useCallback(async (targetUserId: string, existingChats?: Chat[]) => {
    const chatList = existingChats ?? chats;
    
    // Check if chat already exists locally first
    const existing = chatList.find(c =>
      (c.farmer_id === userId && c.buyer_id === targetUserId) ||
      (c.buyer_id === userId && c.farmer_id === targetUserId)
    );
    if (existing) {
      setActiveChat(existing);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    try {
      const chat = await apiFetch<Chat>('/chat/start', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      });
      // Refresh chats list then open the new chat
      setChats(prev => {
        if (prev.find(c => c.id === chat.id)) return prev;
        return [chat, ...prev];
      });
      setActiveChat(chat);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  }, [chats, userId]);

  // Init effect: load chats, then open DM if ?userId= param is present
  useEffect(() => {
    if (!userId) return;
    const init = async () => {
      const loaded = await fetchChats();
      if (initialUserId) {
        await openOrCreateChat(initialUserId, loaded);
      }
    };
    init();
  }, [userId, initialUserId]);

  // Socket: join room + listen for messages
  useEffect(() => {
    if (!activeChat || !socket) return;

    apiFetch<Message[]>(`/chat/${activeChat.id}/messages`)
      .then(data => setMessages(data))
      .catch(console.error);

    socket.emit('join_chat', activeChat.id);

    const handleReceive = (msg: Message) => {
      if (msg.chat_id === activeChatRef.current?.id) {
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
      // Update the last message preview in sidebar
      setChats(prev => prev.map(c => c.id === msg.chat_id ? { ...c, messages: [msg] } : c));
    };

    socket.on('receive_message', handleReceive);
    return () => { socket.off('receive_message', handleReceive); };
  }, [activeChat?.id, socket]);

  // Search with debounce
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await apiFetch<UserResult[]>(`/chat/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const filteredChats = searchQuery.trim()
    ? chats.filter(c => c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  // Users from search that are NOT already in chats
  const newUserResults = searchResults.filter(u =>
    !chats.some(c => c.otherUser?.id === u.id)
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !socket) return;
    if (!newMessage.trim() && !imageFile) return;

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        setUploading(true);
        const form = new FormData();
        form.append('file', imageFile);
        const headers = authHeaders() as any;
        const res = await fetch(`${API}/upload?folder=chats`, {
          method: 'POST',
          headers: { 'Authorization': headers['Authorization'] || headers['authorization'] },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        imageUrl = data.url;
      } catch (err) {
        console.error('Image upload failed', err);
        return;
      } finally {
        setUploading(false);
        setImageFile(null);
      }
    }

    socket.emit('send_message', {
      chat_id: activeChat.id,
      sender_id: userId,
      content: newMessage.trim() || null,
      image_url: imageUrl
    });
    setNewMessage('');
    localStorage.removeItem(`chat_draft_${activeChat.id}`);
  };

  const isShowingSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full pt-16 bg-surface-container-low overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-outline-variant/20 bg-white`}>

        {/* Header + Search */}
        <div className="p-4 border-b border-outline-variant/20 flex flex-col gap-3 bg-[#f7f9fb]">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Messages</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[19px]">search</span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search or start a new chat..."
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px] text-gray-600">close</span>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">

          {/* Search results: existing chats matching query */}
          {isShowingSearch && filteredChats.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Conversations</p>
              {filteredChats.map(chat => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  active={activeChat?.id === chat.id}
                  userId={userId}
                  onClick={() => { setActiveChat(chat); setSearchQuery(''); setSearchResults([]); }}
                />
              ))}
            </div>
          )}

          {/* Search results: new users to message */}
          {isShowingSearch && (
            <>
              {searching && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                  Searching...
                </div>
              )}
              {!searching && newUserResults.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start new chat</p>
                  {newUserResults.map(u => (
                    <div
                      key={u.id}
                      onClick={() => openOrCreateChat(u.id)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <Avatar user={u} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{u.role}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary-500 text-[20px]">chat</span>
                    </div>
                  ))}
                </div>
              )}
              {!searching && searchQuery.trim() && newUserResults.length === 0 && filteredChats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 px-4">
                  <span className="material-symbols-outlined text-[40px] text-gray-200 mb-2">person_search</span>
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-xs mt-1">Try a different name</p>
                </div>
              )}
            </>
          )}

          {/* Normal chats list (no search) */}
          {!isShowingSearch && (
            chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 h-64">
                <span className="material-symbols-outlined text-[48px] text-gray-200 mb-3">chat_bubble_outline</span>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Search for a user above to start chatting.</p>
              </div>
            ) : (
              chats.map(chat => (
                <ChatRow
                  key={chat.id}
                  chat={chat}
                  active={activeChat?.id === chat.id}
                  userId={userId}
                  onClick={() => setActiveChat(chat)}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#fbfdfd]`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-outline-variant/20 shadow-sm flex items-center gap-3 sticky top-0 z-10">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">arrow_back</span>
              </button>
              <Avatar user={activeChat.otherUser} size="sm" />
              <div>
                <h3 className="font-bold text-on-surface leading-tight">{activeChat.otherUser?.name || 'Unknown User'}</h3>
                <p className="text-[11px] text-gray-400 font-medium capitalize">{activeChat.otherUser?.role?.toLowerCase()}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <span className="material-symbols-outlined text-[48px] text-gray-200 mb-2">waving_hand</span>
                  <p className="text-sm font-medium">Say hello to {activeChat.otherUser?.name}</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender_id === userId;
                  const prevMsg = messages[idx - 1];
                  const showDateSep = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString();
                  return (
                    <React.Fragment key={msg.id || idx}>
                      {showDateSep && (
                        <div className="flex items-center justify-center my-2">
                          <span className="text-[11px] font-semibold text-gray-400 bg-gray-100/80 px-3 py-1 rounded-full">
                            {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                        <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white text-on-surface border border-gray-100 rounded-bl-sm'}`}>
                          {msg.image_url && (
                            <img src={msg.image_url} alt="Sent" className="rounded-xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity" />
                          )}
                          {msg.content && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>}
                          <div className={`text-[10px] mt-1 text-right font-medium ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 md:p-4 bg-white border-t border-outline-variant/20">
              {imageFile && (
                <div className="mb-2 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 w-fit">
                  <span className="material-symbols-outlined text-gray-500 text-[18px]">image</span>
                  <span className="text-xs font-medium text-gray-600 truncate max-w-[150px]">{imageFile.name}</span>
                  <button onClick={() => setImageFile(null)} className="ml-1 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-200 transition-colors">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 bg-[#f7f9fb] border border-gray-100 rounded-2xl flex items-end p-1 transition-colors focus-within:border-primary-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-500/10">
                  <label className="p-2.5 text-gray-400 hover:text-primary-600 cursor-pointer flex items-center justify-center transition-colors rounded-xl">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }} />
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-3 text-[15px] font-medium placeholder:text-gray-400 max-h-32"
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !imageFile) || uploading}
                  className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm active:scale-95"
                >
                  {uploading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <span className="material-symbols-outlined" style={{ paddingLeft: '2px' }}>send</span>
                  }
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[48px] text-primary-600">forum</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Your Messages</h2>
            <p className="text-on-surface-variant max-w-sm text-sm">Select a conversation or search for someone to start a new chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: Chat Row ──
function ChatRow({ chat, active, userId, onClick }: { chat: Chat; active: boolean; userId: string; onClick: () => void }) {
  const lastMsg = chat.messages?.[0];
  const preview = lastMsg?.content ?? (lastMsg?.image_url ? '📷 Image' : 'No messages yet');

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-50 ${active ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-gray-50'}`}
    >
      <div className="relative">
        <Avatar user={chat.otherUser} />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="font-bold text-on-surface truncate text-sm">{chat.otherUser?.name || 'Unknown User'}</h3>
          {lastMsg && (
            <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
              {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate font-medium mt-0.5">{preview}</p>
      </div>
    </div>
  );
}
