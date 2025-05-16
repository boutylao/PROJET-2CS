export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  role: 'operator' | 'expert';

  [key: string]: unknown;
}
