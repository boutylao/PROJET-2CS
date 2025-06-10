// src/hooks/use-user-profile.ts
'use client';

import { useEffect, useState } from 'react';

export function useUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const username = localUser?.username;

    if (!username) return;

    fetch(`http://localhost:8099/api/user/profile?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Erreur de chargement du profil:', e);
        setLoading(false);
      });
  }, []);

  return { profile, loading };
}
