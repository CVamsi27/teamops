import React, { useState, useRef, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  teamMembers: TeamMember[];
  onSend?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  error?: string;
}

/**
 * MentionInput component that handles @mention autocomplete for chat messages
 * Features:
 * - Autocomplete on @mention
 * - Highlighting of valid mentions
 * - Real-time validation
 */
export function MentionInput({
  value,
  onChange,
  teamMembers,
  onSend,
  isLoading = false,
  placeholder = 'Type a message... Use @mention to notify someone',
  error,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TeamMember[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract the word being typed after @
  const getMentionWord = (text: string, pos: number): string => {
    let start = pos - 1;
    while (start >= 0 && /[@a-zA-Z0-9._-]/.test(text.charAt(start))) {
      start--;
    }
    return text.substring(start + 1, pos);
  };

  // Handle input change and mention detection
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    const newCursor = e.currentTarget.selectionStart || 0;

    onChange(newValue);
    setCursorPosition(newCursor);

    // Check if @ was typed
    const word = getMentionWord(newValue, newCursor);
    if (word.startsWith('@')) {
      setMentionStart(newCursor - word.length);
      const query = word.substring(1).toLowerCase();

      if (query.length > 0) {
        const filtered = teamMembers.filter(
          member =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions(teamMembers);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Insert mention at cursor position
  const insertMention = (member: TeamMember) => {
    if (mentionStart === -1) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(cursorPosition);

    const newValue = `${beforeMention}@${member.name} ${afterMention}`;
    onChange(newValue);

    setShowSuggestions(false);
    setSuggestions([]);
    setMentionStart(-1);

    // Focus and position cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = beforeMention.length + member.name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Extract all valid mentions from input
  const extractedMentions = useMemo(() => {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const matches = [];
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      const mentionName = match[1];
      const member = teamMembers.find(m => m.name === mentionName);
      if (member) {
        matches.push(member);
      }
    }

    return matches;
  }, [value, teamMembers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onSend && !isLoading) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-md bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed pr-12"
        />

        {/* Send Button */}
        {onSend && (
          <button
            onClick={onSend}
            disabled={isLoading || !value.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}

        {/* Mention Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {suggestions.map((member, idx) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                  idx !== suggestions.length - 1 ? 'border-b' : ''
                }`}
              >
                {member.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full"
                    suppressHydrationWarning
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-gray-500 truncate">{member.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display extracted mentions */}
      {extractedMentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Mentioning:</span>
          {extractedMentions.map(member => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              @{member.name}
            </span>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        💡 Tip: Type @ to mention team members. They&apos;ll receive a notification.
      </p>
    </div>
  );
}
