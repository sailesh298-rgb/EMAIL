import React from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../contexts/EmailContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Mail, Users, Settings, Plus, LogOut, Inbox, Send, FileText, Trash2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { emailAccounts } = useEmail();
  const { logout } = useAuth();

  const getTotalEmails = (type) => {
    return emailAccounts.reduce((total, account) => {
      return total + (account.emails[type]?.length || 0);
    }, 0);
  };

  const getUnreadCount = () => {
    return emailAccounts.reduce((total, account) => {
      return total + (account.emails.inbox?.filter(email => !email.read)?.length || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Email Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/accounts")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Accounts
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Accounts</p>
                  <p className="text-3xl font-bold">{emailAccounts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Unread Emails</p>
                  <p className="text-3xl font-bold">{getUnreadCount()}</p>
                </div>
                <Inbox className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Sent</p>
                  <p className="text-3xl font-bold">{getTotalEmails('sent')}</p>
                </div>
                <Send className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Drafts</p>
                  <p className="text-3xl font-bold">{getTotalEmails('drafts')}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Accounts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {emailAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{account.username}</CardTitle>
                  <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                    {account.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{account.email}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Inbox</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{account.emails.inbox?.length || 0}</span>
                      {account.emails.inbox?.filter(e => !e.read).length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {account.emails.inbox.filter(e => !e.read).length} new
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Sent</span>
                    <span className="text-sm font-medium">{account.emails.sent?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Drafts</span>
                    <span className="text-sm font-medium">{account.emails.drafts?.length || 0}</span>
                  </div>

                  <Button
                    onClick={() => navigate(`/email/${account.id}`)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Open Mailbox
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Account Card */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
            <CardContent 
              className="h-full flex flex-col items-center justify-center p-8 text-center"
              onClick={() => navigate("/accounts")}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Add New Accounts</h3>
              <p className="text-sm text-gray-500 mb-4">Create bulk email accounts for your domain</p>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        {emailAccounts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Accounts Yet</h3>
            <p className="text-gray-500 mb-6">Create your first batch of email accounts to get started</p>
            <Button onClick={() => navigate("/accounts")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Accounts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;