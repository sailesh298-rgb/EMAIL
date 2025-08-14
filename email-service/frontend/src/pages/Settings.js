import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEmail } from '../contexts/EmailContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  HardDrive, 
  Bell, 
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { changePassword, stats } = useEmail();
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    const result = await changePassword(passwordData.current, passwordData.new);
    
    if (result.success) {
      toast.success('Password changed successfully');
      setPasswordData({ current: '', new: '', confirm: '' });
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const getStoragePercentage = () => {
    return Math.round((stats.storage_used / stats.storage_quota) * 100);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input value={user?.email || ''} disabled className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <Input value={user?.display_name || ''} disabled className="mt-1" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Account Created</label>
              <Input 
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'} 
                disabled 
                className="mt-1" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Storage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Used Storage</span>
              <span className="font-medium">{stats.storage_used} MB / {stats.storage_quota} MB</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  getStoragePercentage() > 90 ? 'bg-red-500' :
                  getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-blue-600'
                }`}
                style={{ width: `${getStoragePercentage()}%` }}
              ></div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              {getStoragePercentage()}% used
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Inbox:</span>
                <span className="font-medium">{stats.inbox} emails</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sent:</span>
                <span className="font-medium">{stats.sent} emails</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drafts:</span>
                <span className="font-medium">{stats.drafts} emails</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trash:</span>
                <span className="font-medium">{stats.trash} emails</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Last Login</h4>
                <p className="text-sm text-gray-600">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-4">
              <Button 
                onClick={logout}
                variant="destructive"
                className="w-full"
              >
                Sign Out of Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;