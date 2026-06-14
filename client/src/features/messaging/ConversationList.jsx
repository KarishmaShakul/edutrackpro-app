import { useState } from 'react';
import { Search, Plus, Users, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ROLE_COLOR = {
  admin:   'bg-purple-100 text-purple-700',
  hod:     'bg-blue-100   text-blue-700',
  teacher: 'bg-teal-100   text-teal-700',
  student: 'bg-amber-100  text-amber-700',
};

const getConvName = (conv, currentUser) => {
  if (conv.name) return conv.name;
  const other = conv.participants?.find(p => p._id !== currentUser._id);
  return other?.name || 'Unknown';
};

const getConvAvatar = (conv, currentUser) => {
  if (conv.type === 'group')        return null;
  if (conv.type === 'announcement') return null;
  const other = conv.participants?.find(p => p._id !== currentUser._id);
  return { initial: other?.name?.charAt(0) || '?', role: other?.role };
};

export default function ConversationList({
  conversations, activeConvId, onSelect,
  onNewChat, typingUsers, currentUser,
}) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    const name = getConvName(c, currentUser).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Messages</h2>
          <button onClick={onNewChat}
            className="w-8 h-8 bg-purple-600 text-white rounded-xl flex items-center justify-center
                       hover:bg-purple-700 transition-colors">
            <Plus size={16}/>
          </button>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl
                       text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"/>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          filtered.map(conv => {
            const name     = getConvName(conv, currentUser);
            const avatar   = getConvAvatar(conv, currentUser);
            const isActive = conv._id === activeConvId;
            const isTyping = typingUsers[conv._id];
            const unread   = conv.myUnread || 0;

            return (
              <button key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50
                            transition-colors text-left border-b border-gray-50
                            ${isActive ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}>

                {/* Avatar */}
                {conv.type === 'group' ? (
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-blue-600"/>
                  </div>
                ) : conv.type === 'announcement' ? (
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Megaphone size={18} className="text-purple-600"/>
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                   shrink-0 text-sm font-bold
                                   ${ROLE_COLOR[avatar?.role] || 'bg-gray-100 text-gray-600'}`}>
                    {avatar?.initial}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${isActive ? 'font-semibold text-purple-700' : 'font-medium text-gray-800'}`}>
                      {name}
                    </p>
                    {conv.lastMessage?.createdAt && (
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {isTyping
                      ? <span className="text-teal-600 font-medium">typing...</span>
                      : conv.lastMessage?.text || 'No messages yet'
                    }
                  </p>
                </div>

                {/* Unread badge */}
                {unread > 0 && (
                  <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold
                                   rounded-full flex items-center justify-center shrink-0">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}