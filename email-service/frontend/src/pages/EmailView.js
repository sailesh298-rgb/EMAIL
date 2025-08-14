import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  Archive, 
  Star,
  MoreVertical,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const EmailView = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEmail, moveEmail, deleteEmail } = useEmail();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullHeaders, setShowFullHeaders] = useState(false);

  useEffect(() => {
    fetchEmail();
  }, [emailId]);

  const fetchEmail = async () => {
    setLoading(true);
    const result = await getEmail(emailId);
    
    if (result.success) {
      setEmail(result.data);
    } else {
      toast.error('Failed to load email');
      navigate('/');
    }
    setLoading(false);
  };

  const handleMoveToTrash = async () => {
    const result = await moveEmail(emailId, 'trash');
    if (result.success) {
      toast.success('Email moved to trash');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this email?')) {
      const result = await deleteEmail(emailId);
      if (result.success) {
        toast.success('Email deleted permanently');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (email) => {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Email not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {email.subject}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" size="sm">
              <ReplyAll className="w-4 h-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMoveToTrash}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(email.from_email)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{email.from_email}</h3>
                    <span className="text-sm text-gray-500">
                      to {email.to.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(email.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm">
                <Star className="w-4 h-4" />
              </Button>
            </div>

            {/* Headers Toggle */}
            <div className="mt-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFullHeaders(!showFullHeaders)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showFullHeaders ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>

            {/* Full Headers */}
            {showFullHeaders && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                <div><strong>From:</strong> {email.from_email}</div>
                <div><strong>To:</strong> {email.to.join(', ')}</div>
                {email.cc.length > 0 && (
                  <div><strong>CC:</strong> {email.cc.join(', ')}</div>
                )}
                <div><strong>Subject:</strong> {email.subject}</div>
                <div><strong>Date:</strong> {formatDate(email.timestamp)}</div>
                <div><strong>Message-ID:</strong> {email.id}</div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {email.body}
              </div>
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Attachments ({email.attachments.length})
                </h4>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {attachment.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{attachment}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline">
            <ReplyAll className="w-4 h-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailView;