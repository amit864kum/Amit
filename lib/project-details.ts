export type ProjectDestination = 'case_study' | 'live' | 'github';

export type ProjectDetailSettings = {
  contextHeading: string; contextAccent: string; contextDescription: string; designIntent: string;
  walkthroughHeading: string; walkthroughAccent: string; walkthroughDescription: string;
  systemHeading: string; systemAccent: string; systemDescription: string;
  systemSteps: Array<{ label: string; title: string; description: string }>;
  principles: Array<{ title: string; description: string }>;
  ctaEyebrow: string; ctaHeading: string; ctaAccent: string;
};

type ProjectDetailContext = {
  title: string;
  category: string;
  summary: string;
  body: string;
  tech: string;
};

export const defaultProjectDetails: ProjectDetailSettings = {
  contextHeading: 'From complexity', contextAccent: 'to clarity.',
  contextDescription: 'A focused look at the thinking, architecture, and product decisions behind the work.',
  designIntent: 'Make the system understandable at the interface, dependable underneath, and useful in the real workflow.',
  walkthroughHeading: 'Inside the product,', walkthroughAccent: 'step by step.',
  walkthroughDescription: 'Detailed decisions, workflows, and interface views arranged in the order the project was designed to be understood.',
  systemHeading: 'The build behind', systemAccent: 'the experience.',
  systemDescription: 'Technology was selected around the problem—not the trend—so every layer has a clear responsibility.',
  systemSteps: [
    { label: 'Frame', title: 'Define the real problem.', description: 'Align the user need, technical constraints, and outcome before choosing the implementation.' },
    { label: 'Build', title: 'Connect every layer.', description: 'Shape the interface, application logic, and infrastructure as one understandable system.' },
    { label: 'Prove', title: 'Validate the workflow.', description: 'Test the complete path against real usage, edge cases, and dependable delivery.' },
  ],
  principles: [
    { title: 'Clarity first', description: 'Technical depth becomes an interface people can confidently navigate.' },
    { title: 'Systems thinking', description: 'Product choices connect to dependable architecture and observable workflows.' },
    { title: 'Built for reality', description: 'The experience accounts for practical constraints, edge cases, and change.' },
  ],
  ctaEyebrow: 'Have a complex product in mind?', ctaHeading: "Let's make it clear,", ctaAccent: 'useful, and real.',
};

const asText = (value: unknown, fallback: string) => typeof value === 'string' ? value : fallback;
const normalizedText = (value: unknown) => typeof value === 'string'
  ? value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  : '';
const authoredText = (value: unknown, rejected: unknown[], fallback = '') => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return fallback;
  const normalized = normalizedText(text);
  return rejected.some((candidate) => normalized && normalized === normalizedText(candidate)) ? fallback : text;
};

function legacyContextualProjectDetails(project?: ProjectDetailContext): ProjectDetailSettings {
  if (!project) return structuredClone(defaultProjectDetails);
  const tools = project.tech.split(',').map((item) => item.trim()).filter(Boolean);
  const primaryTools = tools.slice(0, 3).join(', ');
  const discipline = project.category.split('/')[0].trim().toLowerCase();
  return {
    contextHeading: 'The challenge behind',
    contextAccent: project.title + '.',
    contextDescription: project.summary,
    designIntent: project.body,
    walkthroughHeading: 'Inside the product,',
    walkthroughAccent: 'decision by decision.',
    walkthroughDescription: `The project story connects the ${discipline} problem to the implementation choices and final delivery.`,
    systemHeading: 'How the system',
    systemAccent: 'comes together.',
    systemDescription: primaryTools ? `The architecture combines ${primaryTools} around the workflow described above.` : 'Each layer is tied directly to the product workflow and delivery constraints.',
    systemSteps: [
      { label: 'Problem', title: `Frame the ${discipline} workflow.`, description: project.summary },
      { label: 'Architecture', title: primaryTools ? `Connect ${tools.slice(0, 2).join(' and ')}.` : 'Connect the product layers.', description: primaryTools ? `Use ${primaryTools} where each tool has a clear responsibility in the system.` : project.body },
      { label: 'Delivery', title: 'Validate the complete path.', description: 'Check the end-to-end workflow, failure states, and production constraints before release.' },
    ],
    principles: [
      { title: 'Product outcome', description: project.summary },
      { title: 'Implementation', description: primaryTools ? `Built around ${primaryTools}, with the remaining stack supporting delivery and operations.` : project.body },
      { title: 'Project context', description: project.body },
    ],
    ctaEyebrow: 'Have a related challenge?', ctaHeading: "Let's shape the right", ctaAccent: 'product and system.',
  };
}

