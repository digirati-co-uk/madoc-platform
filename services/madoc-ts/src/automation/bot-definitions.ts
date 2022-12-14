import { BotAdminDetails } from './utils/BotAdminDetails';

export const siteBots: BotAdminDetails[] = [
  {
    type: 'automatic-review-bot',
    metadata: {
      label: 'Auto-review bot',
      description: 'Will automatically progress reviews assigned to this user',
      thumbnail:
        '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><g fill="none" fill-rule="evenodd"><path d="M0 0h256v256H0z"/><g transform="translate(27 19)"><circle cx="95.5" cy="13.5" r="13.5" fill="#D8D8D8"/><path fill="#D8D8D8" d="M92 25h7v21h-7z"/><path fill="#D8D8D8" d="M29 42h128a9 9 0 0 1 9 9v99c0 5.523-4.477 10-10 10H29a9 9 0 0 1-9-9V51a9 9 0 0 1 9-9Z"/><path fill="#D8D8D8" d="M165 80h16a5 5 0 0 1 5 5v32a5 5 0 0 1-5 5h-16V80ZM5 80h16v42H5a5 5 0 0 1-5-5V85a5 5 0 0 1 5-5Z"/><circle cx="70" cy="81" r="21" fill="#FFF"/><circle cx="122" cy="81" r="21" fill="#FFF"/><rect width="94" height="14" x="49" y="120" fill="#FFF" rx="4.5"/></g><path fill="#5B78E5" fill-rule="nonzero" d="m241 222.776-36.627-36.627c14.037-21.334 9.656-49.829-10.142-65.96-19.798-16.13-48.591-14.665-66.65 3.393-18.057 18.058-19.523 46.85-3.392 66.649 16.131 19.798 44.626 24.18 65.96 10.142L226.776 237 241 222.776Zm-110.236-64.008c0-17.675 14.329-32.004 32.004-32.004 17.675 0 32.004 14.329 32.004 32.004 0 17.675-14.329 32.004-32.004 32.004-17.675 0-32.004-14.329-32.004-32.004Z"/><path d="M132 129h60v60h-60z"/><path fill="#5B78E5" fill-rule="nonzero" stroke="#5B78E5" stroke-width="4" d="m154.682 170.104-10.262-10.343-3.42 3.448L154.682 177 184 147.448 180.58 144z"/></g></svg>',
    },
    siteRole: 'reviewer',
    config: { alpha: true },
  },
];
