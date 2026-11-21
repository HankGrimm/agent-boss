// Seed agents for AgentBoss on Monad testnet.
// Prices are in MON. Ratings are the on-chain reputation seed.
// When the contract is deployed, register these 6 agents on-chain IN ORDER
// so on-chain service ids 1-6 match the ids below.
export interface Service {
  id: string;
  name: string;
  description: string;
  pricePerCall: number; // MON
  tags: string[];
  provider: string;
  category: string;
  icon?: string;
  rating?: number;
  ratingCount?: number;
}

export const services: Service[] = [
  {
    id: '1',
    name: 'Logo Designer',
    description:
      'Brand identity and logo design. Send a brief, get a full logo concept with colors, typography and usage notes — ready to ship.',
    pricePerCall: 0.8,
    tags: ['Design', 'Logo', 'Branding'],
    provider: 'PixelNose',
    category: 'Design',
    icon: '🎨',
    rating: 4.9,
    ratingCount: 132,
  },
  {
    id: '2',
    name: 'Data Analyst',
    description:
      'Turns raw sales, product or on-chain data into clear findings: trends, outliers and what to do next. Handles CSVs and tables.',
    pricePerCall: 1.2,
    tags: ['Data', 'Analytics', 'Reports'],
    provider: 'DataHawk',
    category: 'Data',
    icon: '📊',
    rating: 4.8,
    ratingCount: 98,
  },
  {
    id: '3',
    name: 'Video Script Writer',
    description:
      'Writes tight 30-90 second video scripts with hooks, beats and a call to action. Built for shorts, ads and product demos.',
    pricePerCall: 0.6,
    tags: ['Video', 'Script', 'Writing'],
    provider: 'ScriptSmith',
    category: 'Writing',
    icon: '🎬',
    rating: 4.9,
    ratingCount: 167,
  },
  {
    id: '4',
    name: 'Code Reviewer',
    description:
      'Reviews smart contracts and backend code for bugs, gas waste and security issues. Returns a ranked list of findings with fixes.',
    pricePerCall: 1.0,
    tags: ['Code', 'Review', 'Security'],
    provider: 'CodeGuard',
    category: 'Code',
    icon: '🔍',
    rating: 4.7,
    ratingCount: 84,
  },
  {
    id: '5',
    name: 'Researcher',
    description:
      'Deep research on any topic: competitors, markets, tech. Returns a sourced summary with the key numbers and what matters.',
    pricePerCall: 0.9,
    tags: ['Research', 'Analysis', 'Reports'],
    provider: 'DeepDive',
    category: 'Research',
    icon: '🔬',
    rating: 4.8,
    ratingCount: 76,
  },
  {
    id: '6',
    name: 'Voiceover Artist',
    description:
      'Natural voiceover for videos, ads and podcasts. Pick a tone, send a script, get studio-quality audio back.',
    pricePerCall: 0.5,
    tags: ['Voiceover', 'Audio', 'Narration'],
    provider: 'VoiceBox',
    category: 'Audio',
    icon: '🎙️',
    rating: 4.9,
    ratingCount: 143,
  },
];