function minimalProjectDetails(): ProjectDetailSettings {
  return {
    contextHeading: 'Project context', contextAccent: '', contextDescription: '', designIntent: '',
    walkthroughHeading: 'Inside the product,', walkthroughAccent: 'step by step.', walkthroughDescription: '',
    systemHeading: '', systemAccent: '', systemDescription: '', systemSteps: [], principles: [],
    ctaEyebrow: '', ctaHeading: '', ctaAccent: '',
  };
}

function sameSteps(left: unknown, right: unknown) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  const signature = (items: unknown[]) => items.map((item) => {
    const value = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return [normalizedText(value.label), normalizedText(value.title), normalizedText(value.description)];
  });
  return JSON.stringify(signature(left)) === JSON.stringify(signature(right));
}

function samePrinciples(left: unknown, right: unknown) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  const signature = (items: unknown[]) => items.map((item) => {
    const value = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return [normalizedText(value.title), normalizedText(value.description)];
  });
  return JSON.stringify(signature(left)) === JSON.stringify(signature(right));
}

export function projectDetails(value: string | null | undefined, project?: ProjectDetailContext): ProjectDetailSettings {
  const defaults = minimalProjectDetails();
  const legacy = legacyContextualProjectDetails(project);
  if (!value) return defaults;
  try {
    const parsed = JSON.parse(value) as Partial<ProjectDetailSettings>;
    const hasGeneratedSteps = sameSteps(parsed.systemSteps, defaultProjectDetails.systemSteps) || sameSteps(parsed.systemSteps, legacy.systemSteps);
    const hasGeneratedPrinciples = samePrinciples(parsed.principles, defaultProjectDetails.principles) || samePrinciples(parsed.principles, legacy.principles);
    const steps = Array.isArray(parsed.systemSteps) && !hasGeneratedSteps ? parsed.systemSteps.slice(0, 3) : [];
    const principles = Array.isArray(parsed.principles) && !hasGeneratedPrinciples ? parsed.principles.slice(0, 3) : [];
    const repeatedProjectCopy = project ? [project.summary, project.body] : [];
    return {
      contextHeading: authoredText(parsed.contextHeading, [defaultProjectDetails.contextHeading, legacy.contextHeading], defaults.contextHeading),
      contextAccent: authoredText(parsed.contextAccent, [defaultProjectDetails.contextAccent, legacy.contextAccent], defaults.contextAccent),
      contextDescription: authoredText(parsed.contextDescription, [defaultProjectDetails.contextDescription, legacy.contextDescription, ...repeatedProjectCopy]),
      designIntent: authoredText(parsed.designIntent, [defaultProjectDetails.designIntent, legacy.designIntent, ...repeatedProjectCopy]),
      walkthroughHeading: authoredText(parsed.walkthroughHeading, [defaultProjectDetails.walkthroughHeading, legacy.walkthroughHeading], defaults.walkthroughHeading),
      walkthroughAccent: authoredText(parsed.walkthroughAccent, [defaultProjectDetails.walkthroughAccent, legacy.walkthroughAccent], defaults.walkthroughAccent),
      walkthroughDescription: authoredText(parsed.walkthroughDescription, [defaultProjectDetails.walkthroughDescription, legacy.walkthroughDescription]),
      systemHeading: authoredText(parsed.systemHeading, [defaultProjectDetails.systemHeading, legacy.systemHeading]),
      systemAccent: authoredText(parsed.systemAccent, [defaultProjectDetails.systemAccent, legacy.systemAccent]),
      systemDescription: authoredText(parsed.systemDescription, [defaultProjectDetails.systemDescription, legacy.systemDescription, ...repeatedProjectCopy]),
      systemSteps: steps.map((step) => ({
        label: asText(step?.label, '').trim(),
        title: asText(step?.title, '').trim(),
        description: authoredText(step?.description, repeatedProjectCopy),
      })),
      principles: principles.map((principle) => ({
        title: asText(principle?.title, '').trim(),
        description: authoredText(principle?.description, repeatedProjectCopy),
      })),
      ctaEyebrow: authoredText(parsed.ctaEyebrow, [defaultProjectDetails.ctaEyebrow, legacy.ctaEyebrow]),
      ctaHeading: authoredText(parsed.ctaHeading, [defaultProjectDetails.ctaHeading, legacy.ctaHeading]),
      ctaAccent: authoredText(parsed.ctaAccent, [defaultProjectDetails.ctaAccent, legacy.ctaAccent]),
    };
  } catch { return defaults; }
}
