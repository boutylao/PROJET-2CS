'use client';

import * as React from 'react';
import {
  Card, CardHeader, CardContent, Divider, Grid, FormControl,
  InputLabel, OutlinedInput, CardActions, Button, Box
} from '@mui/material';

export function PasswordUpdateForm(): React.JSX.Element {
  const [formData, setFormData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Le nouveau mot de passe et la confirmation ne correspondent pas.");
      return;
    }

    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const username = localUser?.username;

    try {
      const res = await fetch('http://localhost:8099/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Erreur serveur');
      }

      alert("Mot de passe mis à jour !");
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader title="Changer le mot de passe" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="currentPassword">Mot de passe actuel</InputLabel>
                <OutlinedInput
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  label="Mot de passe actuel"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}> </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="newPassword">Nouveau mot de passe</InputLabel>
                <OutlinedInput
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  label="Nouveau mot de passe"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="confirmPassword">Confirmer le mot de passe</InputLabel>
                <OutlinedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  label="Confirmer le mot de passe"
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Mettre à jour
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
