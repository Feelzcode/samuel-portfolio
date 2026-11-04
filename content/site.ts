/**
 * All site content lives here. Every section and the assistant read from this file,
 * so the assistant can only say what is written here.
 *
 * Website screenshots load automatically from each project's `url`.
 * To use your own screenshots, put them in /public/images and add e.g.
 *   images: ['/images/afroqueens-1.png', '/images/afroqueens-2.png', '/images/afroqueens-3.png']
 */

export type Project = {
  id: string;
  title: string;
  tag: string;
  hue: number;
  text: string;
  keywords?: string;
  url?: string;
  demo?: string;
  featured?: boolean;
  images?: string[];
  stack?: string[];
  built?: string[];
  planned?: string[];
};

export type Service = { title: string; text: string; icon: string };

export const SITE = {
  name: 'Ali Samuel',
  fullName: 'Ali Samuel Chidera',
  short: 'Samuel',
  role: 'Software engineer building SaaS products and AI workflows.',
  available: true,
  email: 'alisamuel325@gmail.com',
  phone: '+2348164862230',
  location: 'Enugu, Nigeria',
  years: 5,
  photo: '/samuel.webp',
  summary:
    'I’m a software engineer with over five years of experience building full-stack web applications: RESTful APIs, responsive frontends and data-driven platforms. I ship clean, well-tested code in Agile teams, and I lead and mentor other developers.',
  skills: [
    ['Languages', ['TypeScript', 'JavaScript (ES6+)']],
    ['Full-stack', ['React', 'Next.js', 'NestJS', 'Node.js', 'Express.js']],
    ['Data', ['PostgreSQL', 'Prisma ORM', 'Microsoft Excel']],
    ['AI', ['Amazon Bedrock', 'MCP']],
    ['Testing', ['Jest', 'Cypress', 'React Testing Library']],
    ['Tools', ['Git', 'GitHub', 'Postman', 'Agile / Scrum']],
  ] as [string, string[]][],
  socials: [
    ['GitHub', '#'],
    ['LinkedIn', '#'],
    ['X', '#'],
  ] as [string, string][],
  services: [
    { title: 'Product engineering', text: 'Web apps, dashboards, APIs, authentication and business systems.', icon: 'M3 4h18v12H3zM8 20h8M12 16v4' },
    { title: 'AI workflows', text: 'Assistants that use tools, ask for approval and verify what they did.', icon: 'M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z' },
    { title: 'Product delivery', text: 'From requirements and architecture to deployment and iteration.', icon: 'M4 12h12M12 6l6 6-6 6' },
  ] as Service[],
  process: ['Discovery', 'Requirements', 'Architecture', 'Build', 'Test', 'Deploy', 'Maintain'],
  suggestions: [
    'Who is Samuel?',
    'Show me your strongest project',
    'Tell me about your AI experience',
    'Can you build a SaaS platform?',
    'How do you approach a new project?',
  ],
  projects: [
    {
      id: 'concierge', title: 'Creator Concierge', tag: 'AI agent', hue: 262, demo: '#lab', featured: true,
      keywords: 'ai agent assistant automation chatbot llm tools mcp bedrock alexa voice workflow',
      text: 'An AI assistant inside EngageFoyer that understands a creator’s request, inspects their event workflows, prepares the change, asks for approval, then executes and verifies it.',
      stack: ['Amazon Bedrock', 'MCP', 'TypeScript'],
      built: ['Bedrock model with tool calling', 'MCP server over Streamable HTTP', 'TypeScript agent tools', 'Organisation-scoped access', 'Approval before consequential actions', 'Verification and audit after each action'],
      planned: ['Alexa+ voice access (explored, not shipped)'],
    },
    {
      id: 'engagefoyer', title: 'EngageFoyer', tag: 'Event CRM', hue: 235, url: 'https://engagefoyer.com',
      keywords: 'saas crm events registration email reminders zoom webinar creators dashboard',
      text: 'An event CRM for creators that handles registration, reminder emails and attendee follow-up on top of any meeting platform.',
      built: ['Event registration', 'Scheduled reminder emails', 'Attendee follow-up', 'Zoom integration'],
    },
    {
      id: 'afroqueens', title: 'Afroqueens FM', tag: 'Music platform', hue: 330, url: 'https://afroqueensng.com',
      keywords: 'music media podcast blog content artists gallery events',
      text: 'A platform spotlighting women in Afrobeats, with podcast episodes, artist profiles, events and a photo gallery.',
    },
    {
      id: 'afrolit', title: 'AfroLitPlaylist', tag: 'Music & events', hue: 25, url: 'https://afrolitplaylist.com',
      keywords: 'music media events tickets ticketing artists blog',
      text: 'New Afro music releases, artist profiles, event tickets, stories and episodes in one place.',
    },
    {
      id: 'researchforge', title: 'ResearchForge', tag: 'Research', hue: 150, url: 'https://researchforge.com.ng',
      keywords: 'research data analysis corporate consulting africa',
      text: 'Field research and analysis across Africa for governments, investors, NGOs and companies.',
    },
    {
      id: 'koldcity', title: 'Kold City', tag: 'Real estate', hue: 195, url: 'https://koldcitymanagement.com',
      keywords: 'real estate property rental listings housing',
      text: 'Rental property listings with simple browsing and direct contact.',
    },
    {
      id: 'elite', title: 'Elite Performers Circle', tag: 'Education', hue: 45, url: 'https://eliteperformerscircle.com',
      keywords: 'landing page education workshop marketing course airbnb',
      text: 'Landing site for a live workshop teaching Airbnb rental arbitrage.',
    },
  ] as Project[],
};

export const STACK: string[] = SITE.skills.flatMap(([, list]) => list);
export const PROJECTS = SITE.projects;
export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);

/** Creator Concierge demo in the AI Lab — illustrative data, not live calls. */
export const LAB = {
  request: 'Remind everyone registered for Saturday’s workshop.',
  arch: [['YOU', 'Creator'], ['LLM', 'Amazon Bedrock'], ['MCP', 'MCP server'], ['TS', 'Agent tools'], ['API', 'EngageFoyer API'], ['LOG', 'Audit log']] as [string, string][],
  steps: [
    { t: 'Understand', code: 'intent: send_reminder · event: "Saturday workshop"', on: [1] },
    { t: 'Inspect', code: 'list_events({ date: "sat" }) → 1 event · 48 registrants', on: [2, 3, 4] },
    { t: 'Prepare', code: 'draft reminder → 48 attendees', on: [1] },
    { t: 'Approve', code: 'waiting for your approval', on: [0], gate: true },
    { t: 'Execute', code: 'send_reminder({ event_id: "evt_29" }) → 48 queued', on: [3, 4] },
    { t: 'Verify', code: 'get_delivery_status("evt_29") → 48/48 · logged', on: [4, 5] },
  ] as { t: string; code: string; on: number[]; gate?: boolean }[],
};
