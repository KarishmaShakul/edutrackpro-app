import { useState }  from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { X, Search, MessageSquare, Users } from 'lucide-react';
import { userApi, messageApi } from '../../api/index.js';
import toast from 'react-hot-toast';

const ROLE_COLOR = {
  admin:   'bg-purple-100 text-purple-700',
  hod:     'bg-blue-100   text-blue-700',
  teacher: 'bg-teal-100   text-teal-700',
  student: 'bg-amber-100  text-amber-700',
};

export default function NewChatModal({ onClose, onCreated, currentUser }) {
  const [tab,        setTab]        = useState('direct');
  const [search,     setSearch]     = useState('');
  const [groupName,  setGroupName]  = useState('');
  const [selected,   setSelected]   = useState([]);

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all-chat'],
    queryFn:  () => userApi.getAll({ limit: 200 }).then(r => r.data.data),
  });

  const users = (usersData?.users || [])
    .filter(u => u._id !== currentUser?._id)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const directMutation = useMutation({
    mutationFn: (recipientId) => messageApi.openDirect(recipientId),
    onSuccess:  (res) => onCreated(res.data.data._id),
    onError:    (e)   => toast.error(e.response?.data?.message || 'Error'),
  });

  const groupMutation = useMutation({
    mutationFn: (data) => messageApi.createGroup(data),
    onSuccess:  (res)  => onCreated(res.data.data._id),
    onError:    (e)    => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggleSelect = (userId) => {
    setSelected(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim())    return toast.error('Group name is required');
    if (selected.length < 2)  return toast.error('Select at least 2 members');
    groupMutation.mutate({ name: groupName, participantIds: selected, type: 'group' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">New Conversation</h3>
          <button onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <X size={18}/>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-100">
          {['direct','group'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all
                ${tab === t ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t === 'direct' ? <MessageSquare size={14}/> : <Users size={14}/>}
              {t === 'direct' ? 'Direct Message' : 'Group Chat'}
            </button>
          ))}
        </div>

        {/* Group name input */}
        {tab === 'group' && (
          <div className="px-4 pt-3">
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-400"/>
            {selected.length > 0 && (
              <p className="text-xs text-purple-600 font-medium mt-2">
                {selected.length} member{selected.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl
                         text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"/>
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {users.map(u => {
            const isSelected = selected.includes(u._id);
            return (
              <button key={u._id}
                onClick={() => {
                  if (tab === 'direct') {
                    directMutation.mutate(u._id);
                  } else {
                    toggleSelect(u._id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                             hover:bg-gray-50 transition-colors text-left mb-1
                             ${isSelected && tab === 'group' ? 'bg-purple-50 border border-purple-200' : ''}`}>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                  text-sm font-bold shrink-0
                                  ${ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600'}`}>
                  {u.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{u.role} · {u.email}</p>
                </div>

                {tab === 'group' && isSelected && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
            );
          })}

          {users.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No users found</p>
          )}
        </div>

        {/* Group create button */}
        {tab === 'group' && (
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={handleCreateGroup}
              disabled={groupMutation.isPending}
              className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium
                         hover:bg-purple-700 transition-colors disabled:opacity-60">
              {groupMutation.isPending ? 'Creating...' : `Create Group (${selected.length} members)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}