'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useUserProfile } from '@/hooks/use-user-profile';

export function AccountInfo(): React.JSX.Element {
  const { profile, loading } = useUserProfile();

  if (loading) return <p>Chargement...</p>;
  if (!profile) return <p>Profil non trouvé.</p>;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src="/assets/avatar.png" sx={{ height: 80, width: 80 }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">
              {profile.prenom} {profile.nom}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {profile.wilaya}, Algérie
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Modifier la photo
        </Button>
      </CardActions>
    </Card>
  );
}
