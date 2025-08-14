import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmail } from "../contexts/EmailContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ArrowLeft, Plus, Eye, EyeOff, Edit, Trash2, Users, Download } from "lucide-react";
import { toast } from "sonner";
import { mockData } from "../utils/mockData";

const AccountManagement = () => {
  const navigate = useNavigate();
  const { emailAccounts, createBulkAccounts, updateAccountPassword, deleteAccount } = useEmail();
  const { logout } = useAuth();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [domain, setDomain] = useState("yourdomain.com");
  const [usernames, setUsernames] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({});

  const handleCreateAccounts = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    const usernameList = usernames
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernameList.length === 0) {
      toast.error("Please enter at least one username");
      setIsCreating(false);
      return;
    }

    if (!domain.trim()) {
      toast.error("Please enter a domain");
      setIsCreating(false);
      return;
    }

    try {
      const newAccounts = createBulkAccounts(usernameList, domain.trim());
      toast.success(`Successfully created ${newAccounts.length} email accounts!`);
      setShowCreateForm(false);
      setUsernames("");
    } catch (error) {
      toast.error("Failed to create accounts");
    }

    setIsCreating(false);
  };

  const handlePasswordUpdate = (accountId) => {
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    updateAccountPassword(accountId, newPassword);
    toast.success("Password updated successfully!");
    setEditingPassword(null);
    setNewPassword("");
  };

  const handleDeleteAccount = (accountId, email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      deleteAccount(accountId);
      toast.success("Account deleted successfully!");
    }
  };

  const togglePasswordVisibility = (accountId) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const loadSampleUsernames = () => {
    setUsernames(mockData.sampleUsernames.join('\n'));
  };

  const exportAccounts = () => {
    const csvData = emailAccounts.map(acc => ({
      Email: acc.email,
      Username: acc.username,
      Password: acc.password,
      Status: acc.status,
      Created: new Date(acc.createdAt).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-accounts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Accounts exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Account Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {emailAccounts.length > 0 && (
              <Button variant="outline" onClick={exportAccounts}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Accounts
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bulk Email Accounts</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAccounts} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain</label>
                    <Input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="yourdomain.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Usernames (one per line)</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={loadSampleUsernames}
                      >
                        Load Sample Names
                      </Button>
                    </div>
                    <Textarea
                      value={usernames}
                      onChange={(e) => setUsernames(e.target.value)}
                      placeholder="john.doe&#10;jane.smith&#10;mike.wilson"
                      rows={8}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Enter one username per line. Sample includes Indian and foreign names.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isCreating ? "Creating..." : "Create Accounts"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        {emailAccounts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Email Accounts ({emailAccounts.length})</span>
                <Badge variant="secondary">{emailAccounts.filter(acc => acc.status === 'active').length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.email}</TableCell>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showPasswords[account.id] ? account.password : "••••••••"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => togglePasswordVisibility(account.id)}
                          >
                            {showPasswords[account.id] ? 
                              <EyeOff className="w-3 h-3" /> : 
                              <Eye className="w-3 h-3" />
                            }
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Account</label>
                                  <p className="text-sm text-gray-600">{account.email}</p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">New Password</label>
                                  <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setNewPassword("")}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handlePasswordUpdate(account.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Update Password
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteAccount(account.id, account.email)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Accounts</h3>
            <p className="text-gray-500 mb-6">Create your first batch of email accounts to get started</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Accounts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagement;