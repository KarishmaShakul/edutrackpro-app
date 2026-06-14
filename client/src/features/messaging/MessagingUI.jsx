import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useLocation }  from 'react-router-dom';
import { useSocket }    from '../../context/SocketContext.jsx';
import { messageApi, userApi } from '../../api/index.js';
import ConversationList  from './ConversationList.jsx';
import ChatWindow        from './ChatWindow.jsx';
import NewChatModal      from './NewChatModal.jsx';

export default function MessagingUI() {
  const location    = useLocation();
  const socket      = useSocket();
  const qc          = useQueryClient();
  const user        = useSelector(s => s.auth.user);

  const [activeConvId, setActiveConvId] = useState(
    location.state?.conversationId || null
  );
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  // Fetch all conversations
  const { data: conversations = [], refetch: refetchConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => messageApi.getConversations().then(r => r.data.data),
  });

  // Socket: listen for new messages + typing
  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (msg) => {
      qc.invalidateQueries({ queryKey: ['messages', msg.conversation] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('typing:start', ({ userId, name, conversationId }) => {
      setTypingUsers(prev => ({ ...prev, [conversationId]: { userId, name } }));
    });

    socket.on('typing:stop', ({ conversationId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket]);

  // Join conversation room when active conv changes
  useEffect(() => {
    if (!socket || !activeConvId) return;
    socket.emit('join:conversation', activeConvId);
    return () => socket.emit('leave:conversation', activeConvId);
  }, [socket, activeConvId]);

  const activeConv = conversations.find(c => c._id === activeConvId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Left — conversation list */}
      <div className={`w-80 border-r border-gray-100 flex flex-col shrink-0
                       ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          conversations={conversations}
          activeConvId={activeConvId}
          onSelect={setActiveConvId}
          onNewChat={() => setShowNewChat(true)}
          typingUsers={typingUsers}
          currentUser={user}
        />
      </div>

      {/* Right — chat window */}
      <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {activeConvId ? (
          <ChatWindow
            conversationId={activeConvId}
            conversation={activeConv}
            typingUser={typingUsers[activeConvId]}
            currentUser={user}
            onBack={() => setActiveConvId(null)}
          />
        ) : (
          <EmptyState onNewChat={() => setShowNewChat(true)} />
        )}
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={(convId) => {
            setShowNewChat(false);
            setActiveConvId(convId);
            qc.invalidateQueries({ queryKey: ['conversations'] });
          }}
          currentUser={user}
        />
      )}
    </div>
  );
}

const EmptyState = ({ onNewChat }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="text-center">
      <p className="font-medium text-gray-600">No conversation selected</p>
      <p className="text-sm mt-1">Pick one from the list or start a new chat</p>
    </div>
    <button onClick={onNewChat}
      className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
      Start New Chat
    </button>
  </div>
);