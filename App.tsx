import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Email, Folder, User, Attachment, Toast } from './types';
import { 
  getEmails, 
  saveEmails, 
  getSessionUser, 
  saveSessionUser, 
  clearSessionUser,
  findUserByEmail,
  createUser,
  getUsers,
  sendAndDeliverEmail,
} from './services/emailService';
import { getWelcomeEmail } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailView from './components/EmailView';
import ComposeModal from './components/ComposeModal';
import Onboarding from './components/Onboarding';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [composeInitialData, setComposeInitialData] = useState<Partial<Email> | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setTheme] = useState<Theme>('light');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check for logged-in user and all users on initial mount
  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      setCurrentUser(user);
    }
    setAllUsers(getUsers());
    setIsAppLoading(false);
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Fetch emails when user changes (i.e., on login)
  useEffect(() => {
    const fetchEmails = async () => {
      if (!currentUser) {
        // We no longer clear emails from state on logout to give a sense of persistence.
        // The data will be replaced when a new user logs in.
        return;
      };

      setIsLoading(true);
      const fetchedEmails = await getEmails(currentUser);
      setEmails(fetchedEmails);
      
      const firstInboxEmail = fetchedEmails.find(e => e.folder === 'inbox' && !e.read);
      if (firstInboxEmail) {
        setSelectedEmailId(firstInboxEmail.id);
      } else {
        const anyInboxEmail = fetchedEmails.find(e => e.folder === 'inbox');
        if(anyInboxEmail) setSelectedEmailId(anyInboxEmail.id);
      }
      setIsLoading(false);
    };
    fetchEmails();
  }, [currentUser]);

  // Persist emails to localStorage whenever they change
  useEffect(() => {
    if(!isLoading && currentUser) {
      saveEmails(emails, currentUser);
    }
  }, [emails, isLoading, currentUser]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredEmails = useMemo(() => {
    const folderEmails = currentFolder === 'starred'
      ? emails.filter(email => email.starred)
      : emails.filter(email => email.folder === currentFolder);

    return folderEmails
      .filter(email => {
        if (!searchQuery.trim()) {
            return true;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            email.subject.toLowerCase().includes(lowerCaseQuery) ||
            email.from.name.toLowerCase().includes(lowerCaseQuery)
        );
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [emails, currentFolder, searchQuery]);

  useEffect(() => {
    if (selectedEmailId && !filteredEmails.some(e => e.id === selectedEmailId)) {
        const nextEmail = filteredEmails[0];
        setSelectedEmailId(nextEmail ? nextEmail.id : null);
    }
  }, [filteredEmails, selectedEmailId]);


  const handleSelectEmail = useCallback((id: string) => {
    const emailToSelect = emails.find(e => e.id === id);
    if (emailToSelect?.folder === 'drafts') {
      setSelectedEmailId(null);
      setComposeInitialData(emailToSelect);
      setIsComposing(true);
    } else {
      setSelectedEmailId(id);
      setEmails(prevEmails => prevEmails.map(e => e.id === id ? { ...e, read: true } : e));
    }
  }, [emails]);

  const handleFolderChange = useCallback((folder: Folder) => {
    setCurrentFolder(folder);
    setSearchQuery('');
    setSelectedEmailId(null);
    const firstEmailInFolder = emails.find(e => folder === 'starred' ? e.starred : e.folder === folder);
    if(firstEmailInFolder) {
        handleSelectEmail(firstEmailInFolder.id);
    }
  }, [emails, handleSelectEmail]);
  
  const handleCompose = () => {
    setSelectedEmailId(null);
    setComposeInitialData(null);
    setIsComposing(true);
  };
  
  const handleCloseCompose = () => {
    setIsComposing(false);
    setComposeInitialData(null);
  };

  const handleReply = (emailToReply: Email, replyBody?: string) => {
    const replySubject = emailToReply.subject.startsWith('Re:') 
      ? emailToReply.subject 
      : `Re: ${emailToReply.subject}`;
    
    // If it's a smart reply, use the body directly. Otherwise, quote the original.
    const bodyContent = replyBody 
      ? replyBody 
      : `<br><br><hr>On ${new Date(emailToReply.date).toLocaleString()}, ${emailToReply.from.name} wrote:<blockquote>${emailToReply.body}</blockquote>`;

    setComposeInitialData({
      to: [emailToReply.from],
      subject: replySubject,
      body: bodyContent,
    });
    setIsComposing(true);
  };

  const handleReplyAll = (emailToReply: Email) => {
    if (!currentUser) return;

    const replySubject = emailToReply.subject.startsWith('Re:')
      ? emailToReply.subject
      : `Re: ${emailToReply.subject}`;

    const quotedBody = `<br><br><hr>On ${new Date(emailToReply.date).toLocaleString()}, ${emailToReply.from.name} wrote:<blockquote>${emailToReply.body}</blockquote>`;

    const allRecipients = [...emailToReply.to, ...(emailToReply.cc || [])];
    const otherRecipients = allRecipients.filter(u => u.email !== currentUser.email);
    
    const toRecipients = [emailToReply.from];
    const ccRecipients = [...new Map(otherRecipients.map(item => [item['email'], item])).values()];


    setComposeInitialData({
      to: toRecipients,
      cc: ccRecipients,
      subject: replySubject,
      body: quotedBody,
    });
    setIsComposing(true);
  };

  const handleSendEmail = (emailData: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => {
    if (!currentUser) return;

    const toUsers: User[] = emailData.to.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email);
    const ccUsers: User[] = emailData.cc?.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email) || [];
    const bccUsers: User[] = emailData.bcc?.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email) || [];

    if (toUsers.length === 0) {
        alert('Please provide a valid recipient email.');
        return;
    }

    const sentEmail = sendAndDeliverEmail(
      currentUser,
      { to: toUsers, cc: ccUsers, bcc: bccUsers, subject: emailData.subject, body: emailData.body, attachments: emailData.attachments },
      emailData.id
    );
    
    if (sentEmail) {
      // Re-fetch emails for the current user to ensure state is perfectly in sync with localStorage
      getEmails(currentUser).then(updatedEmails => {
        setEmails(updatedEmails);
        
        // Final UI updates
        setIsComposing(false);
        setComposeInitialData(null);
        setCurrentFolder('sent');
        setSelectedEmailId(sentEmail.id);
        addToast("Email sent successfully!");
      });
    } else {
      addToast("Error: Could not send email.");
    }
  };


  const handleSaveDraft = (draftData: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => {
    if (!currentUser) return;
    const { id, to, cc, bcc, subject, body, attachments } = draftData;
    const toUsers: User[] = to.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email);
    const ccUsers: User[] = cc?.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email) || [];
    const bccUsers: User[] = bcc?.split(',').map(email => ({ name: email.trim().split('@')[0], email: email.trim() })).filter(u => u.email) || [];
    const hasContent = to || cc || bcc || subject || body.replace(/<[^>]+>/g, '').trim() || attachments.length > 0;
    
    if (!hasContent) {
      if (id) setEmails(prev => prev.filter(e => e.id !== id));
      handleCloseCompose();
      return;
    }

    if (id) {
      setEmails(prevEmails => prevEmails.map(e => 
        e.id === id 
        ? { ...e, to: toUsers, cc: ccUsers, bcc: bccUsers, subject, body, attachments, date: new Date().toISOString() } 
        : e
      ));
    } else {
      const newDraft: Email = {
        id: `draft-${Date.now()}`,
        from: currentUser,
        to: toUsers,
        cc: ccUsers,
        bcc: bccUsers,
        subject: subject || '(no subject)',
        body,
        attachments,
        date: new Date().toISOString(),
        read: true,
        folder: 'drafts'
      };
      setEmails(prevEmails => [newDraft, ...prevEmails]);
    }
    
    handleCloseCompose();
    addToast("Draft saved.");
  };

  const moveEmailToFolder = (id: string, folder: Folder) => {
    setEmails(emails.map(e => e.id === id ? { ...e, folder } : e));
    setSelectedEmailId(null);
  };
  
  const handleDeleteEmail = (id: string) => {
      const emailToDelete = emails.find(e => e.id === id);
      if (!emailToDelete) return;

      if(emailToDelete.folder === 'trash') {
        setEmails(emails.filter(e => e.id !== id));
        addToast("Email permanently deleted.");
      } else {
        moveEmailToFolder(id, 'trash');
        addToast("Email moved to Trash.");
      }
  };

  const handleMarkAsSpam = (id: string) => {
    moveEmailToFolder(id, 'spam');
    addToast("Email marked as spam.");
  };

  const handleToggleReadStatus = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, read: !e.read } : e));
  };

  const handleToggleStarred = (id: string) => {
    let isStarred = false;
    setEmails(emails.map(e => {
      if (e.id === id) {
        isStarred = !e.starred;
        return { ...e, starred: !e.starred };
      }
      return e;
    }));
    addToast(isStarred ? "Email starred." : "Email unstarred.");
  };

  const handleSignUp = (user: User) => {
    const result = createUser(user);
    if (result.success && result.user) {
      setAllUsers(getUsers()); // Refresh the list of all users
      const persistedUser = result.user;
      const welcomeEmail = getWelcomeEmail(persistedUser);
      setCurrentUser(persistedUser);
      saveSessionUser(persistedUser);
      // Important: Create the initial email file for the new user
      saveEmails([welcomeEmail], persistedUser);
      setCurrentFolder('inbox');
      setSelectedEmailId(welcomeEmail.id);
      setLoginError(null);
    } else {
      setLoginError(result.message || 'An error occurred during sign up.');
    }
  };

  const handleLogin = (email: string) => {
    const user = findUserByEmail(email);
    if (user) {
      setCurrentUser(user);
      saveSessionUser(user);
      setLoginError(null);
    } else {
      setLoginError('No account found with this email. Please check the address or sign up.');
    }
  };

  const handleLogout = () => {
    clearSessionUser();
    setCurrentUser(null);
    setSelectedEmailId(null);
    setCurrentFolder('inbox');
    setSearchQuery('');
  };

  const selectedEmail = emails.find(email => email.id === selectedEmailId);

    // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger shortcuts if user is typing in an input, textarea, or contentEditable div
      if (isComposing || target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }
      
      const key = e.key.toLowerCase();

      switch (key) {
        case 'c':
          e.preventDefault();
          handleCompose();
          break;
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        case 'j':
        case 'arrowdown':
          e.preventDefault();
          if (filteredEmails.length > 0) {
            const currentIndex = filteredEmails.findIndex(em => em.id === selectedEmailId);
            const nextIndex = currentIndex === -1 ? 0 : Math.min(filteredEmails.length - 1, currentIndex + 1);
            handleSelectEmail(filteredEmails[nextIndex].id);
          }
          break;
        case 'k':
        case 'arrowup':
           e.preventDefault();
           if (filteredEmails.length > 0) {
              const currentIndex = filteredEmails.findIndex(em => em.id === selectedEmailId);
              const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
              handleSelectEmail(filteredEmails[prevIndex].id);
           }
           break;
        case 's':
          if (selectedEmailId) {
            e.preventDefault();
            handleToggleStarred(selectedEmailId);
          }
          break;
        case 'd':
          if (selectedEmailId) {
            e.preventDefault();
            handleDeleteEmail(selectedEmailId);
          }
          break;
         case 'm':
          if (selectedEmailId) {
            e.preventDefault();
            handleToggleReadStatus(selectedEmailId);
          }
          break;
        case 'r':
          if (selectedEmail) {
            e.preventDefault();
            handleReply(selectedEmail);
          }
          break;
        case 'a':
          if (selectedEmail) {
            e.preventDefault();
            handleReplyAll(selectedEmail);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isComposing, selectedEmailId, selectedEmail, filteredEmails, handleSelectEmail]);


  if (isAppLoading) {
    return (
      <div className="h-screen w-screen bg-light-gray dark:bg-navy flex items-center justify-center">
        <p className="text-dark-gray dark:text-light-gray animate-pulse">Loading Bharat Mail...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Onboarding 
              onSignUp={handleSignUp} 
              onLogin={handleLogin} 
              error={loginError} 
              defaultToLogin={allUsers.length > 0}
              onClearError={() => setLoginError(null)}
            />;
  }

  return (
    <div className="h-screen w-screen bg-light-gray dark:bg-navy font-sans flex flex-col overflow-hidden">
      <Header 
        user={currentUser} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentFolder={currentFolder} 
          onFolderChange={handleFolderChange} 
          onCompose={handleCompose}
          isOpen={isSidebarOpen}
        />
        <main className="flex-1 flex bg-white dark:bg-gray-800 rounded-tl-2xl border-t border-l border-medium-gray dark:border-gray-700 overflow-hidden">
          <div className={`w-full md:w-1/3 lg:w-2/5 border-r border-medium-gray dark:border-gray-700 flex-shrink-0 ${selectedEmailId && 'hidden md:flex'}`}>
            <EmailList
              emails={filteredEmails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              onDeleteEmail={handleDeleteEmail}
              onToggleStarred={handleToggleStarred}
              currentFolder={currentFolder}
              isLoading={isLoading}
            />
          </div>
          <div className={`flex-1 ${!selectedEmailId && 'hidden md:flex'}`}>
            <EmailView 
              email={selectedEmail} 
              onBack={() => setSelectedEmailId(null)} 
              onReply={handleReply}
              onReplyAll={handleReplyAll}
              onDelete={handleDeleteEmail}
              onMarkAsSpam={handleMarkAsSpam}
              onToggleRead={handleToggleReadStatus}
              onToggleStarred={handleToggleStarred}
              currentUser={currentUser}
              onSendReply={handleSendEmail}
            />
          </div>
        </main>
      </div>
      {isComposing && <ComposeModal key={composeInitialData?.id || 'new-email'} onClose={handleCloseCompose} onSend={handleSendEmail} onSaveDraft={handleSaveDraft} initialData={composeInitialData} />}
      
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => (
             <div key={toast.id} className="max-w-sm w-full bg-navy text-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;