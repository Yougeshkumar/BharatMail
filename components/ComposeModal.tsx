import React, { useState, useRef, useEffect } from 'react';
import { Email, Attachment } from '../types';
import LinkIcon from './icons/LinkIcon';
import StrikethroughIcon from './icons/StrikethroughIcon';
import OrderedListIcon from './icons/OrderedListIcon';
import UnorderedListIcon from './icons/UnorderedListIcon';
import BlockquoteIcon from './icons/BlockquoteIcon';
import UndoIcon from './icons/UndoIcon';
import RedoIcon from './icons/RedoIcon';
import MaximizeIcon from './icons/MaximizeIcon';
import MinimizeIcon from './icons/MinimizeIcon';


interface ComposeModalProps {
  onClose: () => void;
  onSend: (data: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => void;
  onSaveDraft: (data: { id?: string; to: string; cc?: string; bcc?: string; subject: string; body: string; attachments: Attachment[] }) => void;
  initialData?: Partial<Email> | null;
}

const FormattingButton: React.FC<{ onClick: () => void; children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <div className="relative group flex items-center">
        <button
            type="button"
            aria-label={title}
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent editor from losing focus
                onClick();
            }}
            className="w-8 h-8 rounded hover:bg-medium-gray dark:hover:bg-gray-600 flex items-center justify-center text-dark-gray dark:text-gray-300"
        >
            {children}
        </button>
        <div 
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-gray-900/90 dark:bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            role="tooltip"
        >
            {title}
        </div>
    </div>
);

