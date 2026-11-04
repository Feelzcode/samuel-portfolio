/**
 * Ask Samuel — a grounded assistant.
 * Every answer comes from content/site.ts through the TOOLS below.
 * To connect a real model later, expose these same tools to it from an API route;
 * the chat UI only consumes `Reply` objects and doesn't need to change.
 */
import { SITE, STACK, PROJECTS, projectById, type Project } from '@/content/site';

export type Do =
  | { type: 'openProject'; id: string }
  | { type: 'url'; href: string }
  | { type: 'goto'; hash: string }
  | { type: 'copyEmail' }
  | { type: 'call' }
  | { type: 'startBrief'; seed?: string }
  | { type: 'submitBrief'; brief: Brief };

export type Action = { label: string; primary?: boolean; do: Do };
export type ToolCall = [name: string, arg?: unknown];
export type Reply = { tools?: ToolCall[]; html?: string; acts?: Action[]; chips?: string[] };

export type Brief = Record<BriefKey, string>;
type BriefKey = 'what' | 'who' | 'problem' | 'kind' | 'timeline' | 'contact';
export type BriefState = { step: number; data: Partial<Brief> };

/* ---------- Tools (read-only over SITE) ---------- */
export const TOOLS = {
  get_profile: () => ({ name: SITE.fullName, role: SITE.role, location: SITE.location, years: SITE.years, summary: SITE.summary, available: SITE.available }),
  list_projects: () => PROJECTS.map(({ id, title, tag }) => ({ id, title, tag })),
  get_project_details: (id: string) => projectById(id),
  get_technical_experience: () => STACK.map((t) => ({ tech: t, projects: PROJECTS.filter((p) => p.stack?.includes(t)).map((p) => p.id) })),
  get_services: () => SITE.services,
  get_process: () => SITE.process,
  prepare_project_brief: (b: Brief) => b,
  submit_contact_request: (b: Brief) =>
    `mailto:${SITE.email}?subject=${encodeURIComponent('Project brief: ' + b.what)}&body=${encodeURIComponent(briefText(b))}`,
};

/* ---------- Helpers ---------- */
export const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const reEsc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ul = (a: string[]) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const b = (x: string) => `<b>${esc(x)}</b>`;

const techIn = (s: string) =>
  STACK.filter((t) =>
    t.toLowerCase().replace(/\s*\(.*\)/, '').split(/\s*\/\s*/).some((part) =>
      new RegExp('(^|[^a-z])' + reEsc(part).replace('\\.js', '(\\.js)?').replace(' orm', '( orm)?') + '(?![a-z])').test(s),
    ),
  ).sort((x, y) => y.length - x.length)[0];

const projectIn = (s: string) => PROJECTS.find((p) => s.includes(p.title.toLowerCase()) || s.includes(p.id));

const STOP = new Set(
  'build built want need make create something like this that with your have platform system company business organisation organization website site app application could would please help from about'.split(' '),
);
const related = (s: string) => {
  const words = s.split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP.has(w));
  return PROJECTS.filter((p) => words.some((w) => `${p.title} ${p.tag} ${p.text} ${p.keywords ?? ''}`.toLowerCase().includes(w)));
};
const openAct = (p: Project): Action => ({ label: `Open ${p.title}`, do: { type: 'openProject', id: p.id } });
const featured = () => PROJECTS.find((p) => p.featured) ?? PROJECTS[0];

export const greeting = (): Reply => ({
  html: `<p>Hi. I can tell you about ${esc(SITE.short)}’s work, stack and process, or help you scope a project.</p>`,
  chips: SITE.suggestions,
});

function projectReply(p: Project, lead = ''): Reply {
  const acts: Action[] = [openAct(p)];
  if (p.url) acts.push({ label: 'Visit site', do: { type: 'url', href: p.url } });
  if (p.demo) acts.push({ label: 'Watch it work', do: { type: 'goto', hash: p.demo } });
  return {
    tools: [['get_project_details', p.id]],
    html:
      `${lead}<p>${b(p.title)} — ${esc(p.text)}</p>` +
      (p.built?.length ? `<p class="muted">Built</p>${ul(p.built)}` : '') +
      (p.planned?.length ? `<p class="muted">Planned</p>${ul(p.planned)}` : '') +
      (p.stack?.length ? `<p class="muted">Stack: ${p.stack.map(esc).join(', ')}</p>` : ''),
    acts,
  };
}

