import { Email, User, Attachment } from '../types';

const EMAILS_KEY_PREFIX = 'bharat_mail_emails_';
const SESSION_USER_KEY = 'bharat_mail_session_user';
const ALL_USERS_KEY = 'bharat_mail_all_users';

const getEmailStorageKey = (user: User) => `${EMAILS_KEY_PREFIX}${user.email}`;

// --- User Management ---

export const getUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(ALL_USERS_KEY);
    if (!storedUsers) return [];
    const parsed = JSON.parse(storedUsers);
    // Ensure it's an array, guarding against corrupted data
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to get all users from localStorage", error);
    return [];
  }
};

const saveUsers = (users: User[]): boolean => {
  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error("Failed to save all users to localStorage", error);
    return false;
  }
};

export const findUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const createUser = (newUser: User): { success: boolean; user?: User; message?: string } => {
  const users = getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());

  if (existingUser) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }
  
  const updatedUsers = [...users, newUser];
  const saveSuccess = saveUsers(updatedUsers);

  if (saveSuccess) {
    // Verify that the save was successful before returning the user read back from storage.
    const checkUser = findUserByEmail(newUser.email);
    if (checkUser) {
      return { success: true, user: checkUser };
    }
  }

  // This case would indicate a serious failure in localStorage.
  return { success: false, message: 'Failed to save the new user account.' };
};


// --- Session Management ---

export const getSessionUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(SESSION_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to get session user from localStorage", error);
    return null;
  }
};

export const saveSessionUser = (user: User): void => {
  try {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save session user to localStorage", error);
  }
};

export const clearSessionUser = (): void => {
    try {
        localStorage.removeItem(SESSION_USER_KEY);
    } catch (error) {
        console.error("Failed to clear session user from localStorage", error);
    }
};


// --- Email Management ---

export const getEmails = (user: User): Promise<Email[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        const storedEmails = localStorage.getItem(getEmailStorageKey(user));
        if (storedEmails) {
          const parsed = JSON.parse(storedEmails);
          // Add robustness check: ensure the parsed data is an array.
          if (Array.isArray(parsed)) {
            resolve(parsed);
          } else {
            console.warn(`Stored email data for ${user.email} is not an array. Resetting.`);
            resolve([]);
          }
        } else {
          // New user has no emails initially.
          // Welcome email is added in App.tsx
          resolve([]);
        }
      } catch (error) {
        console.error("Failed to read from localStorage", error);
        resolve([]); // Resolve with empty array on error
      }
    }, 500); // Simulate network delay
  });
};

export const saveEmails = (emails: Email[], user: User): void => {
  if (!user) return;
  try {
    localStorage.setItem(getEmailStorageKey(user), JSON.stringify(emails));
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};

/**
 * A robust "transactional" function to handle sending an email. It reads all necessary data,
 * prepares all updates, and then writes them all at once to localStorage. This prevents
 * state inconsistencies and fixes the email delivery bug.
 */
export const sendAndDeliverEmail = (
  sender: User,
  emailData: { to: User[]; cc: User[]; bcc: User[]; subject: string; body: string; attachments: Attachment[] },
  draftId?: string
): Email | null => {
  try {
    // --- START "TRANSACTION": Read all data first ---
    const allUsers = getUsers();
    
    const senderStorageKey = getEmailStorageKey(sender);
    const senderEmailsRaw = localStorage.getItem(senderStorageKey);
    let senderEmails: Email[] = senderEmailsRaw ? JSON.parse(senderEmailsRaw) : [];
    if (!Array.isArray(senderEmails)) senderEmails = [];

    // --- PREPARE UPDATES ---

    // 1. Prepare sender's data
    const sentEmail: Email = {
      id: `bharat-mail-sent-${Date.now()}`,
      from: sender,
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      body: emailData.body,
      date: new Date().toISOString(),
      read: true,
      folder: 'sent',
      attachments: emailData.attachments,
    };
    
    if (draftId) {
      senderEmails = senderEmails.filter(e => e.id !== draftId);
    }
    senderEmails.unshift(sentEmail);
    
    // 2. Prepare data for all recipients
    const allRecipients = [...emailData.to, ...emailData.cc, ...emailData.bcc];
    const recipientUpdates = new Map<string, Email[]>();

    allRecipients.forEach(recipient => {
      const recipientUser = allUsers.find(u => u.email.toLowerCase() === recipient.email.toLowerCase());
      if (recipientUser) {
        const receivedEmail: Email = {
          ...sentEmail,
          id: `bharat-mail-received-${Date.now()}-${Math.random()}`,
          folder: 'inbox',
          read: false,
        };
        
        const recipientStorageKey = getEmailStorageKey(recipientUser);
        const recipientEmailsRaw = localStorage.getItem(recipientStorageKey);
        let recipientEmails: Email[] = recipientEmailsRaw ? JSON.parse(recipientEmailsRaw) : [];
        if (!Array.isArray(recipientEmails)) recipientEmails = [];
        
        recipientEmails.unshift(receivedEmail);
        recipientUpdates.set(recipientStorageKey, recipientEmails);
      }
    });
    
    // --- COMMIT "TRANSACTION": Write all changes to localStorage ---
    localStorage.setItem(senderStorageKey, JSON.stringify(senderEmails));
    recipientUpdates.forEach((emails, key) => {
      localStorage.setItem(key, JSON.stringify(emails));
    });
    
    return sentEmail;
    
  } catch (error) {
    console.error("Failed during email send transaction", error);
    return null;
  }
};