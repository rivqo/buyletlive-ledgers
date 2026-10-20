/*
 * Help topics (ADR 0030): short answers to what people ask most, shown in the help centre with
 * the tours. Write them for the people using the app, in plain words, and keep them next to the
 * feature they explain: change a topic in the same commit as the screen.
 */

export interface HelpTopic {
  id: string;
  title: string;
  summary: string;
  /** Paragraphs. */
  body: string[];
}

export const TOPICS: HelpTopic[] = [
  {
    id: 'roles',
    title: 'Why can’t I see a page?',
    summary: 'What you can open depends on your role.',
    body: [
      'Each page needs a permission, and your roles give you permissions. The menu shows only what your roles allow.',
      'If you need more, ask one of the app’s admins: they can give you a role on the Users page. It reaches you within a few minutes.',
    ],
  },
  {
    id: 'theme',
    title: 'Light and dark',
    summary: 'Switch the theme from the top bar.',
    body: [
      'The theme button in the top bar switches between light, dark and your system’s setting. The app remembers your choice on this browser.',
    ],
  },
  {
    id: 'sign-out',
    title: 'Signing out',
    summary: 'From your account menu.',
    body: [
      'Open your account menu in the top bar and choose Sign out. Your session also ends after an hour without use, and after 12 hours whatever happens.',
    ],
  },
];
