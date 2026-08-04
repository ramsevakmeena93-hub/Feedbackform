import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Bell, UserPlus, FileText, Shield, PenTool, CheckCircle, 
  Trash2, Settings, AlertTriangle
} from 'lucide-react';

const NotificationsSection = ({ token, user, isDark }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Mock data to simulate API responses for notifications
        const mockNotifs = [
          { id: '1', type: 'user', title: 'New Faculty Joined', desc: 'Dr. Alan Turing has registered in CSE Dept.', time: new Date(Date.now() - 3600000).toISOString(), read: false },
          { id: '2', type: 'feedback', title: 'New Feedback Submitted', desc: '50 new student feedbacks submitted for B.Tech Sem 3.', time: new Date(Date.now() - 7200000).toISOString(), read: false },
          { id: '3', type: 'system', title: 'High Memory Usage', desc: 'Server memory exceeded 85%. Automated cleanup initiated.', time: new Date(Date.now() - 86400000).toISOString(), read: true },
          { id: '4', type: 'approval', title: 'Pending Approvals', desc: 'You have 15 feedback reports waiting for approval.', time: new Date(Date.now() - 172800000).toISOString(), read: true },
          { id: '5', type: 'signature', title: 'Signature Pending', desc: '12 faculty members have not uploaded their signatures yet.', time: new Date(Date.now() - 259200000).toISOString(), read: true },
        ];
        
        // Add more mock items
        for(let i = 6; i <= 15; i++) {
          mockNotifs.push({
            id: i.toString(),
            type: ['user', 'feedback', 'system', 'approval', 'signature'][i % 5],
            title: `System Alert ${i}`,
            desc: `This is an auto-generated notification for testing purposes #${i}`,
            time: new Date(Date.now() - i * 40000000).toISOString(),
            read: i % 2 !== 0
          });
        }
        
        setNotifications(mockNotifs);
      } catch (error) {
        toast.error('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [token]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getIconAndColors = (type) => {
    switch (type) {
      case 'system': return { icon: AlertTriangle, color: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' };
      case 'user': return { icon: UserPlus, color: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' };
      case 'feedback': return { icon: FileText, color: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'approval': return { icon: CheckCircle, color: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' };
      case 'signature': return { icon: PenTool, color: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' };
      default: return { icon: Bell, color: 'slate', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'system', label: 'System' },
    { id: 'user', label: 'User Activity' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'approval', label: 'Approvals' }
  ];

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs py-1 px-2.5 rounded-full font-semibold">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Stay updated with system activities and alerts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg transition-colors">
            <CheckCircle className="w-4 h-4" /> Mark All Read
          </button>
          <button onClick={clearAll} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : filteredNotifs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">No notifications</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">You're all caught up! Check back later.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const { icon: Icon, bg, text } = getIconAndColors(notif.type);
              
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-sm font-semibold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs whitespace-nowrap text-slate-400 font-medium">
                        {timeAgo(notif.time)}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.read ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                      {notif.desc}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between shrink-0 pl-2">
                    {!notif.read ? (
                      <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full mb-2"></div>
                    ) : (
                      <div className="w-2.5 h-2.5"></div> // Spacer
                    )}
                    
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mt-auto opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;
