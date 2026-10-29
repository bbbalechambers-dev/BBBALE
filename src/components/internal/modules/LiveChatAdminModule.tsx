import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { MessageSquare, Send, CheckCircle2, Phone, Mail, Clock, User, X } from 'lucide-react';
import { ChatSession } from '../../../types';

export const LiveChatAdminModule: React.FC = () => {
  const { chatSessions, chatMessages, sendChatMessage, closeChatSession, currentUser, canAccessBranchData } = useApp();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const branchSessions = chatSessions.filter(s => canAccessBranchData(s.branchId));
  const activeSession = branchSessions.find(s => s.id === selectedSessionId) || branchSessions[0];
  const messages = chatMessages.filter(m => m.sessionId === activeSession?.id);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSession) return;

    sendChatMessage(activeSession.id, replyText.trim(), 'Administrator');
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
          Public Live Chat Reception Desk
        </h2>
        <p className="text-xs text-[#5a5a5a]">
          Section 31: Administrator desk responding to real-time public website visitor inquiries and consultation requests.
        </p>
      </div>

      {branchSessions.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#e0ddd5] shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[500px] overflow-hidden">
          {/* Sessions List */}
          <div className="md:col-span-4 border-r border-[#e0ddd5] divide-y divide-gray-100 overflow-y-auto max-h-[550px]">
            <div className="p-3 bg-[#1a2a4a] text-white text-xs font-bold font-serif-heading">
              Active Visitor Threads ({branchSessions.length})
            </div>
            {branchSessions.map(session => (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`p-3 cursor-pointer transition-colors text-xs ${
                  (activeSession?.id === session.id) ? 'bg-[#f8f6f1] border-l-4 border-[#c9a227]' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#1a2a4a]">{session.visitorName}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    session.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 truncate mt-0.5">{session.topic}</div>
                <div className="text-[10px] text-gray-400 mt-1 font-mono">
                  {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Window */}
          {activeSession ? (
            <div className="md:col-span-8 flex flex-col justify-between bg-[#f8f6f1]">
              {/* Header */}
              <div className="p-3.5 bg-white border-b border-[#e0ddd5] flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#1a2a4a]">{activeSession.visitorName}</div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Email: {activeSession.visitorEmail} · Tel: {activeSession.visitorPhone || 'N/A'} · Topic: {activeSession.topic}
                  </div>
                </div>

                {activeSession.status === 'Active' && (
                  <button
                    onClick={() => closeChatSession(activeSession.id)}
                    className="px-2.5 py-1 text-xs text-gray-600 hover:text-black border rounded hover:bg-gray-100"
                  >
                    Close Session
                  </button>
                )}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map(msg => {
                  const isAdmin = msg.senderType === 'Administrator';
                  const isSystem = msg.senderType === 'System';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                          {msg.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-gray-400 px-1 mb-0.5">
                        {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[75%] p-3 rounded-lg text-xs leading-relaxed shadow-2xs ${
                          isAdmin
                            ? 'bg-[#1a2a4a] text-white rounded-br-none'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {activeSession.status === 'Active' ? (
                <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-[#e0ddd5] flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type official reply to visitor..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded text-xs font-bold font-serif-heading"
                  >
                    Send Reply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-gray-100 text-center text-xs text-gray-500 border-t">
                  This visitor chat session has been closed.
                </div>
              )}
            </div>
          ) : (
            <div className="md:col-span-8 flex items-center justify-center p-8 text-xs text-gray-400">
              Select a visitor conversation to review.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Live Chat Reception Inbox is Quiet</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            When website visitors open the floating live chat widget on the public site, incoming inquiries will appear here in real time.
          </p>
        </div>
      )}
    </div>
  );
};
