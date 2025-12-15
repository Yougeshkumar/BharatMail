import React from 'react';
import { Folder } from '../types';
import PencilIcon from './icons/PencilIcon';
import InboxIcon from './icons/InboxIcon';
import SentIcon from './icons/SentIcon';
import DraftsIcon from './icons/DraftsIcon';
import TrashIcon from './icons/TrashIcon';
import SpamIcon from './icons/SpamIcon';
import StarIcon from './icons/StarIcon';

interface SidebarProps {
  currentFolder: Folder;
  onFolderChange: (folder: Folder) => void;
  onCompose: () => void;
  isOpen: boolean;
}

const FOLDERS: { id: Folder; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'inbox', name: 'Inbox', icon: InboxIcon },
  { id: 'starred', name: 'Starred', icon: StarIcon },
  { id: 'sent', name: 'Sent', icon: SentIcon },
  { id: 'drafts', name: 'Drafts', icon: DraftsIcon },
  { id: 'spam', name: 'Spam', icon: SpamIcon },
  { id: 'trash', name: 'Trash', icon: TrashIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ currentFolder, onFolderChange, onCompose, isOpen }) => {
  return (
    <aside className={`bg-light-gray/80 dark:bg-navy/80 backdrop-blur-sm pt-6 flex-shrink-0 transition-all duration-300 ease-in-out ${isOpen ? 'w-64 px-4' : 'w-0 px-0' } overflow-hidden`}>
      <div className="px-2">
        <button onClick={onCompose} className="w-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow rounded-full py-3 px-4 text-navy dark:text-light-gray font-semibold hover:bg-bharat-blue/10 dark:hover:bg-gray-700">
          <PencilIcon className="h-6 w-6 mr-3"/>
          <span>Compose</span>
        </button>
      </div>

      <nav className="mt-8">
        <ul>
          {FOLDERS.map((folder) => (
            <li key={folder.id}>
              <button
                onClick={() => onFolderChange(folder.id)}
                className={`w-full flex items-center text-left py-3 px-4 rounded-full text-base transition-colors duration-200 ${
                  currentFolder === folder.id
                    ? 'bg-bharat-blue/20 dark:bg-bharat-blue/30 text-bharat-blue font-bold'
                    : 'text-dark-gray dark:text-gray-300 hover:bg-medium-gray/60 dark:hover:bg-gray-700'
                }`}
              >
                <folder.icon className="h-6 w-6 mr-4" />
                <span>{folder.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;