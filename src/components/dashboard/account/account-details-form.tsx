'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';

const wilayas = [
  { value: 'adrar', label: 'Adrar' },
  { value: 'chlef', label: 'Chlef' },
  { value: 'laghouat', label: 'Laghouat' },
  { value: 'oum-el-bouaghi', label: 'Oum El Bouaghi' },
  { value: 'batna', label: 'Batna' },
  { value: 'bejaia', label: 'Béjaïa' },
  { value: 'biskra', label: 'Biskra' },
  { value: 'bechar', label: 'Béchar' },
  { value: 'blida', label: 'Blida' },
  { value: 'bouira', label: 'Bouira' },
  { value: 'tamanrasset', label: 'Tamanrasset' },
  { value: 'tebessa', label: 'Tébessa' },
  { value: 'tlemcen', label: 'Tlemcen' },
  { value: 'tiaret', label: 'Tiaret' },
  { value: 'tizi-ouzou', label: 'Tizi Ouzou' },
  { value: 'alger', label: 'Alger' },
  { value: 'djelfa', label: 'Djelfa' },
  { value: 'jijel', label: 'Jijel' },
  { value: 'setif', label: 'Sétif' },
  { value: 'saida', label: 'Saïda' },
  { value: 'skikda', label: 'Skikda' },
  { value: 'sidi-bel-abbes', label: 'Sidi Bel Abbès' },
  { value: 'annaba', label: 'Annaba' },
  { value: 'guelma', label: 'Guelma' },
  { value: 'constantine', label: 'Constantine' },
  { value: 'medea', label: 'Médéa' },
  { value: 'mostaganem', label: 'Mostaganem' },
  { value: 'msila', label: 'M’Sila' },
  { value: 'mascara', label: 'Mascara' },
  { value: 'ouargla', label: 'Ouargla' },
  { value: 'oran', label: 'Oran' },
  { value: 'el-bayadh', label: 'El Bayadh' },
  { value: 'illizi', label: 'Illizi' },
  { value: 'bordj-bou-arreridj', label: 'Bordj Bou Arreridj' },
  { value: 'boumerdes', label: 'Boumerdès' },
  { value: 'el-tarf', label: 'El Tarf' },
  { value: 'tindouf', label: 'Tindouf' },
  { value: 'tissemsilt', label: 'Tissemsilt' },
  { value: 'el-oued', label: 'El Oued' },
  { value: 'khenchela', label: 'Khenchela' },
  { value: 'souk-ahras', label: 'Souk Ahras' },
  { value: 'tipaza', label: 'Tipaza' },
  { value: 'mila', label: 'Mila' },
  { value: 'ain-defla', label: 'Aïn Defla' },
  { value: 'naama', label: 'Naâma' },
  { value: 'ain-temouchent', label: 'Aïn Témouchent' },
  { value: 'ghardaia', label: 'Ghardaïa' },
  { value: 'relizane', label: 'Relizane' },
  { value: 'timimoun', label: 'Timimoun' },
  { value: 'bordj-badji-mokhtar', label: 'Bordj Badji Mokhtar' },
  { value: 'ouled-djellal', label: 'Ouled Djellal' },
  { value: 'beni-abbes', label: 'Béni Abbès' },
  { value: 'in-salah', label: 'In Salah' },
  { value: 'in-guezzam', label: 'In Guezzam' },
  { value: 'touggourt', label: 'Touggourt' },
  { value: 'djanet', label: 'Djanet' },
  { value: 'el-meghaier', label: 'El M’Ghaier' },
  { value: 'el-menia', label: 'El Menia' }
] as const;


export function AccountDetailsForm(): React.JSX.Element {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
  <CardHeader subheader="The information can be edited" title="Profile" />
  <Divider />
  <CardContent>
    <Grid container spacing={3}>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Nom d utilisateur</InputLabel>
          <OutlinedInput defaultValue="laouar_boutheyna" label="Username" name="username" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Mot de passe</InputLabel>
          <OutlinedInput defaultValue="1234" label="Password" name="password" type="password" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Prénom</InputLabel>
          <OutlinedInput defaultValue="Boutheyna" label="First name" name="firstName" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Nom</InputLabel>
          <OutlinedInput defaultValue="Laouar" label="Last name" name="lastName" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Adresse email</InputLabel>
          <OutlinedInput defaultValue="lb_laouar@esi.dz" label="Email address" name="email" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth>
          <InputLabel>numéro de téléphone</InputLabel>
          <OutlinedInput defaultValue="+213 561 75 21 00" label="Phone number" name="phone" type="tel" />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth>
          <InputLabel>Wilaya</InputLabel>
          <Select defaultValue="Skikda" label="Wilaya" name="wilaya" variant="outlined">
            {wilayas.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Poste</InputLabel>
          <Select defaultValue="operateur" label="Poste" name="poste" variant="outlined">
            <MenuItem value="operateur">Opérateur</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
            <MenuItem value="decideur">Décideur</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </CardContent>
  <Divider />
  <CardActions sx={{ justifyContent: 'flex-end' }}>
    <Button variant="contained">Save details</Button>
  </CardActions>
</Card>

    </form>
  );
}
