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
const contextualText = (value: unknown, generic: string, fallback: string) => typeof value === 'string' && value.trim() && value !== generic ? value : fallback;

function contextualProjectDetails(project?: ProjectDetailContext): ProjectDetailSettings {
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

export function projectDetails(value: string | null | undefined, project?: ProjectDetailContext): ProjectDetailSettings {
  const defaults = contextualProjectDetails(project);
  if (!value) return defaults;
  try {
    const parsed = JSON.parse(value) as Partial<ProjectDetailSettings>;
    const hasGenericSteps = JSON.stringify(parsed.systemSteps) === JSON.stringify(defaultProjectDetails.systemSteps);
    const hasGenericPrinciples = JSON.stringify(parsed.principles) === JSON.stringify(defaultProjectDetails.principles);
    const steps = Array.isArray(parsed.systemSteps) && !hasGenericSteps ? parsed.systemSteps.slice(0, 3) : defaults.systemSteps;
    const principles = Array.isArray(parsed.principles) && !hasGenericPrinciples ? parsed.principles.slice(0, 3) : defaults.principles;
    return {
      contextHeading: contextualText(parsed.contextHeading, defaultProjectDetails.contextHeading, defaults.contextHeading), contextAccent: contextualText(parsed.contextAccent, defaultProjectDetails.contextAccent, defaults.contextAccent),
      contextDescription: contextualText(parsed.contextDescription, defaultProjectDetails.contextDescription, defaults.contextDescription), designIntent: contextualText(parsed.designIntent, defaultProjectDetails.designIntent, defaults.designIntent),
      walkthroughHeading: contextualText(parsed.walkthroughHeading, defaultProjectDetails.walkthroughHeading, defaults.walkthroughHeading), walkthroughAccent: contextualText(parsed.walkthroughAccent, defaultProjectDetails.walkthroughAccent, defaults.walkthroughAccent), walkthroughDescription: contextualText(parsed.walkthroughDescription, defaultProjectDetails.walkthroughDescription, defaults.walkthroughDescription),
      systemHeading: contextualText(parsed.systemHeading, defaultProjectDetails.systemHeading, defaults.systemHeading), systemAccent: contextualText(parsed.systemAccent, defaultProjectDetails.systemAccent, defaults.systemAccent), systemDescription: contextualText(parsed.systemDescription, defaultProjectDetails.systemDescription, defaults.systemDescription),
      systemSteps: Array.from({ length: 3 }, (_, index) => ({ label: asText(steps[index]?.label, ''), title: asText(steps[index]?.title, ''), description: asText(steps[index]?.description, '') })),
      principles: Array.from({ length: 3 }, (_, index) => ({ title: asText(principles[index]?.title, ''), description: asText(principles[index]?.description, '') })),
      ctaEyebrow: contextualText(parsed.ctaEyebrow, defaultProjectDetails.ctaEyebrow, defaults.ctaEyebrow), ctaHeading: contextualText(parsed.ctaHeading, defaultProjectDetails.ctaHeading, defaults.ctaHeading), ctaAccent: contextualText(parsed.ctaAccent, defaultProjectDetails.ctaAccent, defaults.ctaAccent),
    };
  } catch { return defaults; }
}
