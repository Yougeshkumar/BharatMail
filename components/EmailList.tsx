import React from 'react';
import { Email, Folder } from '../types';
import EmailListItem from './EmailListItem';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onDeleteEmail: (id: string) => void;
  onToggleStarred: (id: string) => void;
  currentFolder: Folder;
  isLoading: boolean;
}

const getEmptyMessage = (folder: Folder): string => {
  switch (folder) {
    case 'inbox': return 'Your inbox is empty.';
    case 'sent': return 'You haven\'t sent any emails yet.';
    case 'drafts': return 'You have no saved drafts.';
    case 'spam': return 'Hooray, no spam here!';
    case 'trash': return 'No emails in the trash.';
    case 'starred': return 'No starred emails.';
    default: return 'This folder is empty.';
  }
};

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmailId, onSelectEmail, onDeleteEmail, onToggleStarred, currentFolder, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-dark-gray dark:text-gray-400">
        <p>Loading emails...</p>
      </div>
    );
  }
  
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-dark-gray dark:text-gray-400 p-4 text-center">
        <p>{getEmptyMessage(currentFolder)}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-800">
      <div className="p-2">
        <h2 className="text-xl font-bold text-navy dark:text-light-gray p-3 capitalize">{currentFolder}</h2>
        <ul>
          {emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={email.id === selectedEmailId}
              onSelect={onSelectEmail}
              onDelete={onDeleteEmail}
              onToggleStarred={onToggleStarred}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmailList;