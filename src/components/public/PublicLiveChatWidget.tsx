import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Paperclip, PhoneCall, ChevronDown, Check, User, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { UploadedFileMetadata } from '../../types';

export const PublicLiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Intake Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('');
  const [topic, setTopic] = useState('Legal Consultation Inquiry');

  // Active Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<UploadedFileMetadata | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const { branches, chatSessions, chatMessages, startChatSession, sendChatMessage, closeChatSession } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set default branch if available
  useEffect(() => {
    if (branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (sessionStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, sessionStarted]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newSession = startChatSession({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      topic,
      branchId: branchId || (branches[0]?.id || 'BBB-LAG')
    });

    setActiveSessionId(newSession.id);
    setSessionStarted(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !pendingAttachment) || !activeSessionId) return;

    sendChatMessage(
      activeSessionId,
      inputMessage.trim() || 'Uploaded an attachment',
      'Visitor',
      pendingAttachment || undefined
    );

    setInputMessage('');
    setPendingAttachment(null);
    setShowFilePicker(false);
  };

  const currentMessages = chatMessages.filter(m => m.sessionId === activeSessionId);
  const selectedBranch = branches.find(b => b.id === branchId) || branches[0];
  const branchWhatsApp = selectedBranch?.whatsapp || '+2348030000000';
  const cleanNumber = branchWhatsApp.replace(/[^0-9]/g, '');
  const whatsAppText = encodeURIComponent(`Hello B. B. BALE & CO Chambers, I am visiting your website and would like immediate assistance regarding ${topic}. My name is ${name || 'Prospective Client'}.`);
  const whatsAppUrl = `https://wa.me/${cleanNumber}?text=${whatsAppText}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Help Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#1a2a4a] text-white rounded-full shadow-2xl hover:bg-[#111e38] border-2 border-[#c9a227] transition-all transform hover:scale-105 cursor-pointer"
          aria-label="Open Live Chat Help with Chambers Administrator"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-[#c9a227]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a2a4a]"></span>
          </div>
          <span className="text-xs font-bold font-serif-heading tracking-wide">
            Chambers Live Help
          </span>
        </button>
      )}

      {/* Live Chat Panel (380x550 desktop, full screen mobile) */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[550px] max-h-[88vh] bg-white rounded-xl shadow-2xl border border-[#e0ddd5] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3">
          {/* Header */}
          <div className="bg-[#1a2a4a] text-white p-3.5 flex items-center justify-between border-b-2 border-[#c9a227]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#c9a227] text-[#1a2a4a] flex items-center justify-center font-bold text-xs">
                BB
              </div>
              <div>
                <div className="text-xs font-bold font-serif-heading">Administrator Desk</div>
                <div className="text-[10px] text-[#c9a227] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Active Reception · B. B. BALE & CO
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors inline-block"
                title="Continue on WhatsApp"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Intake Form OR Live Chat Messages */}
          {!sessionStarted ? (
            <div className="flex-1 p-4 overflow-y-auto bg-[#f8f6f1]">
              <div className="text-center mb-4">
                <Shield className="w-8 h-8 text-[#c9a227] mx-auto mb-1" />
                <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">Welcome to Chambers Desk</h3>
                <p className="text-[11px] text-[#5a5a5a] mt-0.5">
                  Connect instantly with our Branch Administrator for legal service inquiries, fee estimates, and consultation booking.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1c1c] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1c1c] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1c1c] mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1c1c] mb-1">Select Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  >
                    {branches.length > 0 ? (
                      branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code}) - {b.state}
                        </option>
                      ))
                    ) : (
                      <option value="BBB-LAG">Head Office Chambers (Lagos / Abuja)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1c1c1c] mb-1">Inquiry Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="Legal Consultation Inquiry">Legal Consultation Inquiry</option>
                    <option value="Tenancy & Property Management">Tenancy & Property Management</option>
                    <option value="Corporate & Commercial Brief">Corporate & Commercial Brief</option>
                    <option value="Litigation & Court Diary">Litigation & Court Diary</option>
                    <option value="General Legal Assistance">General Legal Assistance</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] text-xs font-bold rounded shadow-sm transition-all cursor-pointer font-serif-heading"
                >
                  Start Live Chat with Administrator
                </button>

                {/* WhatsApp Fallback Link */}
                <div className="pt-2 text-center">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Prefer WhatsApp? Chat directly</span>
                  </a>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-[#f8f6f1] overflow-hidden">
              {/* Message stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                {currentMessages.map((msg) => {
                  const isVisitor = msg.senderType === 'Visitor';
                  const isSystem = msg.senderType === 'System';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <div className="inline-block bg-amber-50 border border-amber-200 text-amber-900 text-[10px] p-2 rounded-lg max-w-[90%] text-left">
                          {msg.message}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                        {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg p-2.5 text-xs leading-relaxed shadow-2xs ${
                          isVisitor
                            ? 'bg-[#1a2a4a] text-white rounded-br-none'
                            : 'bg-white text-[#1c1c1c] border border-[#e0ddd5] rounded-bl-none'
                        }`}
                      >
                        {msg.message}
                        {msg.attachmentUrl && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <a
                              href={msg.attachmentUrl}
                              download={msg.attachmentName || 'attachment'}
                              className="inline-flex items-center gap-1 text-[11px] underline text-[#c9a227]"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{msg.attachmentName || 'View Attachment'}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Pending File Attachment Preview */}
              {pendingAttachment && (
                <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[250px] font-medium text-amber-900">
                    📎 {pendingAttachment.originalName}
                  </span>
                  <button
                    onClick={() => setPendingAttachment(null)}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Local File Picker Drawer */}
              {showFilePicker && (
                <div className="p-3 bg-white border-t border-gray-200">
                  <LocalFilePicker
                    label="Choose File from Device"
                    maxSizeMb={10}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    compact
                    onUploadComplete={(files) => {
                      if (files.length > 0) {
                        setPendingAttachment(files[0]);
                        setShowFilePicker(false);
                      }
                    }}
                  />
                </div>
              )}

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-[#e0ddd5] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilePicker(!showFilePicker)}
                  className="p-2 text-gray-500 hover:text-[#1a2a4a] hover:bg-gray-100 rounded transition-colors"
                  title="Attach file from device"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 text-xs p-2 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() && !pendingAttachment}
                  className="p-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
