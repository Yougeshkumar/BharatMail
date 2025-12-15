import React from 'react';
import { Email } from '../types';
import TrashIcon from './icons/TrashIcon';
import StarIcon from './icons/StarIcon';

interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStarred: (id: string) => void;
}

const EmailListItem: React.FC<EmailListItemProps> = ({ email, isSelected, onSelect, onDelete, onToggleStarred }) => {
  const plainTextBody = email.body.replace(/<[^>]+>/g, ' ');
  const snippet = plainTextBody.substring(0, 80) + (plainTextBody.length > 80 ? '...' : '');
  
  const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}min ago`;
    return `${Math.floor(seconds)}s ago`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(email.id);
  };

  const handleToggleStarred = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStarred(email.id);
  };

  return (
    <li
      className={`relative group cursor-pointer border-b border-medium-gray dark:border-gray-700 last:border-b-0 rounded-lg transition-colors duration-200 ${
        isSelected ? 'bg-bharat-blue/10 dark:bg-bharat-blue/20' : 'hover:bg-light-gray dark:hover:bg-gray-700'
      }`}
      onClick={() => onSelect(email.id)}
    >
      <div className="p-4 flex space-x-4">
        {!email.read && (
           <div className="w-2 h-2 bg-bharat-blue rounded-full mt-2 flex-shrink-0"></div>
        )}
        <div className={`flex-1 overflow-hidden ${email.read ? 'pl-4' : ''}`}>
          <div className="flex justify-between items-baseline">
            <p className={`text-md truncate ${!email.read ? 'font-bold text-navy dark:text-white' : 'font-semibold text-dark-gray dark:text-gray-300'}`}>
              {email.from.name}
            </p>
            <p className={`text-xs flex-shrink-0 ml-2 ${!email.read ? 'font-bold text-bharat-blue' : 'text-gray-500 dark:text-gray-400'}`}>
              {timeSince(new Date(email.date))}
            </p>
          </div>
          <p className={`text-sm truncate mt-1 ${!email.read ? 'text-navy dark:text-white' : 'text-dark-gray dark:text-gray-300'}`}>{email.subject}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{snippet}</p>
        </div>
        <button
          onClick={handleToggleStarred}
          aria-label={email.starred ? "Unstar email" : "Star email"}
          className="p-2 rounded-full hover:bg-medium-gray dark:hover:bg-gray-600 opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <StarIcon className={`w-5 h-5 ${email.starred ? 'text-yellow-500' : 'text-dark-gray dark:text-gray-300'}`} fill={email.starred ? 'currentColor' : 'none'} />
        </button>
      </div>
       <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
              onClick={handleDelete}
              aria-label="Delete email"
              className="p-2 rounded-full hover:bg-medium-gray dark:hover:bg-gray-600"
            >
              <TrashIcon className="w-5 h-5 text-dark-gray dark:text-gray-300" />
            </button>
       </div>
    </li>
  );
};

export default EmailListItem;