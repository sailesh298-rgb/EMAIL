import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmail } from "../contexts/EmailContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ArrowLeft, Mail, Inbox, Send, FileText, Trash2, Plus, Search, Refresh, Star } from "lucide-react";
import { toast } from "sonner";

const EmailView = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { emailAccounts, selectedAccount, currentFolder, setSelectedAccount, setCurrentFolder, sendEmail } = useEmail();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: ""
  });

  useEffect(() => {
    const account = emailAccounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
    } else {
      navigate("/");
    }
  }, [accountId, emailAccounts, setSelectedAccount, navigate]);

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const folders = [
    { key: "inbox", label: "Inbox", icon: Inbox, count: selectedAccount.emails.inbox?.length || 0 },
    { key: "sent", label: "Sent", icon: Send, count: selectedAccount.emails.sent?.length || 0 },
    { key: "drafts", label: "Drafts", icon: FileText, count: selectedAccount.emails.drafts?.length || 0 },
    { key: "trash", label: "Trash", icon: Trash2, count: selectedAccount.emails.trash?.length || 0 },
  ];

  const currentEmails = selectedAccount.emails[currentFolder] || [];
  const filteredEmails = currentEmails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompose = (e) => {
    e.preventDefault();
    
    if (!composeData.to.trim() || !composeData.subject.trim()) {
      toast.error("Please fill in recipient and subject");
      return;
    }

    sendEmail(selectedAccount.id, composeData);
    toast.success("Email sent successfully!");
    setShowCompose(false);
    setComposeData({ to: "", subject: "", body: "" });
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-3 p-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{selectedAccount.username}</p>
              <p className="text-xs text-gray-500">{selectedAccount.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Dialog open={showCompose} onOpenChange={setShowCompose}>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCompose} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input value={selectedAccount.email} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@example.com"
                    required
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
            </DialogContent>
          </Dialog>
        </div>

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
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
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
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Email List Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold capitalize">{currentFolder}</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Refresh className="w-4 h-4" />
              </Button>
            </div>
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
                  onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                  className={`p-4 cursor-pointer transition-colors ${
                    !email.read ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                  } ${selectedEmail?.id === email.id ? "bg-blue-100" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm truncate ${!email.read ? "font-semibold" : "font-medium"}`}>
                          {currentFolder === "sent" ? `To: ${email.to}` : `From: ${email.from}`}
                        </p>
                        {!email.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      </div>
                      <p className={`text-sm mb-1 ${!email.read ? "font-medium" : ""}`}>{email.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{email.body}</p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {formatDate(email.timestamp)}
                    </div>
                  </div>

                  {selectedEmail?.id === email.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm mb-4">
                          <div><strong>From:</strong> {email.from}</div>
                          <div><strong>To:</strong> {email.to}</div>
                          <div><strong>Subject:</strong> {email.subject}</div>
                          <div><strong>Date:</strong> {new Date(email.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{email.body}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No matching emails" : `No emails in ${currentFolder}`}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : `Your ${currentFolder} folder is empty`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailView;