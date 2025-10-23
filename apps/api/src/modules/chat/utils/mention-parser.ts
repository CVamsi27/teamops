/**
 * Utility functions for parsing and handling @mentions in chat messages
 */

export interface MentionedUser {
  userId: string;
  userName: string;
  userEmail: string;
}

/**
 * Extracts @mentions from a chat message
 * Supports formats like @username, @user-name, @user_name
 * @param content - The chat message content
 * @returns Array of mentioned usernames/emails
 */
export function extractMentions(content: string): string[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Match @mention patterns: @username, @user-name, @user_name
  // Also match email patterns: @user@domain.com or just the mention @user
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const matches = content.match(mentionRegex) || [];

  // Remove @ symbol and return unique mentions
  return [...new Set(matches.map(m => m.substring(1)))];
}

/**
 * Checks if a mention is an email or a username
 * @param mention - The mention string (without @)
 * @returns true if it looks like an email
 */
export function isEmailMention(mention: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mention);
}

/**
 * Replaces mention strings with highlighted format
 * Useful for storing or displaying mentions in a formatted way
 * @param content - The chat message content
 * @param mentions - Array of MentionedUser objects
 * @returns Content with HTML or markdown formatted mentions
 */
export function formatMentions(content: string, mentions: MentionedUser[]): string {
  let formattedContent = content;

  mentions.forEach(({ userName, userId }) => {
    const mentionRegex = new RegExp(`@${userName}`, 'g');
    formattedContent = formattedContent.replace(
      mentionRegex,
      `[@${userName}](user:${userId})`
    );
  });

  return formattedContent;
}

/**
 * Extracts mention data including user IDs for notification purposes
 * @param content - The chat message content
 * @param teamMembers - Array of team members with userId and names
 * @returns Array of mentioned users with full details
 */
export function parseMentionsWithContext(
  content: string,
  teamMembers: Array<{ id: string; name: string; email: string }>
): MentionedUser[] {
  const mentionStrings = extractMentions(content);
  const mentionedUsers: MentionedUser[] = [];
  const processedIds = new Set<string>();

  mentionStrings.forEach(mention => {
    // Try to match against team members by name or email
    const member = teamMembers.find(
      m =>
        m.name.toLowerCase() === mention.toLowerCase() ||
        m.email.toLowerCase() === mention.toLowerCase() ||
        m.email.split('@')[0].toLowerCase() === mention.toLowerCase()
    );

    if (member && !processedIds.has(member.id)) {
      mentionedUsers.push({
        userId: member.id,
        userName: member.name,
        userEmail: member.email,
      });
      processedIds.add(member.id);
    }
  });

  return mentionedUsers;
}

/**
 * Validates if mentions are valid team members
 * @param mentions - Array of MentionedUser objects
 * @param validUserIds - Set of valid user IDs in the team
 * @returns Filtered array of valid mentions
 */
export function validateMentions(
  mentions: MentionedUser[],
  validUserIds: Set<string>
): MentionedUser[] {
  return mentions.filter(mention => validUserIds.has(mention.userId));
}

/**
 * Creates notification data from mentions
 * @param mentions - Array of MentionedUser objects
 * @param messageId - The chat message ID
 * @param authorName - Name of the person making the mention
 * @param roomId - The room/task ID where mention occurred
 * @param roomType - Type of room (TASK, PROJECT, TEAM)
 * @returns Array of notification data objects
 */
export function createMentionNotifications(
  mentions: MentionedUser[],
  messageId: string,
  authorName: string,
  roomId: string,
  roomType: string
) {
  return mentions.map(mention => ({
    userId: mention.userId,
    title: `Mentioned by ${authorName}`,
    message: `${authorName} mentioned you in a ${roomType.toLowerCase()}`,
    type: 'MENTION',
    data: {
      messageId,
      authorName,
      roomId,
      roomType,
      mentionedUser: mention,
      timestamp: new Date().toISOString(),
    },
  }));
}