/* ---------- Intent routing ---------- */
export function route(raw: string): Reply {
  const s = raw.toLowerCase();
  const has = (re: RegExp) => re.test(s);
  const tech = techIn(s);

  if (has(/^(hi|hey|hello|yo|good (morning|afternoon|evening))\b/))
    return {
      tools: [['get_profile']],
      html: `<p>Hello. ${esc(SITE.fullName)} is a ${esc(SITE.role.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase()))}. What would you like to know?</p>`,
      chips: SITE.suggestions,
    };

  if (has(/\b(contact|email|reach|call|talk to|get in touch|hire)\b/) && !has(/\bbuild\b/))
    return {
      tools: [['get_profile']],
      html: `<p>Email ${b(SITE.email)} or call ${b(SITE.phone)}.${SITE.available ? ' He’s currently available for new projects.' : ''}</p>`,
      acts: [
        { label: 'Copy email', primary: true, do: { type: 'copyEmail' } },
        { label: 'Call', do: { type: 'call' } },
        { label: 'Start a project brief', do: { type: 'startBrief' } },
      ],
    };

  if (tech && has(/\b(use|used|using|experience|know|work with|worked)\b/)) {
    const used = PROJECTS.filter((p) => p.stack?.includes(tech));
    return {
      tools: [['get_technical_experience']],
      html: used.length
        ? `<p>${esc(tech)} is used in ${used.map((p) => b(p.title)).join(', ')}.</p>`
        : `<p>${esc(tech)} is part of ${esc(SITE.short)}’s stack, but no project here lists it yet.</p>`,
      acts: used.map(openAct),
    };
  }

  if (has(/\b(can you|could you|want to|need|looking for|build (me|us|for)|for my)\b/) && has(/\b(build|make|create|develop|platform|app|system|website|site|help)\b/)) {
    const rel = related(s);
    return {
      tools: [['get_services'], ['list_projects']],
      html:
        (rel.length
          ? `<p>Related work: ${rel.map((p) => b(p.title)).join(', ')}.</p>`
          : `<p>There’s no project quite like that in this portfolio, but it may still fit ${esc(SITE.short)}’s services:</p>${ul(SITE.services.map((x) => x.title))}`) +
        `<p>Want to scope it? I’ll ask five short questions and draft a brief you can review before sending.</p>`,
      acts: [{ label: 'Start a brief', primary: true, do: { type: 'startBrief', seed: raw } }, ...rel.slice(0, 2).map(openAct)],
    };
  }

  if (has(/\b(ai|agents?|llm|mcp|bedrock|concierge|assistant|alexa|tool calling|automation)\b/))
    return projectReply(projectById('concierge') ?? featured());

  if (has(/\b(strongest|best|flagship|favou?rite|proudest|top)\b/)) {
    const f = featured();
    return projectReply(f, `<p>The flagship is ${b(f.title)}.</p>`);
  }

  if (has(/\b(who|about (you|him|samuel)|yourself|background|years|based|location|where are you|from|summary|bio|cv|resume)\b/))
    return {
      tools: [['get_profile']],
      html:
        `<p>${b(SITE.fullName)} — software engineer in ${esc(SITE.location)}.</p>` +
        `<p>${esc(SITE.summary).replace('I’m a', 'He’s a').replace('I ship', 'He ships').replace('I lead', 'he leads')}</p>`,
      acts: [
        { label: 'See About', primary: true, do: { type: 'goto', hash: '#about' } },
        { label: 'Copy email', do: { type: 'copyEmail' } },
      ],
      chips: ['What technologies do you use?', 'Show me your strongest project'],
    };

  if (has(/\btest(s|ing|ed)?\b/)) {
    const g = SITE.skills.find(([n]) => n === 'Testing');
    if (g) return { tools: [['get_technical_experience']], html: `<p>Testing: ${g[1].map(esc).join(', ')}.</p>` };
  }

  if (tech) return route(`where have you used ${tech}`);

  if (has(/\b(stack|tech\w*|languages?|frameworks?|tools you)\b/))
    return {
      tools: [['get_technical_experience']],
      html: `<ul>${SITE.skills.map(([g, l]) => `<li>${b(g)} — ${l.map(esc).join(', ')}</li>`).join('')}</ul>`,
      chips: ['Where have you used TypeScript?', 'Where have you used MCP?'],
    };

  if (has(/\b(process|approach|how do you work|methodology|workflow|steps)\b/))
    return {
      tools: [['get_process']],
      html: `<p>Every project follows the same path:</p><ol>${SITE.process.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`,
      acts: [{ label: 'Start a project brief', primary: true, do: { type: 'startBrief' } }],
    };

  if (has(/\b(services?|offer|what do you (do|build)|what kind|what can you)\b/))
    return {
      tools: [['get_services']],
      html: `<ul>${SITE.services.map((x) => `<li>${b(x.title)} — ${esc(x.text)}</li>`).join('')}</ul>`,
      chips: ['Show me your strongest project', 'How do you approach a new project?'],
    };

  const p = projectIn(s);
  if (p) return projectReply(p);

  if (has(/\b(projects?|work|portfolio|examples?|built|clients?)\b/))
    return { tools: [['list_projects']], html: `<p>${PROJECTS.length} projects:</p>`, chips: PROJECTS.map((x) => `Tell me about ${x.title}`) };

  return {
    tools: [['get_profile']],
    html: `<p>I can only answer from ${esc(SITE.short)}’s portfolio, and there’s nothing here about that.</p>`,
    chips: SITE.suggestions,
  };
}

