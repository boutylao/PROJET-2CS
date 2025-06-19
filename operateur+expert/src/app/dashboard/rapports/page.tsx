"use client"

import React, { useEffect, useState } from "react"
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material"
import { Upload, Trash } from "@phosphor-icons/react"

interface Puit {
  puitId: string
  puitName: string
  location: string
  totalDepth: number
  status: string
}

interface PuitWithPrevision extends Puit {
  previsionFileName?: string
}

export default function RapportsPage() {
  const [puits, setPuits] = useState<PuitWithPrevision[]>([])
  const [newPuit, setNewPuit] = useState<Puit>({
    puitId: "",
    puitName: "",
    location: "",
    totalDepth: 0,
    status: "Actif"
  })
  const [puitToDelete, setPuitToDelete] = useState<PuitWithPrevision | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem("puitsWithPrevisions")
    if (saved) {
      setPuits(JSON.parse(saved))
    } else {
      fetch("http://localhost:8099/api/puits")
        .then((res) => res.json())
        .then((data) => {
          setPuits(data)
          sessionStorage.setItem("puitsWithPrevisions", JSON.stringify(data))
        })
        .catch((err) => console.error("Erreur chargement puits:", err))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPuit({ ...newPuit, [e.target.name]: e.target.value })
  }

  const handleAddPuit = async () => {
    if (!newPuit.puitId || !newPuit.puitName) return
    try {
      const res = await fetch("http://localhost:8098/api/puits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPuit)
      })
      if (res.ok) {
        const added = await res.json()
        const updated = [...puits, added]
        setPuits(updated)
        sessionStorage.setItem("puitsWithPrevisions", JSON.stringify(updated))
        setNewPuit({ puitId: "", puitName: "", location: "", totalDepth: 0, status: "Actif" })
      }
    } catch (err) {
      console.error("Erreur d'ajout du puit", err)
    }
  }

  const handlePrevisionUpload = (puitId: string, file: File) => {
    const updated = puits.map((p) =>
      p.puitId === puitId ? { ...p, previsionFileName: file.name } : p
    )
    setPuits(updated)
    sessionStorage.setItem("puitsWithPrevisions", JSON.stringify(updated))

    const formData = new FormData()
    formData.append("file", file)
    fetch("http://localhost:8099/previsions/upload", {
      method: "POST",
      body: formData
    }).catch(err => {
      console.error("Erreur upload fichier:", err)
    })

    const url = URL.createObjectURL(file)
    sessionStorage.setItem(`prevision_${puitId}_url`, url)
    sessionStorage.setItem(`prevision_${puitId}_name`, file.name)
  }

  const confirmDelete = () => {
    if (puitToDelete) {
      const updated = puits.filter(p => p.puitId !== puitToDelete.puitId)
      setPuits(updated)
      sessionStorage.setItem("puitsWithPrevisions", JSON.stringify(updated))
      sessionStorage.removeItem(`prevision_${puitToDelete.puitId}_url`)
      sessionStorage.removeItem(`prevision_${puitToDelete.puitId}_name`)
      setPuitToDelete(null)
    }
  }

  return (
    <Stack spacing={4} sx={{ p: 4 }}>
      <Typography variant="h4">Gestion des Puits et Prévisions</Typography>

      {/* Formulaire d'ajout */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Ajouter un nouveau puit</Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="ID" name="puitId" value={newPuit.puitId} onChange={handleChange} />
            <TextField label="Nom" name="puitName" value={newPuit.puitName} onChange={handleChange} />
            <TextField label="Site" name="location" value={newPuit.location} onChange={handleChange} />
            <TextField label="Profondeur totale" name="totalDepth" type="number" value={newPuit.totalDepth} onChange={handleChange} />
            <Button variant="contained" onClick={handleAddPuit}>Ajouter</Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Liste des puits */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Liste des puits</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Profondeur</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Prévision</TableCell>
                <TableCell>Supprimer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {puits.map((puit) => (
                <TableRow key={puit.puitId}>
                  <TableCell>{puit.puitId}</TableCell>
                  <TableCell>{puit.puitName}</TableCell>
                  <TableCell>{puit.location}</TableCell>
                  <TableCell>{puit.totalDepth}</TableCell>
                  <TableCell>{puit.status}</TableCell>
                  <TableCell>
                    {puit.previsionFileName ? (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const blobUrl = sessionStorage.getItem(`prevision_${puit.puitId}_url`)
                          const fileName = sessionStorage.getItem(`prevision_${puit.puitId}_name`)
                          if (blobUrl && fileName) {
                            const a = document.createElement("a")
                            a.href = blobUrl
                            a.download = fileName
                            a.style.display = "none"
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                          } else {
                            alert("Fichier non disponible.")
                          }
                        }}
                      >
                        Télécharger
                      </Button>
                    ) : (
                      <Button component="label" startIcon={<Upload size={16} />}>
                        Charger fichier
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handlePrevisionUpload(puit.puitId, file)
                            }
                          }}
                        />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => setPuitToDelete(puit)}>
                      <Trash size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog
        open={!!puitToDelete}
        onClose={() => setPuitToDelete(null)}
        PaperProps={{ sx: { borderRadius: 3, padding: 2, minWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem", color: "#d32f2f" }}>
          ❗ Suppression du puit
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Êtes-vous sûr de vouloir <strong>supprimer</strong> le puit{" "}
            <strong>{puitToDelete?.puitName}</strong> ?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pr: 3 }}>
          <Button onClick={() => setPuitToDelete(null)} variant="outlined" color="inherit">
            Annuler
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
