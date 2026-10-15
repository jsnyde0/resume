// Skills section of the /resume file tree: one row per file under skills/<folder>/.
// Order is the render order; src/lib/resume-tree.ts derives both the tree and the panels from it.

export interface SkillFile {
  folder: string;
  filename: string;
  html: string;
}

export const skillFiles: SkillFile[] = [
  {
    folder: 'agentic-engineering',
    filename: 'harness-factory.md',
    html: `
<div class="ghv-md">
<h1>harness-factory.md</h1>
<p>I build and own my agent harness: the prompts, tools, context routing, and review loops that turn an LLM into a system that does real work, unattended.</p>
<h2>Technologies</h2>
<ul>
  <li>pi, a harness I can change all the way down</li>
  <li>Custom skills, roles, and tools</li>
  <li>Subagents and fresh-context review loops</li>
  <li>Prompt templates and context routing</li>
</ul>
<h2>Proof</h2>
<p>The whole system runs: <a href="/factory/" class="ghv-link">/factory</a>.</p>
</div>`,
  },
  {
    folder: 'agentic-engineering',
    filename: 'disposable-orchestrators.md',
    html: `
<div class="ghv-md">
<h1>disposable-orchestrators.md</h1>
<p>I architect agent work so state lives in the substrate, not the agent. Each orchestrator reads a graph of goals, makes one move, writes its decision back, and dies, so any agent can crash and the work picks up where it left off.</p>
<h2>Technologies</h2>
<ul>
  <li>Work as a dependency graph, not a chat log</li>
  <li>Tiered memory kept by lifecycle</li>
  <li>Disposable orchestrators over shared substrate</li>
  <li>Crash-resumable, parallel-safe workflows</li>
</ul>
<h2>Proof</h2>
<p>The work loop behind <a href="/factory/" class="ghv-link">/factory</a>, including a planner that proposes the next move.</p>
</div>`,
  },
  {
    folder: 'agentic-engineering',
    filename: 'sandboxed-autonomy.md',
    html: `
<div class="ghv-md">
<h1>sandboxed-autonomy.md</h1>
<p>I run agents unattended by putting hard limits around them: containerized execution, every shell command checked before it runs, and credentials the agent never holds directly.</p>
<h2>Technologies</h2>
<ul>
  <li>rip-cage, a container plus command-gating I built</li>
  <li>Credential isolation through a proxy</li>
  <li>Always-on host, not a laptop</li>
  <li>Safe-to-run-unattended execution</li>
</ul>
<h2>Proof</h2>
<p>Open source: <a href="https://github.com/jsnyde0/rip-cage" class="ghv-link">rip-cage</a>.</p>
</div>`,
  },
  {
    folder: 'agentic-engineering',
    filename: 'llm-app-engineering.md',
    html: `
<div class="ghv-md">
<h1>llm-app-engineering.md</h1>
<p>Beyond tooling my own workflow, I build agentic apps: LLM calls wrapped in tools, structured output, and guardrails meant to hold up in production.</p>
<h2>Technologies</h2>
<ul>
  <li>LLM-powered features and agents</li>
  <li>Tool use and structured output</li>
  <li>Retrieval and context design</li>
  <li>Evaluation and guardrails</li>
</ul>
</div>`,
  },
  {
    folder: 'web-development',
    filename: 'full-stack-web.md',
    html: `
<div class="ghv-md">
<h1>full-stack-web.md</h1>
<p>I build full-stack web apps across backend, frontend, and the data layer behind them. I default to hypermedia-driven apps: server-rendered HTML with focused interactivity and little client-side state. I build with React too, but reach for it when an app genuinely needs a rich client.</p>
<h2>Technologies</h2>
<ul>
  <li>Django, PostgreSQL, MongoDB</li>
  <li>HTMX, Tailwind, Astro</li>
  <li>React, JavaScript</li>
</ul>
<h2>Approach</h2>
<p>Why hypermedia-driven: <a href="https://htmx.org/essays/hypermedia-driven-applications/" class="ghv-link">htmx.org/essays/hypermedia-driven-applications</a>.</p>
</div>`,
  },
  {
    folder: 'web-development',
    filename: 'apis-and-deployment.md',
    html: `
<div class="ghv-md">
<h1>apis-and-deployment.md</h1>
<p>I build APIs, containerize apps, and deploy them with practical CI/CD.</p>
<h2>Technologies</h2>
<ul>
  <li>Django REST Framework</li>
  <li>Pydantic</li>
  <li>Docker</li>
  <li>DigitalOcean</li>
  <li>GitHub Actions</li>
</ul>
</div>`,
  },
  {
    folder: 'web-development',
    filename: 'analytics-instrumentation.md',
    html: `
<div class="ghv-md">
<h1>analytics-instrumentation.md</h1>
<p>I instrument product and marketing data so teams can trust what they measure.</p>
<h2>Technologies</h2>
<ul>
  <li>PostHog</li>
  <li>GA4</li>
  <li>BigQuery</li>
  <li>Dataform</li>
  <li>Looker Studio</li>
</ul>
</div>`,
  },
  {
    folder: 'data-science',
    filename: 'bayesian-modeling.md',
    html: `
<div class="ghv-md">
<h1>bayesian-modeling.md</h1>
<p>I use Bayesian modelling when signals are noisy and decisions still need to be made.</p>
<h2>Technologies</h2>
<ul>
  <li>Python</li>
  <li>PyMC</li>
  <li>pandas</li>
  <li>NumPy</li>
  <li>Marketing Mix Models</li>
</ul>
<h2>Proof</h2>
<p>Built a Bayesian MMM at Moonbird.</p>
</div>`,
  },
  {
    folder: 'data-science',
    filename: 'computer-vision.md',
    html: `
<div class="ghv-md">
<h1>computer-vision.md</h1>
<p>I worked on medical image processing, 3D meshes, and computer vision systems.</p>
<h2>Technologies</h2>
<ul>
  <li>C++</li>
  <li>Computer vision</li>
  <li>Medical image processing</li>
  <li>3D mesh processing</li>
  <li>Deep learning consulting</li>
</ul>
<h2>Proof</h2>
<p>Created <a href="https://github.com/TheWebMonks/meshmonk" class="ghv-link">MeshMonk</a>; used or cited in 140+ research projects.</p>
</div>`,
  },
  {
    folder: 'data-science',
    filename: 'data-pipelines.md',
    html: `
<div class="ghv-md">
<h1>data-pipelines.md</h1>
<p>I build ELT pipelines that turn source data into models, dashboards, and decisions.</p>
<h2>Technologies</h2>
<ul>
  <li>Python</li>
  <li>SQL</li>
  <li>BigQuery</li>
  <li>Dataform</li>
  <li>API and database extraction</li>
</ul>
<h2>Proof</h2>
<p>Built the Moonbird pipeline behind growth reporting and modelling.</p>
</div>`,
  },
  {
    folder: 'growth-engineering',
    filename: 'performance-marketing.md',
    html: `
<div class="ghv-md">
<h1>performance-marketing.md</h1>
<p>I combine acquisition, experiments, automation, and measurement into one growth loop.</p>
<h2>Technologies</h2>
<ul>
  <li>Paid search</li>
  <li>Paid social</li>
  <li>Email marketing</li>
  <li>SEO and CRO</li>
  <li>Marketing automation</li>
</ul>
<h2>Proof</h2>
<p>At Moonbird, grew monthly revenue from four to six figures in 3.5 years.</p>
</div>`,
  },
  {
    folder: 'growth-engineering',
    filename: 'server-side-tracking.md',
    html: `
<div class="ghv-md">
<h1>server-side-tracking.md</h1>
<p>I preserve attribution signal by sending conversion events from the backend.</p>
<h2>Technologies</h2>
<ul>
  <li>Server-side tracking</li>
  <li>Conversion APIs</li>
  <li>Backend event forwarding</li>
  <li>Ad-platform measurement</li>
</ul>
<h2>Proof</h2>
<p>Built and maintained server-side tracking for Moonbird's ad stack.</p>
</div>`,
  },
  {
    folder: 'growth-engineering',
    filename: 'bayesian-mmm.md',
    html: `
<div class="ghv-md">
<h1>bayesian-mmm.md</h1>
<p>I model channel contribution when last-click attribution is too noisy to trust.</p>
<h2>Technologies</h2>
<ul>
  <li>Python</li>
  <li>PyMC</li>
  <li>Bayesian modelling</li>
  <li>Marketing Mix Modelling</li>
  <li>Diminishing-return and lag effects</li>
</ul>
<h2>Proof</h2>
<p>Used at Moonbird to guide marketing budget allocation.</p>
</div>`,
  },
  {
    folder: 'founder-operator',
    filename: 'strategy.md',
    html: `
<div class="ghv-md">
<h1>strategy.md</h1>
<p>I founded and ran an impact-first organization focused on digital jobs and training.</p>
<h2>Methods</h2>
<ul>
  <li>Vision and strategy</li>
  <li>Market selection</li>
  <li>Partnership design</li>
  <li>Funding approach</li>
</ul>
<h2>Proof</h2>
<p>Humainly supported 30 people through NGO partnerships in Venezuela and Nigeria.</p>
</div>`,
  },
  {
    folder: 'founder-operator',
    filename: 'teams-and-ops.md',
    html: `
<div class="ghv-md">
<h1>teams-and-ops.md</h1>
<p>I ran small international teams with explicit roles and distributed authority.</p>
<h2>Methods</h2>
<ul>
  <li>Holacracy</li>
  <li>Hiring and onboarding</li>
  <li>Role design</li>
  <li>Remote operations</li>
</ul>
<h2>Proof</h2>
<p>Humainly operated across Belgium, Venezuela, and Nigeria.</p>
</div>`,
  },
  {
    folder: 'founder-operator',
    filename: 'learning-from-failures.md',
    html: `
<div class="ghv-md">
<h1>learning-from-failures.md</h1>
<p>Humainly did not scale before founder burnout; that changed how I think about pace and sustainability.</p>
<h2>Methods</h2>
<ul>
  <li>Retrospective practice</li>
  <li>Scope control</li>
  <li>Founder sustainability</li>
  <li>Impact-model evaluation</li>
</ul>
<h2>Proof</h2>
<p>The mission worked; the growth rate and operating model did not.</p>
</div>`,
  },
];
