/**
 * GlobePulse Initial Mock Database
 * Pre-populated articles with realistic content, engagement stats, and categories.
 */
const DEFAULT_ARTICLES = [
  {
    id: "fusion-energy-2026",
    title: "The Dawn of Fusion Energy: A New Era for Global Power",
    summary: "Scientists at the Global Ignition Facility achieve net energy gain for the third consecutive time, paving the way for commercial clean energy grid deployment within the decade.",
    category: "Science",
    readTime: "5 min read",
    publishedDate: "July 12, 2026",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    tags: ["Clean Energy", "Physics", "Innovation", "Global Development"],
    views: 14205,
    likes: 842,
    author: {
      name: "Dr. Aris Thorne",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Lead Science Editor"
    },
    content: `
<p>For decades, nuclear fusion has been the holy grail of clean energy production—constantly promised to be "30 years away." Today, that timeline has collapsed. Researchers at the Global Ignition Facility (GIF) have announced a milestone that marks a definitive turning point in human energy production: achieving a net energy gain (Q > 1.5) for the third consecutive time, with exponentially higher yields than previous experiments.</p>

<h3>The Physics Behind the Breakthrough</h3>
<p>Using a array of 192 ultra-powerful lasers focused onto a tiny gold cylinder containing a deuterium-tritium fuel pellet, the facility generated conditions hotter than the center of the sun. The laser beam compressed the target to 100 times the density of lead, sparking a self-sustaining fusion reaction (thermonuclear burn) that released more energy than the lasers input.</p>

<blockquote class="accent-quote">
  "This is no longer a question of physics feasibility. It is now a challenge of mechanical and materials engineering. We are officially building the foundation for an unlimited, zero-carbon grid."
  <cite>— Dr. Elena Rostova, Director of High Energy Physics</cite>
</blockquote>

<h3>The Road to Commercialization</h3>
<p>While the laboratory results are historic, scaling this into a functioning commercial power station is the next massive hurdle. Engineering firms are already partnering with research labs to design "Pilot Grid-Connectors"—reactors capable of pulsing 10 times per second, compared to the current laboratory rate of once every few hours.</p>

<p>Industry experts predict that the first commercial fusion pilot plants will begin delivering clean energy to national grids by 2032. The economic implications are staggering. Countries that transition early to fusion will see manufacturing costs plummet, desalination operations scale rapidly, and carbon emissions drop to near-zero levels.</p>

<h3>What This Means for the Public</h3>
<ul>
  <li><strong>Virtually Unlimited Power:</strong> A single cup of fusion fuel has the energy equivalent of 2 million tons of coal.</li>
  <li><strong>Safe Operations:</strong> Unlike nuclear fission, fusion has zero risk of runaway melt-downs and produces no long-lived radioactive waste.</li>
  <li><strong>Geopolitical Rebalancing:</strong> Energy dependence will shift from fossil-fuel rich regions to technological innovators.</li>
</ul>
    `,
    comments: [
      {
        id: "c1",
        authorName: "Sarah Connor",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
        date: "2 hours ago",
        text: "This is absolutely monumental. If we can commercialize this in a decade, it solves our climate crisis and shifts the economic paradigm completely. Science rules!",
        likes: 42
      },
      {
        id: "c2",
        authorName: "Markus Aurel",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
        date: "5 hours ago",
        text: "I remain slightly skeptical about the 2032 timeline. The materials science needed to withstand constant neutron bombardment in a commercial reactor is still in its infancy. But it's a huge step!",
        likes: 19
      }
    ]
  },
  {
    id: "deep-sea-trench-2026",
    title: "Exploring the Mariana Trench: New Deep-Sea Ecosystem Discovered",
    summary: "A manned deep-sea exploration vehicle returns from the Challenger Deep with data revealing a vibrant, bioluminescent ecosystem thriving around active hydrothermal vents.",
    category: "World",
    readTime: "7 min read",
    publishedDate: "July 11, 2026",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Oceanography", "Biology", "Deep Sea", "Discovery"],
    views: 9840,
    likes: 512,
    author: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Global Geography Editor"
    },
    content: `
<p>Ten thousand meters beneath the ocean surface, where pressures exceed a thousand atmospheres and sunlight has never reached, life is not only present—it is thriving. The crew of the deep-sea research vessel <em>Triton V</em> has successfully completed a series of record-breaking dives into the Challenger Deep, returning with stunning footage and samples of an entirely undocumented deep-sea ecosystem.</p>

<h3>Life in the Abyssal Darkness</h3>
<p>The discovery was made near a newly formed hydrothermal vent field, dubbed the "Emerald Spire." These vents spew mineral-rich water heated to over 380°C directly into the near-freezing ocean water. Rather than cooking surrounding organisms, these vents serve as hot-spots of chemical energy, replacing sunlight with chemosynthesis.</p>

<blockquote class="accent-quote">
  "We observed species that look like glass sculptures, glowing with dynamic bioluminescent pulses to communicate in the absolute dark. It feels like exploring a different planet altogether."
  <cite>— Captain Maya Lin, Triton V Explorer</cite>
</blockquote>

<h3>Bizarre Adaptations</h3>
<p>Among the cataloged organisms are several highly unusual species:</p>
<ol>
  <li><strong>Glass-Carapace Crabs:</strong> Crustaceans with transparent armor that allows view of internal copper-based oxygenation organs.</li>
  <li><strong>Chronos Jellyfish:</strong> A bioluminescent jellyfish whose glowing signals pulse in complex mathematical sequences.</li>
  <li><strong>Chemosynthetic Tubeworms:</strong> Growing up to three meters long, these worms live in symbiotic relationships with sulfur-eating bacteria.</li>
</ol>

<p>The biochemical properties of these deep-sea organisms are already drawing interest from pharmaceutical companies. The enzymes used by these creatures to survive extreme heat, pressure, and toxic sulfur compounds could revolutionize medicine synthesis, industrial catalysis, and bioremediation.</p>
    `,
    comments: [
      {
        id: "c3",
        authorName: "Liam Carter",
        authorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80",
        date: "1 day ago",
        text: "The ocean is so much more mysterious than outer space. Who knows what else is hiding in those deep trenches. Magnificent discovery!",
        likes: 67
      }
    ]
  },
  {
    id: "ai-art-collaboration-2026",
    title: "AI and the Future of Creativity: Collaboration or Replacement?",
    summary: "As generative AI models achieve human-level synthesis in visual and literary arts, creators are reshaping their workflows to blend neural assets with raw human emotion.",
    category: "Tech",
    readTime: "4 min read",
    publishedDate: "July 10, 2026",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    tags: ["Artificial Intelligence", "Digital Art", "Culture", "Ethics"],
    views: 18900,
    likes: 1204,
    author: {
      name: "Clara Reynolds",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Culture & Tech Columnist"
    },
    content: `
<p>The art world is undergoing its most radical transformation since the invention of the camera. Generative Artificial Intelligence tools are no longer just toys; they are sophisticated creative engines capable of painting, composing, and drafting at speed. But instead of replacing the artist, a new generation of creators is discovering that the best results come from high-concept collaboration.</p>

<h3>The Era of the Synthesist</h3>
<p>Today's digital artists are branding themselves "Creative Directors" rather than classic illustrators. By leveraging neural networks, they generate dozens of concept iterations in minutes, selecting promising paths and manually refining them with digital paints, textures, and emotional weight.</p>

<blockquote class="accent-quote">
  "AI gives me a canvas of infinite ideas, but it has no heart. It doesn't know pain, joy, or nostalgia. That's my job. I curate the pixels with human intent."
  <cite>— Leo Morello, Digital Artist</cite>
</blockquote>

<h3>Legal and Ethical Crossroads</h3>
<p>The rapid rise of these tools hasn't been without controversy. Heated debates regarding copyrighted training data, fair licensing, and attribution continue to rage in international courts. Major artists have filed class-actions, demanding that AI models exclude their styles from training databases unless explicitly compensated.</p>

<p>Ultimately, the industry is moving towards a hybrid registry model, where artists can license their artistic style models to agencies, earning royalties whenever a generated asset references their unique visual signature. Rather than destroying the creative career, AI may expand it into passive licensing models.</p>
    `,
    comments: [
      {
        id: "c4",
        authorName: "Eva Vance",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
        date: "2 days ago",
        text: "I think the photography comparison is perfect. People thought photography would kill painting, but it just pushed painting into abstraction (Impressionism, Cubism) and created a new medium. AI will do the same.",
        likes: 110
      },
      {
        id: "c5",
        authorName: "Julian K.",
        authorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80",
        date: "2 days ago",
        text: "The copyright debate is huge. The system needs to respect original artists, otherwise the fuel for these models will dry up.",
        likes: 35
      }
    ]
  },
  {
    id: "green-bonds-surge-2026",
    title: "Global Market Shift: Green Bonds Surge to Record Highs",
    summary: "Institutional investors flock to environmental and social impact bonds, signaling a major transition in global capital flow toward sustainable infrastructure.",
    category: "Business",
    readTime: "6 min read",
    publishedDate: "July 09, 2026",
    coverImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
    tags: ["Finance", "Sustainability", "Economy", "Green Tech"],
    views: 7540,
    likes: 310,
    author: {
      name: "Richard Vance",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      role: "Senior Financial Analyst"
    },
    content: `
<p>A quiet revolution is happening in the debt markets. Green bonds—fixed-income instruments specifically earmarked to fund climate and environmental projects—have surged in popularity, representing a record 22% of all new corporate debt issued in the first half of 2026.</p>

<h3>Aligning Returns with Responsibility</h3>
<p>For decades, sustainable investing was considered a secondary objective for major pension funds and sovereign wealth entities. Today, regulatory changes, consumer pressure, and actual climate risk are forcing financial institutions to reallocate capital. Clean energy, public transit, and carbon infrastructure are now viewed as safer, long-term defensive plays compared to legacy oil and coal assets.</p>

<blockquote class="accent-quote">
  "Capital is coward, but it is also rational. It flows to where future growth lies, and right now, the growth is undeniably in carbon mitigation and resource resilience."
  <cite>— Sophia Martinez, Chief Investment Officer at Zenith Mutual</cite>
</blockquote>

<h3>The Risk of Greenwashing</h3>
<p>As money pours in, auditors are tightening the definition of what qualifies as "green." Regulatory frameworks, such as the EU Sustainable Finance Taxonomy, require strict reporting on how bond proceeds are allocated, preventing companies from using sustainability branding to pay off standard operational debts.</p>
    `,
    comments: [
      {
        id: "c6",
        authorName: "Oliver Wood",
        authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80",
        date: "3 days ago",
        text: "Finally, the finance sector is putting its money where its mouth is. This is the only way we get real change—by making green projects more profitable and accessible to fund.",
        likes: 24
      }
    ]
  }
];
