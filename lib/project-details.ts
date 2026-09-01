export type ProjectDestination = 'case_study' | 'live' | 'github';

export type ProjectDetailSettings = {
  contextHeading: string; contextAccent: string; contextDescription: string; designIntent: string;
  walkthroughHeading: string; walkthroughAccent: string; walkthroughDescription: string;
  systemHeading: string; systemAccent: string; systemDescription: string;
  systemSteps: Array<{ label: string; title: string; description: string }>;
  principles: Array<{ title: string; description: string }>;
  ctaEyebrow: string; ctaHeading: string; ctaAccent: string;
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

export function projectDetails(value: string | null | undefined): ProjectDetailSettings {
  if (!value) return structuredClone(defaultProjectDetails);
  try {
    const parsed = JSON.parse(value) as Partial<ProjectDetailSettings>;
    const steps = Array.isArray(parsed.systemSteps) ? parsed.systemSteps.slice(0, 3) : defaultProjectDetails.systemSteps;
    const principles = Array.isArray(parsed.principles) ? parsed.principles.slice(0, 3) : defaultProjectDetails.principles;
    return {
      contextHeading: asText(parsed.contextHeading, defaultProjectDetails.contextHeading), contextAccent: asText(parsed.contextAccent, defaultProjectDetails.contextAccent),
      contextDescription: asText(parsed.contextDescription, defaultProjectDetails.contextDescription), designIntent: asText(parsed.designIntent, defaultProjectDetails.designIntent),
      walkthroughHeading: asText(parsed.walkthroughHeading, defaultProjectDetails.walkthroughHeading), walkthroughAccent: asText(parsed.walkthroughAccent, defaultProjectDetails.walkthroughAccent), walkthroughDescription: asText(parsed.walkthroughDescription, defaultProjectDetails.walkthroughDescription),
      systemHeading: asText(parsed.systemHeading, defaultProjectDetails.systemHeading), systemAccent: asText(parsed.systemAccent, defaultProjectDetails.systemAccent), systemDescription: asText(parsed.systemDescription, defaultProjectDetails.systemDescription),
      systemSteps: Array.from({ length: 3 }, (_, index) => ({ label: asText(steps[index]?.label, ''), title: asText(steps[index]?.title, ''), description: asText(steps[index]?.description, '') })),
      principles: Array.from({ length: 3 }, (_, index) => ({ title: asText(principles[index]?.title, ''), description: asText(principles[index]?.description, '') })),
      ctaEyebrow: asText(parsed.ctaEyebrow, defaultProjectDetails.ctaEyebrow), ctaHeading: asText(parsed.ctaHeading, defaultProjectDetails.ctaHeading), ctaAccent: asText(parsed.ctaAccent, defaultProjectDetails.ctaAccent),
    };
  } catch { return structuredClone(defaultProjectDetails); }
}
