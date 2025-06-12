'use client';

import React, { useState } from 'react';
import {
  Card, CardHeader, CardContent, CardActions,
  FormControl, InputLabel, OutlinedInput, Button, Divider, Grid, Typography
} from '@mui/material';

export function PasswordUpdateForm(): React.JSX.Element {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await fetch('http://localhost:8099/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      });

      if (res.ok) {
        setMessage("✅ Mot de passe mis à jour !");
      } else {
        const err = await res.text();
        setMessage("❌ Erreur : " + err);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de la mise à jour.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ mt: 3 }}>
        <CardHeader title="🔒 Changer le mot de passe" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="currentPassword">Mot de passe actuel</InputLabel>
                <OutlinedInput
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  label="Mot de passe actuel"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="newPassword">Nouveau mot de passe</InputLabel>
                <OutlinedInput
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  label="Nouveau mot de passe"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel htmlFor="confirmPassword">Confirmer le nouveau mot de passe</InputLabel>
                <OutlinedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirmer le nouveau mot de passe"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>
            {message && (
              <Grid item xs={12}>
                <Typography color={message.startsWith("✅") ? 'success.main' : 'error'}>{message}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">Changer</Button>
        </CardActions>
      </Card>
    </form>
  );
}
