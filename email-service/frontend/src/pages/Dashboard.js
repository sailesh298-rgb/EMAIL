import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEmail } from '../contexts/EmailContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Search, 
  Settings, 
  LogOut,
  User,
  HardDrive
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { emails, stats, currentFolder, setCurrentFolder, sendEmail, loading } = useEmail();
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    subject: '',
    body: ''
  });

  const folders = [
    { key: 'inbox', label: 'Inbox', icon: Inbox, count: stats.inbox, color: 'blue' },
    { key: 'sent', label: 'Sent', icon: Send, count: stats.sent, color: 'green' },
    { key: 'drafts', label: 'Drafts', icon: FileText, count: stats.drafts, color: 'orange' },
    { key: 'trash', label: 'Trash', icon: Trash2, count: stats.trash, color: 'red' },
    { key: 'spam', label: 'Spam', icon: AlertCircle, count: stats.spam, color: 'yellow' },
  ];

  const currentEmails = emails[currentFolder] || [];
  const filteredEmails = currentEmails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompose = async (e) => {
    e.preventDefault();
    
    if (!composeData.to.trim() || !composeData.subject.trim()) {
      toast.error('Please fill in recipient and subject');
      return;
    }

    const emailData = {
      to: composeData.to.split(',').map(email => email.trim()),
      cc: composeData.cc ? composeData.cc.split(',').map(email => email.trim()) : [],
      subject: composeData.subject,
      body: composeData.body
    };

    const result = await sendEmail(emailData);
    
    if (result.success) {
      toast.success('Email sent successfully!');
      setShowCompose(false);
      setComposeData({ to: '', cc: '', subject: '', body: '' });
    } else {
      toast.error(result.error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStoragePercentage = () => {
    return Math.round((stats.storage_used / stats.storage_quota) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Email Service</span>
          </div>
          
          <Button 
            onClick={() => setShowCompose(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.key}
                  onClick={() => setCurrentFolder(folder.key)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    currentFolder === folder.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Settings */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="truncate">{user?.email}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">{getStoragePercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${getStoragePercentage()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {stats.storage_used} MB / {stats.storage_quota} MB
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="flex-1"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Email List Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold capitalize">{currentFolder}</h2>
              {stats.unread > 0 && currentFolder === 'inbox' && (
                <Badge variant="destructive">{stats.unread} unread</Badge>
              )}
            </div>
            
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-auto">
          {filteredEmails.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => navigate(`/email/${email.id}`)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    !email.read && currentFolder === 'inbox' ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm truncate ${!email.read ? 'font-semibold' : 'font-medium'}`}>
                          {currentFolder === 'sent' ? `To: ${email.to.join(', ')}` : `From: ${email.from_email}`}
                        </p>
                        {!email.read && currentFolder === 'inbox' && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mb-1 ${!email.read ? 'font-medium' : ''}`}>{email.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{email.body}</p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {formatDate(email.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching emails' : `No emails in ${currentFolder}`}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : `Your ${currentFolder} folder is empty`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Compose Email</h3>
              <form onSubmit={handleCompose} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@example.com, another@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CC (optional)</label>
                  <Input
                    value={composeData.cc}
                    onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                    placeholder="cc@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;