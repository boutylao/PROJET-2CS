'use client';

import * as React from 'react';
import {
  Button, Card, CardActions, CardContent, CardHeader,
  Divider, FormControl, InputLabel, OutlinedInput, Select, MenuItem, Grid, SelectChangeEvent
} from '@mui/material';

import { useUserProfile } from '@/hooks/use-user-profile';

const wilayas = [
  { value: "01", label: "Adrar" },
  { value: "02", label: "Chlef" },
  { value: "03", label: "Laghouat" },
  { value: "04", label: "Oum El Bouaghi" },
  { value: "05", label: "Batna" },
  { value: "06", label: "Béjaïa" },
  { value: "07", label: "Biskra" },
  { value: "08", label: "Béchar" },
  { value: "09", label: "Blida" },
  { value: "10", label: "Bouira" },
  { value: "11", label: "Tamanrasset" },
  { value: "12", label: "Tébessa" },
  { value: "13", label: "Tlemcen" },
  { value: "14", label: "Tiaret" },
  { value: "15", label: "Tizi Ouzou" },
  { value: "16", label: "Alger" },
  { value: "17", label: "Djelfa" },
  { value: "18", label: "Jijel" },
  { value: "19", label: "Sétif" },
  { value: "20", label: "Saïda" },
  { value: "21", label: "Skikda" },
  { value: "22", label: "Sidi Bel Abbès" },
  { value: "23", label: "Annaba" },
  { value: "24", label: "Guelma" },
  { value: "25", label: "Constantine" },
  { value: "26", label: "Médéa" },
  { value: "27", label: "Mostaganem" },
  { value: "28", label: "M'Sila" },
  { value: "29", label: "Mascara" },
  { value: "30", label: "Ouargla" },
  { value: "31", label: "Oran" },
  { value: "32", label: "El Bayadh" },
  { value: "33", label: "Illizi" },
  { value: "34", label: "Bordj Bou Arreridj" },
  { value: "35", label: "Boumerdès" },
  { value: "36", label: "El Tarf" },
  { value: "37", label: "Tindouf" },
  { value: "38", label: "Tissemsilt" },
  { value: "39", label: "El Oued" },
  { value: "40", label: "Khenchela" },
  { value: "41", label: "Souk Ahras" },
  { value: "42", label: "Tipaza" },
  { value: "43", label: "Mila" },
  { value: "44", label: "Aïn Defla" },
  { value: "45", label: "Naâma" },
  { value: "46", label: "Aïn Témouchent" },
  { value: "47", label: "Ghardaïa" },
  { value: "48", label: "Relizane" },
  { value: "49", label: "El M'Ghair" },
  { value: "50", label: "El Menia" },
  { value: "51", label: "Ouled Djellal" },
  { value: "52", label: "Bordj Badji Mokhtar" },
  { value: "53", label: "Béni Abbès" },
  { value: "54", label: "Timimoun" },
  { value: "55", label: "Touggourt" },
  { value: "56", label: "Djanet" },
  { value: "57", label: "In Salah" },
  { value: "58", label: "In Guezzam" }
];

export function AccountDetailsForm(): React.JSX.Element {
  const { profile, loading } = useUserProfile();
  const [formData, setFormData] = React.useState<any>({});

  React.useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  // Pour les champs de texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Pour les selects
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8099/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      alert('Profil mis à jour !');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  if (loading || !formData) return <p>Chargement...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Modifiez vos informations" title="Profil utilisateur" />
        <Divider />
        <CardContent>
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth required>
        <InputLabel>Nom d'utilisateur</InputLabel>
        <OutlinedInput value={formData.username || ''} label="username" name="username" onChange={handleInputChange} />
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth required>
        <InputLabel>Prénom</InputLabel>
        <OutlinedInput value={formData.prenom || ''} label="prenom" name="prenom" onChange={handleInputChange} />
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth required>
        <InputLabel>Nom</InputLabel>
        <OutlinedInput value={formData.nom || ''} label="nom" name="nom" onChange={handleInputChange} />
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth required>
        <InputLabel>Email</InputLabel>
        <OutlinedInput value={formData.email || ''} label="email" name="email" onChange={handleInputChange} />
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Téléphone</InputLabel>
        <OutlinedInput value={formData.telephone || ''} label="telephone" name="telephone" onChange={handleInputChange} />
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Wilaya</InputLabel>
        <Select
          value={formData.wilaya || ''}
          name="wilaya"
          label="Wilaya"
          onChange={handleSelectChange}
        >
          {wilayas.map((w) => (
            <MenuItem key={w.value} value={w.label}>
              {w.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  </Grid>
</CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit">Enregistrer</Button>
        </CardActions>
      </Card>
    </form>
  );
}