/* ---------- Project brief (visitor reviews and submits explicitly) ---------- */
export const BRIEF_Q: { k: BriefKey; q: string; label: string; chips?: string[] }[] = [
  { k: 'what', q: 'What would you like built?', label: 'Project' },
  { k: 'who', q: 'Who is it for?', label: 'For' },
  { k: 'problem', q: 'What problem should it solve?', label: 'Problem' },
  { k: 'kind', q: 'A new platform, or improving an existing one?', label: 'Type', chips: ['New platform', 'Improve existing'] },
  { k: 'timeline', q: 'What timeline do you have in mind?', label: 'Timeline', chips: ['Under 1 month', '1–3 months', '3+ months', 'Not sure'] },
  { k: 'contact', q: 'Your name and email, so he can reply.', label: 'Contact', chips: ['Skip'] },
];

export const briefText = (br: Partial<Brief>) => BRIEF_Q.map((q) => `${q.label}: ${br[q.k] || '—'}`).join('\n');

export function startBrief(seed?: string): { state: BriefState; reply: Reply } {
  const state: BriefState = { step: 0, data: {} };
  if (seed && seed.length > 12) {
    state.data.what = seed;
    state.step = 1;
  }
  const q = BRIEF_Q[state.step];
  return { state, reply: { html: `<p>${q.q}</p><p class="muted">Type “cancel” any time.</p>`, chips: q.chips } };
}

export function briefStep(state: BriefState, text: string): { state: BriefState | null; reply: Reply } {
  if (/^(cancel|stop|quit)$/i.test(text)) return { state: null, reply: { html: '<p>Brief cancelled.</p>', chips: SITE.suggestions } };
  const data = { ...state.data, [BRIEF_Q[state.step].k]: /^skip$/i.test(text) ? '' : text };
  const step = state.step + 1;
  if (step < BRIEF_Q.length) {
    const n = BRIEF_Q[step];
    return { state: { step, data }, reply: { html: `<p>${n.q}</p>`, chips: n.chips } };
  }
  const br = TOOLS.prepare_project_brief(data as Brief);
  const title = br.what.length > 60 ? br.what.slice(0, 57) + '…' : br.what;
  return {
    state: null,
    reply: {
      tools: [['prepare_project_brief']],
      html:
        `<div class="brief"><div class="brief-h">Project brief<span>Ready for review</span></div>` +
        `<h4>${esc(title.replace(/^./, (c) => c.toUpperCase()))}</h4><dl>` +
        BRIEF_Q.slice(1).filter((q) => br[q.k]).map((q) => `<div><dt>${q.label}</dt><dd>${esc(br[q.k])}</dd></div>`).join('') +
        `</dl></div>`,
      acts: [
        { label: 'Submit enquiry', primary: true, do: { type: 'submitBrief', brief: br } },
        { label: 'Start over', do: { type: 'startBrief' } },
      ],
    },
  };
}
