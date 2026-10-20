import type { TourStep } from '@bluebulb/ui';

/*
 * A tour for every page (ADR 0030), keyed by its path. Each step points at an element marked
 * `data-tour="<target>"` on that page, or at the shell's own: `nav`, `nav-search`, `top-bar`,
 * `tour-button`. `pnpm tours:check` fails when a page has no tour or a step points at nothing.
 * Add the tour in the same commit as the page.
 */

export interface PageTour {
  title: string;
  /** One sentence for the help centre. */
  summary: string;
  steps: TourStep[];
}

export const TOURS: Record<string, PageTour> = {
  '/': {
    title: 'The dashboard',
    summary: 'What needs attention, and how the app’s services are doing.',
    steps: [
      {
        target: 'nav',
        title: 'Everything you can open',
        body: 'The menu lists the areas your role lets you use. Fold a group, or collapse the menu to icons.',
      },
      {
        target: 'nav-search',
        title: 'Find a page',
        body: 'Type part of a page’s name to jump to it.',
      },
      {
        target: 'greeting',
        title: 'Your day',
        body: 'Says whether anything is waiting for you, and takes you straight to it.',
      },
      {
        target: 'attention',
        title: 'What needs attention',
        body: 'Problems someone should act on, most urgent first. When it’s empty, all is well.',
      },
      {
        target: 'tiles',
        title: 'The numbers that matter',
        body: 'Each tile counts something worth watching. Replace them with your product’s own numbers.',
      },
      {
        target: 'people',
        title: 'Who signed in lately',
        body: 'The latest people to sign in, with their roles. Only people who manage access see it.',
      },
      {
        target: 'services',
        title: 'The services this app uses',
        body: 'Whether each platform service answered just now.',
      },
      {
        target: 'tour-button',
        title: 'Tours on every page',
        body: 'Start the tour of any page here, or from Help.',
      },
    ],
  },
  '/admin/users': {
    title: 'Users',
    summary: 'Everyone who has signed in, and the roles they hold.',
    steps: [
      {
        target: 'users-tiles',
        title: 'Who uses the app',
        body: 'How many people have signed in, and how many hold a role by name.',
      },
      {
        target: 'users-filters',
        title: 'Find someone',
        body: 'Search by name or email, or show one role’s holders.',
      },
      {
        target: 'users-table',
        title: 'Their roles',
        body: 'Each person’s roles at their last sign-in. Give or take away a role here; it reaches them within minutes.',
      },
    ],
  },
  '/admin/roles': {
    title: 'Roles',
    summary: 'What each role allows, and making your own.',
    steps: [
      {
        target: 'roles-table',
        title: 'Roles and what they allow',
        body: 'Roles from the app’s code keep the code’s permissions. Roles made here can be changed or deleted.',
      },
      {
        target: 'roles-new',
        title: 'Make a role',
        body: 'Bundle any of the app’s permissions into a new role, without a code change.',
      },
      {
        target: 'permissions-table',
        title: 'Every permission',
        body: 'What the app says can be done in it. Owners hold all of them.',
      },
    ],
  },
  '/design': {
    title: 'The design page',
    summary: 'The tokens and components this app is built from, in its brand.',
    steps: [
      {
        target: 'design-gallery',
        title: 'Build from these',
        body: 'Every colour, type size and component, in every state, in this app’s brand. New screens use these, not new styles.',
      },
    ],
  },
  '/help': {
    title: 'Help',
    summary: 'Topics and tours for every page.',
    steps: [
      {
        target: 'help-search',
        title: 'Search help',
        body: 'Find a topic or a tour by what you’re trying to do.',
      },
      {
        target: 'help-tours',
        title: 'Tours',
        body: 'Start the tour of any page; it opens the page and walks you through it.',
      },
      {
        target: 'help-topics',
        title: 'Topics',
        body: 'Short answers to the questions people ask most.',
      },
    ],
  },
  // The customer area (ADR 0030): customers see these, never the staff pages above.
  '/account': {
    title: 'Your details',
    summary: 'The details we hold about you, which you can change.',
    steps: [
      {
        target: 'nav',
        title: 'Your account',
        body: 'Everything you can do here: your details and the intents you register.',
      },
      {
        target: 'details-form',
        title: 'Keep them up to date',
        body: 'Change anything that’s out of date and save. Only you and the people who run this service see them.',
      },
      {
        target: 'tour-button',
        title: 'Tours on every page',
        body: 'Start the tour of any page here.',
      },
    ],
  },
  '/account/intents': {
    title: 'Register an intent',
    summary: 'Tell us what you plan to do, and see what you registered.',
    steps: [
      {
        target: 'intent-form',
        title: 'Register an intent',
        body: 'Say what it’s for, the amount and when. We’ll be in touch before anything happens.',
      },
      {
        target: 'intent-list',
        title: 'Your intents',
        body: 'Every intent you registered, newest first, with its status.',
      },
    ],
  },
};

/** The shell's own targets, on every page. */
export const SHELL_TARGETS = ['nav', 'nav-search', 'top-bar', 'tour-button'] as const;