const ComposeModal: React.FC<ComposeModalProps> = ({ onClose, onSend, onSaveDraft, initialData }) => {
  const [to, setTo] = useState(initialData?.to?.map(u => u.email).join(', ') || '');
  const [cc, setCc] = useState(initialData?.cc?.map(u => u.email).join(', ') || '');
  const [bcc, setBcc] = useState(initialData?.bcc?.map(u => u.email).join(', ') || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  const [showCcBcc, setShowCcBcc] = useState(!!(initialData?.cc?.length || initialData?.bcc?.length));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Set the initial content of the editor only once when the component mounts.
  // The key prop on the component in App.tsx ensures it remounts with fresh state.
  useEffect(() => {
    if (editorRef.current) {
        editorRef.current.innerHTML = body;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBodyChange = (e: React.FormEvent<HTMLDivElement>) => {
    setBody(e.currentTarget.innerHTML);
  };

  const applyFormat = (command: string, value: string | null = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleBodyChange({ currentTarget: editorRef.current } as React.FormEvent<HTMLDivElement>);
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        alert('Please select the text you want to hyperlink.');
        return;
    }
    const url = prompt("Enter the URL:", "https://");
    if (url) {
        applyFormat('createLink', url);
    }
  };

  const handleAttachFile = () => {
    const mockFile: Attachment = {
      fileName: `report-${Math.floor(Math.random() * 1000)}.docx`,
      fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
    };
    setAttachments(prev => [...prev, mockFile]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const collectData = () => ({
    id: initialData?.id,
    to,
    cc,
    bcc,
    subject,
    body,
    attachments
  });
  
  const handleSend = () => {
    if (!to.trim()) {
      alert('Please fill in the recipient.');
      return;
    }
    onSend(collectData());
  };

  const handleSave = () => {
    onSaveDraft(collectData());
  };

  const handleCloseAttempt = () => {
    const hasContent = to.trim() || cc.trim() || bcc.trim() || subject.trim() || body.replace(/<[^>]+>/g, '').trim() || attachments.length > 0;
    if (hasContent) {
        onSaveDraft(collectData());
    } else {
        if (initialData?.id) {
            onSaveDraft({ id: initialData.id, to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
        } else {
            onClose();
        }
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ${!isFullscreen ? 'p-4' : ''}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full flex flex-col transition-all duration-300 ${isFullscreen ? 'h-full max-h-full rounded-none' : 'max-w-4xl max-h-[90vh]'}`}>
        <div className="flex justify-between items-center p-3 bg-navy dark:bg-gray-900 text-white rounded-t-lg flex-shrink-0">
          <h2 className="text-lg font-semibold">{initialData?.id ? 'Edit Draft' : 'New Message'}</h2>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:text-gray-300" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <MinimizeIcon className="w-5 h-5"/> : <MaximizeIcon className="w-5 h-5" />}
            </button>
            <button onClick={handleCloseAttempt} className="text-white hover:text-gray-300 text-2xl font-bold">&times;</button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
            <div className="p-2 px-4 border-b border-medium-gray dark:border-gray-700 flex items-center">
                <label htmlFor="to-field" className="text-sm text-gray-500 dark:text-gray-400 mr-2">To</label>
                <input
                    id="to-field"
                    type="email"
                    placeholder="Recipients"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-grow px-2 py-1 outline-none bg-transparent dark:text-gray-200 dark:placeholder-gray-500"
                />
                <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white font-semibold">Cc/Bcc</button>
            </div>
            {showCcBcc && (
            <>
                <div className="p-2 px-4 border-b border-medium-gray dark:border-gray-700 flex items-center">
                    <label htmlFor="cc-field" className="text-sm text-gray-500 dark:text-gray-400 mr-2">Cc</label>
                    <input
                        id="cc-field"
                        type="email"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="flex-grow px-2 py-1 outline-none bg-transparent dark:text-gray-200"
                    />
                </div>
                <div className="p-2 px-4 border-b border-medium-gray dark:border-gray-700 flex items-center">
                    <label htmlFor="bcc-field" className="text-sm text-gray-500 dark:text-gray-400 mr-1">Bcc</label>
                    <input
                        id="bcc-field"
                        type="email"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        className="flex-grow px-2 py-1 outline-none bg-transparent dark:text-gray-200"
                    />
                </div>
            </>
            )}
            <div className="p-2 px-4 border-b border-medium-gray dark:border-gray-700">
            <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-2 py-1 outline-none font-medium bg-transparent dark:text-gray-200 dark:placeholder-gray-500"
            />
            </div>
            <div className="p-4 h-full">
            <div
                ref={editorRef}
                contentEditable={true}
                onInput={handleBodyChange}
                className="w-full h-full min-h-[200px] resize-none outline-none dark:text-gray-200"
                autoFocus
            />
            </div>
        </div>
         {attachments.length > 0 && (
            <div className="px-4 pb-2 border-t border-medium-gray dark:border-gray-700 flex-shrink-0">
                <ul className="flex flex-wrap gap-2 pt-2">
                    {attachments.map((file, index) => (
                        <li key={index} className="flex items-center gap-2 bg-light-gray dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                            <span className="font-medium text-dark-gray dark:text-gray-200">{file.fileName}</span>
                            <span className="text-gray-500 dark:text-gray-400">({file.fileSize})</span>
                            <button onClick={() => handleRemoveAttachment(index)} className="text-gray-500 hover:text-red-600 font-bold -mr-1">
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <div className="flex justify-between items-center p-2 border-t border-medium-gray dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-1 flex-wrap">
                <FormattingButton onClick={() => applyFormat('bold')} title="Bold">
                    <b className="font-sans">B</b>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('italic')} title="Italic">
                    <i className="font-serif">I</i>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('underline')} title="Underline">
                    <u className="font-sans">U</u>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('strikeThrough')} title="Strikethrough">
                    <StrikethroughIcon className="w-5 h-5"/>
                </FormattingButton>
                <div className="w-px h-5 bg-medium-gray dark:bg-gray-600 mx-1"></div>
                <FormattingButton onClick={insertLink} title="Insert link">
                    <LinkIcon className="w-5 h-5"/>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('insertOrderedList')} title="Numbered list">
                    <OrderedListIcon className="w-5 h-5"/>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('insertUnorderedList')} title="Bulleted list">
                    <UnorderedListIcon className="w-5 h-5"/>
                </FormattingButton>
                <FormattingButton onClick={() => applyFormat('formatBlock', '<blockquote>')} title="Blockquote">
                    <BlockquoteIcon className="w-5 h-5"/>
                </FormattingButton>
                 <div className="w-px h-5 bg-medium-gray dark:bg-gray-600 mx-1"></div>
                <FormattingButton onClick={() => applyFormat('undo')} title="Undo">
                    <UndoIcon className="w-5 h-5"/>
                </FormattingButton>
                 <FormattingButton onClick={() => applyFormat('redo')} title="Redo">
                    <RedoIcon className="w-5 h-5"/>
                </FormattingButton>
                <FormattingButton onClick={handleAttachFile} title="Attach file">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </FormattingButton>
            </div>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handleSave}
                    className="bg-gray-200 dark:bg-gray-600 text-dark-gray dark:text-gray-100 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Save & Close
                </button>
                <button
                    onClick={handleSend}
                    className="bg-bharat-blue text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;