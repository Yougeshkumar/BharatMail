import { User, Email } from './types';

export const getWelcomeEmail = (user: User): Email => ({
    id: `bharat-mail-welcome-${Date.now()}`,
    from: { name: 'Bharat Mail Team', email: 'team@bharatmail.in', avatarUrl: 'https://picsum.photos/seed/bharatmail/100/100' },
    to: [user],
    subject: `Welcome to Bharat Mail, ${user.name}!`,
    body: `
      <p>Hello ${user.name},</p>
      <p>Welcome to <b>Bharat Mail</b>, your new secure and modern email experience.</p>
      <p>We're thrilled to have you on board. Here are a few things you can do:</p>
      <ul>
        <li><b>Compose:</b> Click the "Compose" button to write a new email.</li>
        <li><b>Organize:</b> Use folders like Inbox, Sent, and Trash to keep your mail organized.</li>
        <li><b>Smart Replies:</b> Get AI-powered suggestions for quick responses.</li>
        <li><b>Dark Mode:</b> Switch to dark mode for a comfortable viewing experience at night.</li>
      </ul>
      <p>If you have any questions, feel free to explore the app. Enjoy your new inbox!</p>
      <p>Best,<br>The Bharat Mail Team</p>
    `,
    date: new Date().toISOString(),
    read: false,
    folder: 'inbox'
});
