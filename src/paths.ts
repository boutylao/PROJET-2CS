


export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    // overview: '/dashboard',
    account: '/dashboard/account',
    settings: '/dashboard/settings', // ImportationRapport
    historique: '/dashboard/operations',
    Rapports: '/dashboard/rapports',
    Analyse: '/dashboard/analyse',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
