import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Email, User, Attachment } from '../types';
import { generateSmartReplies } from '../services/geminiService';
import TrashIcon from './icons/TrashIcon';
import SpamIcon from './icons/SpamIcon';
import ReplyAllIcon from './icons/ReplyAllIcon';
import StarIcon from './icons/StarIcon';

interface EmailViewProps {
  email: Email | undefined;
  currentUser: User | null;
  onBack: () => void;
  onReply: (email: Email, body?: string) => void;
  onReplyAll: (email: Email) => void;
  onDelete: (id: string) => void;
  onMarkAsSpam: (id: string) => void;
  onToggleRead: (id: string) => void;
  onToggleStarred: (id: string) => void;
  onSendReply: (data: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => void;
}

const SmartReplyPill: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button onClick={onClick} className="px-4 py-2 bg-light-gray dark:bg-gray-700 rounded-full text-sm text-dark-gray dark:text-gray-200 hover:bg-medium-gray dark:hover:bg-gray-600 transition-colors">
    {text}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; label: string; children: React.ReactNode; isActive?: boolean }> = ({ onClick, label, children, isActive }) => (
  <button onClick={onClick} aria-label={label} title={label} className={`p-2 rounded-full text-dark-gray dark:text-gray-300 hover:bg-medium-gray dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-bharat-blue ${isActive ? 'text-yellow-500' : ''}`}>
    {children}
  </button>
);

const InlineReply: React.FC<{
  email: Email;
  currentUser: User;
  onSend: (data: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => void;
  onDiscard: () => void;
  initialBody?: string;
}> = ({ email, onSend, onDiscard, initialBody, currentUser }) => {
  const [body, setBody] = useState(initialBody || '');
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.innerHTML = initialBody || '';
        editorRef.current.focus();
    }
  }, [initialBody]);

  const handleSend = () => {
    if (body.trim()) {
      onSend({
        to: email.from.email,
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body,
        attachments: [],
      });
    }
  };

  const applyFormat = (command: string, value: string | null = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      setBody(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="p-4 border-t border-medium-gray dark:border-gray-700 bg-light-gray/50 dark:bg-gray-900/50">
        <div className="border border-medium-gray dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setBody(e.currentTarget.innerHTML)}
                className="p-3 min-h-[100px] outline-none"
            />
            <div className="p-2 border-t border-medium-gray dark:border-gray-700 flex justify-between items-center">
                 <div className="flex items-center gap-1">
                    <button title="Bold" onMouseDown={e => { e.preventDefault(); applyFormat('bold')}} className="w-8 h-8 rounded hover:bg-medium-gray dark:hover:bg-gray-600 flex items-center justify-center text-dark-gray dark:text-gray-300"><b>B</b></button>
                    <button title="Italic" onMouseDown={e => { e.preventDefault(); applyFormat('italic')}} className="w-8 h-8 rounded hover:bg-medium-gray dark:hover:bg-gray-600 flex items-center justify-center text-dark-gray dark:text-gray-300"><i>I</i></button>
                    <button title="Underline" onMouseDown={e => { e.preventDefault(); applyFormat('underline')}} className="w-8 h-8 rounded hover:bg-medium-gray dark:hover:bg-gray-600 flex items-center justify-center text-dark-gray dark:text-gray-300"><u>U</u></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onDiscard} className="text-sm font-semibold text-dark-gray dark:text-gray-300 px-4 py-2 rounded-full hover:bg-medium-gray dark:hover:bg-gray-700">Discard</button>
                    <button onClick={handleSend} className="bg-bharat-blue text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors">Send</button>
                </div>
            </div>
        </div>
    </div>
  );
};


