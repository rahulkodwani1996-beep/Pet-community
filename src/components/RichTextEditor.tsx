import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  users?: any[];
}

export default function RichTextEditor({ value, onChange, placeholder, users = [] }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [caretPosition, setCaretPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);

    // Simple mention popover checking
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.startContainer.textContent || '';
      const cursorOffset = range.startOffset;
      const textBeforeCursor = text.substring(0, cursorOffset);
      
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      if (mentionMatch) {
        setMentionFilter(mentionMatch[1]);
        const rect = range.getBoundingClientRect();
        if (editorRef.current) {
           const editorRect = editorRef.current.getBoundingClientRect();
           setCaretPosition({ top: rect.bottom - editorRect.top, left: rect.left - editorRect.left });
           setShowMentions(true);
        }
      } else {
        setShowMentions(false);
      }
    }
  };

  const execCmd = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  };

  const insertMention = (username: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Replace the @xxx with highlighted mention
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const text = node.textContent || '';
    const lastAt = text.lastIndexOf('@');
    if (lastAt !== -1) {
      range.setStart(node, lastAt);
      range.deleteContents();
      const el = document.createElement('span');
      el.className = 'text-[#E07A5F] font-bold bg-[#E07A5F]/10 px-1 rounded';
      el.contentEditable = 'false';
      el.textContent = `@${username}`;
      range.insertNode(el);
      
      // Move cursor after the mention
      range.setStartAfter(el);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }
    setShowMentions(false);
  };

  const filteredUsers = users.filter(u => u.display_name.toLowerCase().includes(mentionFilter.toLowerCase())).slice(0, 5);

  return (
    <div className="relative border border-[#D3D1C7] rounded-xl overflow-hidden bg-white focus-within:ring-1 focus-within:ring-[#E07A5F] focus-within:border-[#E07A5F]">
      <div className="border-b border-[#D3D1C7] bg-[#FDFAF6] py-1 px-2 flex items-center gap-2">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-[#D3D1C7]/50 rounded cursor-pointer text-[#3D405B]">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-[#D3D1C7]/50 rounded cursor-pointer text-[#3D405B]">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-[#D3D1C7]/80 mx-1"></div>
        <span className="text-[10px] text-[#888780] font-bold">Use @ to mention, # for tags</span>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full min-h-[120px] p-4 text-xs focus:outline-none relative"
        data-placeholder={placeholder}
      />
      
      {showMentions && filteredUsers.length > 0 && caretPosition && (
        <div 
          className="absolute z-10 bg-white border border-[#D3D1C7] rounded-xl shadow-lg w-48 overflow-hidden"
          style={{ top: caretPosition.top + 5, left: caretPosition.left }}
        >
          {filteredUsers.map(u => (
            <div 
              key={u.user_id} 
              className="px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#FDFAF6] cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); insertMention(u.display_name.replace(/\s+/g, '')); }}
            >
              <img src={u.avatar_url} className="w-5 h-5 rounded-full" alt="" />
              <span className="font-bold text-[#3D405B]">{u.display_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Editor styling for placeholder and hashtags */}
      <style dangerouslySetInnerHTML={{__html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #888780;
          pointer-events: none;
          display: block;
        }
      `}} />
    </div>
  );
}
