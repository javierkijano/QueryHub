import { Query, Request, User, Activity } from './types';

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    department: 'Data',
    avatar: 'https://picsum.photos/id/1005/200/200',
    reputation: 1250,
    badges: ['Query Doctor', 'Prime Expert'],
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    department: 'Marketing',
    avatar: 'https://picsum.photos/id/1011/200/200',
    reputation: 890,
    badges: ['Connector'],
  },
  {
    id: 'u3',
    name: 'Jordan V.',
    department: 'Engineering',
    avatar: 'https://picsum.photos/id/1025/200/200',
    reputation: 2100,
    badges: ['Top Dept', 'Query Doctor'],
  },
];

export const QUERIES: Query[] = [
  {
    id: 'q1',
    title: 'Adreens Core Revenue (Q3 Adjusted)',
    description: 'The definitive source for Q3 revenue, filtering out test accounts and internal traffic.',
    sql: `SELECT 
  date_trunc('month', transaction_date) as month,
  SUM(amount) as total_revenue,
  COUNT(DISTINCT user_id) as active_users
FROM \`adreens-prod.finance.transactions\`
WHERE 
  status = 'completed'
  AND is_internal = false
  AND transaction_date BETWEEN '2023-07-01' AND '2023-09-30'
GROUP BY 1
ORDER BY 1 DESC`,
    dialect: 'BigQuery',
    author: USERS[0],
    createdAt: '2023-10-05',
    likes: 42,
    forks: 5,
    tags: ['revenue', 'finance', 'prime', 'Q3'],
    metadata: {
      projects: ['adreens-prod'],
      datasets: ['finance'],
      isHeavy: false,
      hasPII: false,
      costEstimate: '~$0.45',
      lastRun: '2 hours ago',
    },
    version: 1.2,
  },
  {
    id: 'q2',
    title: 'User Churn Risk - Last 30 Days',
    description: 'Identifies users who have visited the cancelation page > 3 times but haven\'t churned yet.',
    sql: `WITH risky_behavior AS (
  SELECT user_id, count(*) as visits
  FROM \`adreens-prod.web_logs.pageviews\`
  WHERE page_path = '/settings/cancel'
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  GROUP BY 1
)
SELECT u.email, u.name, rb.visits
FROM risky_behavior rb
JOIN \`adreens-prod.users.pii_data\` u ON u.id = rb.user_id
WHERE rb.visits >= 3`,
    dialect: 'BigQuery',
    author: USERS[2],
    createdAt: '2023-10-12',
    likes: 128,
    forks: 12,
    tags: ['churn', 'risk', 'users'],
    metadata: {
      projects: ['adreens-prod'],
      datasets: ['web_logs', 'users'],
      isHeavy: true,
      hasPII: true,
      costEstimate: '~$2.10',
      lastRun: '10 mins ago',
    },
    version: 2.0,
  },
];

export const REQUESTS: Request[] = [
  {
    id: 'r1',
    title: 'Need Prime subscription funnel drop-off rates',
    description: 'We are seeing a dip in conversions. Need a breakdown by step for mobile users only.',
    requester: USERS[1],
    urgency: 'High',
    status: 'Open',
    bounty: 50,
    createdAt: '2 hours ago',
    responses: 0,
  },
  {
    id: 'r2',
    title: 'Lifetime Value (LTV) by Acquisition Channel',
    description: 'Standard LTV calculation but grouped by the initial utm_source.',
    requester: USERS[0],
    urgency: 'Medium',
    status: 'In Progress',
    bounty: 20,
    createdAt: '1 day ago',
    responses: 2,
  },
];

export const ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'publish', user: USERS[0], targetName: 'Adreens Core Revenue', timestamp: '2h ago' },
  { id: 'a2', type: 'request', user: USERS[1], targetName: 'Prime Funnel Analysis', timestamp: '4h ago' },
  { id: 'a3', type: 'fork', user: USERS[2], targetName: 'User Churn Risk', timestamp: '1d ago' },
];