const EmailView: React.FC<EmailViewProps> = ({ email, currentUser, onBack, onReply, onReplyAll, onDelete, onMarkAsSpam, onToggleRead, onToggleStarred, onSendReply }) => {
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const fetchSmartReplies = useCallback(async (body: string) => {
    setIsLoadingReplies(true);
    setSmartReplies([]);
    const replies = await generateSmartReplies(body);
    setSmartReplies(replies);
    setIsLoadingReplies(false);
  }, []);

  useEffect(() => {
    if (email && email.folder === 'inbox') {
      fetchSmartReplies(email.body.replace(/<[^>]+>/g, ' '));
    } else {
      setSmartReplies([]);
    }
    setIsReplying(false); // Close inline reply when email changes
  }, [email, fetchSmartReplies]);

  if (!email || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 text-dark-gray dark:text-gray-400 p-8">
        <svg className="w-24 h-24 text-medium-gray dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        <h2 className="mt-4 text-xl font-semibold">Select an email to read</h2>
        <p className="mt-2 text-center">Nothing to see here yet. Choose an email from the list on the left to view its contents.</p>
      </div>
    );
  }

  const handleSmartReplyClick = (replyText: string) => {
      setReplyBody(replyText);
      setIsReplying(true);
  };
  
  const handleReplyClick = () => {
    const quotedBody = `<br><br><hr>On ${new Date(email.date).toLocaleString()}, ${email.from.name} wrote:<blockquote>${email.body}</blockquote>`;
    setReplyBody(quotedBody);
    setIsReplying(true);
  }

  const handleSendInlineReply = (data: { to: string; subject: string; body: string; attachments: Attachment[] }) => {
    onSendReply(data);
    setIsReplying(false);
  };


  const hasMultipleRecipients = email.to.length + (email.cc?.length || 0) > 1;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-medium-gray dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
           <button onClick={onBack} className="md:hidden flex items-center text-sm text-bharat-blue font-semibold">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Back
          </button>
          <div className="flex items-center gap-2">
            <ActionButton onClick={handleReplyClick} label="Reply">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </ActionButton>
            {hasMultipleRecipients && (
               <ActionButton onClick={() => onReplyAll(email)} label="Reply All">
                  <ReplyAllIcon className="w-5 h-5" />
               </ActionButton>
            )}
            <ActionButton onClick={() => onToggleRead(email.id)} label={email.read ? "Mark as unread" : "Mark as read"}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </ActionButton>
             <ActionButton onClick={() => onMarkAsSpam(email.id)} label="Mark as spam">
                <SpamIcon className="w-5 h-5" />
            </ActionButton>
             <ActionButton onClick={() => onDelete(email.id)} label="Delete">
                <TrashIcon className="w-5 h-5" />
            </ActionButton>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-bold text-navy dark:text-white">{email.subject}</h1>
            <ActionButton 
                onClick={() => onToggleStarred(email.id)} 
                label={email.starred ? "Unstar email" : "Star email"}
                isActive={email.starred}
            >
                <StarIcon className="w-6 h-6" fill={email.starred ? 'currentColor' : 'none'} />
            </ActionButton>
        </div>
        <div className="flex items-center mt-4">
          <img src={email.from.avatarUrl} alt={email.from.name} className="h-10 w-10 rounded-full" />
          <div className="ml-3">
            <div className="flex items-baseline gap-2">
              <p className="font-semibold text-dark-gray dark:text-gray-300">{email.from.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">&lt;{email.from.email}&gt;</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">to {email.to.map(u => u.name).join(', ')}</p>
             {email.cc && email.cc.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">cc {email.cc.map(u => u.name).join(', ')}</p>
            )}
          </div>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{new Date(email.date).toLocaleString()}</span>
        </div>
      </div>
      <div
        className="prose prose-lg dark:prose-invert p-6 flex-1 text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
      {email.attachments && email.attachments.length > 0 && (
          <div className="p-6 border-t border-medium-gray dark:border-gray-700">
              <h3 className="text-md font-semibold text-dark-gray dark:text-gray-300 mb-3">Attachments ({email.attachments.length})</h3>
              <ul className="flex flex-wrap gap-3">
                  {email.attachments.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 bg-light-gray dark:bg-gray-700 rounded-lg p-2 border border-medium-gray dark:border-gray-600">
                           <svg className="w-6 h-6 text-dark-gray dark:text-gray-300 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <div>
                              <span className="font-medium text-sm text-navy dark:text-light-gray truncate">{file.fileName}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{file.fileSize}</span>
                          </div>
                          <a href="#" onClick={(e) => e.preventDefault()} className="ml-2 p-1 rounded-full hover:bg-medium-gray dark:hover:bg-gray-600" title="Download">
                              <svg className="w-5 h-5 text-dark-gray dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}
      {!isReplying && email.folder === 'inbox' && (
      <div className="p-4 border-t border-medium-gray dark:border-gray-700 mt-auto flex-shrink-0">
        <h3 className="text-sm font-semibold text-dark-gray dark:text-gray-300 mb-3">Smart Reply</h3>
        <div className="flex flex-wrap gap-2">
            {isLoadingReplies && <div className="text-sm text-gray-500 dark:text-gray-400">Generating replies...</div>}
            {!isLoadingReplies && smartReplies.map((reply, index) => <SmartReplyPill key={index} text={reply} onClick={() => handleSmartReplyClick(reply)} />)}
            {!isLoadingReplies && smartReplies.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No suggestions available.</div>}
        </div>
      </div>
      )}
       {isReplying && (
        <InlineReply 
          email={email} 
          currentUser={currentUser}
          onSend={handleSendInlineReply} 
          onDiscard={() => setIsReplying(false)}
          initialBody={replyBody}
        />
      )}
    </div>
  );
};

export default EmailView;