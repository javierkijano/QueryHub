export type User = {
  id: string;
  name: string;
  department: 'Marketing' | 'Engineering' | 'Finance' | 'Product' | 'Data';
  avatar: string;
  reputation: number;
  badges: string[];
};

export type QueryMetadata = {
  projects: string[];
  datasets: string[];
  isHeavy: boolean;
  hasPII: boolean;
  costEstimate: string;
  lastRun?: string;
};

export type Query = {
  id: string;
  title: string;
  description: string;
  sql: string;
  dialect: 'BigQuery' | 'Postgres' | 'Snowflake';
  author: User;
  createdAt: string;
  likes: number;
  forks: number;
  tags: string[];
  metadata: QueryMetadata;
  version: number;
  parentId?: string; // For forks
};

export type Request = {
  id: string;
  title: string;
  description: string;
  requester: User;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved' | 'In Progress';
  bounty: number; // Points
  createdAt: string;
  responses: number;
};

export type Activity = {
  id: string;
  type: 'publish' | 'request' | 'fork' | 'resolve';
  user: User;
  targetName: string; // Query title or Request title
  timestamp: string;
};
