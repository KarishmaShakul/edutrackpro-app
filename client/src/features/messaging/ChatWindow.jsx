import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient }     from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useSocket }   from '../../context/SocketContext.jsx';
import { messageApi }  from '../../api/index.js';
import { Send, ArrowLeft, Users, Megaphone, MoreVertical } from 'lucide-react';
import { format }      from 'date-fns';

const ROLE_COLOR = {
  admin:   'bg-purple-100 text-purple-700',
  hod:     'bg-blue-100   text-blue-700',
  teacher: 'bg-teal-100   text-teal-700',
  student: 'bg-amber-100  text-amber-700',
};

const getOtherParticipant = (conv, currentUser) => {
  if (!conv || conv.type !== 'direct') return null;
  return conv.participants?.find(p => p._id !== currentUser._id);
};

export default function ChatWindow({
  conversationId, conversation, typingUser,
  currentUser, onBack,
}) {
  const socket   = useSocket();
  const qc       = useQueryClient();
  const [text, setText]           = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const typingTimer               = useRef(null);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn:  () => messageApi.getMessages(conversationId).then(r => r.data.data),
    enabled:  !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: messageApi.send,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: messageApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!socket) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', { conversationId });
    }, 1500);
  }, [socket, conversationId, isTyping]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMutation.mutate({ conversationId, text: trimmed });
    setText('');
    socket?.emit('typing:stop', { conversationId });
    setIsTyping(false);
    clearTimeout(typingTimer.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages  = data?.messages || [];
  const other     = getOtherParticipant(conversation, currentUser);
  const convName  = conversation?.name || other?.name || 'Chat';

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = format(new Date(msg.createdAt), 'MMM dd, yyyy');
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
        <button onClick={onBack}
          className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft size={18}/>
        </button>

        {/* Avatar */}
        {conversation?.type === 'group' ? (
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users size={18} className="text-blue-600"/>
          </div>
        ) : conversation?.type === 'announcement' ? (
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Megaphone size={18} className="text-purple-600"/>
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                           ${ROLE_COLOR[other?.role] || 'bg-gray-100 text-gray-600'}`}>
            {other?.name?.charAt(0) || '?'}
          </div>
        )}

        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{convName}</p>
          <p className="text-xs text-gray-400 capitalize">
            {typingUser
              ? <span className="text-teal-600 font-medium">{typingUser.name} is typing...</span>
              : conversation?.type === 'direct' && other
                ? other.role
                : `${conversation?.participants?.length || 0} members`
            }
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Say hello! 👋</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="text-xs text-gray-400 font-medium px-2">{date}</span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>

              <div className="space-y-2">
                {msgs.map((msg, idx) => {
                  const isMine   = msg.sender?._id === currentUser?._id ||
                                   msg.sender    === currentUser?._id;
                  const showAvatar = !isMine &&
                    (idx === 0 || msgs[idx-1]?.sender?._id !== msg.sender?._id);

                  return (
                    <div key={msg._id}
                      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

                      {/* Avatar */}
                      {!isMine && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                         text-xs font-bold shrink-0 mb-0.5
                                         ${showAvatar
                                           ? ROLE_COLOR[msg.sender?.role] || 'bg-gray-200 text-gray-600'
                                           : 'opacity-0'}`}>
                          {msg.sender?.name?.charAt(0)}
                        </div>
                      )}

                      <div className={`group max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* Sender name (group chats) */}
                        {!isMine && conversation?.type !== 'direct' && showAvatar && (
                          <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>
                        )}

                        {/* Bubble */}
                        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                          ${isMine
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                          }`}>
                          {msg.text}

                          {/* Delete (own messages) */}
                          {isMine && (
                            <button
                              onClick={() => deleteMutation.mutate(msg._id)}
                              className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white
                                         rounded-full text-[10px] hidden group-hover:flex
                                         items-center justify-center hover:bg-red-600 transition-colors">
                              ×
                            </button>
                          )}
                        </div>

                        {/* Time */}
                        <p className={`text-[10px] text-gray-400 mt-0.5
                          ${isMine ? 'text-right' : 'text-left'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-end gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                             ${ROLE_COLOR['teacher'] || 'bg-gray-200'}`}>
              {typingUser.name?.charAt(0)}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => { setText(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl
                         text-sm focus:outline-none focus:ring-2 focus:ring-purple-300
                         resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
            className="w-11 h-11 bg-purple-600 text-white rounded-xl flex items-center justify-center
                       hover:bg-purple-700 transition-colors disabled:opacity-50 shrink-0">
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}