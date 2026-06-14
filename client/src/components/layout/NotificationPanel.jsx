import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation }    from '@tanstack/react-query';
import { X, Bell, CheckCheck }      from 'lucide-react';
import { toggleNotifPanel, setUnreadNotif } from '../../store/slices/uiSlice.js';
import { userApi } from '../../api/index.js';

const TYPE_STYLES = {
  info:    'bg-blue-50   border-blue-200   text-blue-700',
  success: 'bg-green-50  border-green-200  text-green-700',
  warning: 'bg-amber-50  border-amber-200  text-amber-700',
  error:   'bg-red-50    border-red-200    text-red-700',
};

export default function NotificationPanel() {
  const dispatch  = useDispatch();
  const open      = useSelector(s => s.ui.notifPanelOpen);

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => userApi.getNotifications().then(r => r.data.data),
    enabled:  open,
  });

  const markRead = useMutation({
    mutationFn: (id) => userApi.markNotifRead(id),
    onSuccess:  () => {
      refetch();
      dispatch(setUnreadNotif(0));
    },
  });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => dispatch(toggleNotifPanel())}
      />

      {/* Panel */}
      <div className="fixed top-16 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl
                      border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-purple-600" />
            <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
          </div>
          <button
            onClick={() => dispatch(toggleNotifPanel())}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
          {!data?.length ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            data.map(notif => (
              <div
                key={notif._id}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                            ${!notif.isRead ? 'bg-purple-50/40' : ''}`}
                onClick={() => markRead.mutate(notif._id)}
              >
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full border
                                 inline-block mb-1 ${TYPE_STYLES[notif.type] || TYPE_STYLES.info}`}>
                  {notif.type}
                </div>
                <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {data?.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 flex justify-end">
            <button
              className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
              onClick={() => data.forEach(n => !n.isRead && markRead.mutate(n._id))}
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          </div>
        )}
      </div>
    </>
  );
}