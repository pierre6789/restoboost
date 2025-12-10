'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Copy, Trash2 } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

type StaffMember = Database['public']['Tables']['staff_members']['Row']

interface StaffManagementProps {
  restaurantId: string
  restaurantSlug?: string
}

export function StaffManagement({ restaurantId, restaurantSlug }: StaffManagementProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newStaffName, setNewStaffName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createClient()

  const loadStaffMembers = async () => {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading staff:', error)
      toast.error('Erreur lors du chargement du personnel')
    } else {
      setStaffMembers(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadStaffMembers()
  }, [restaurantId])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    setIsCreating(true)
    const { data, error } = await supabase
      .from('staff_members')
      .insert({
        restaurant_id: restaurantId,
        name: newStaffName.trim(),
      } as never)
      .select()
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      toast.error('Erreur lors de la création')
    } else {
      toast.success('Membre du personnel créé')
      setNewStaffName('')
      loadStaffMembers()
    }
    setIsCreating(false)
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      return
    }

    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', staffId)

    if (error) {
      console.error('Error deleting staff:', error)
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Membre du personnel supprimé')
      loadStaffMembers()
    }
  }

  const copyStaffQRUrl = (staffId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin
    const slug = restaurantSlug || 'your-slug'
    const url = `${baseUrl}/review/${slug}?staff_id=${staffId}`
    navigator.clipboard.writeText(url)
    toast.success('URL copiée dans le presse-papier')
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Gérer le Personnel</CardTitle>
          <CardDescription className="text-base">
            Créez des QR codes individuels pour chaque membre de votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateStaff} className="flex gap-2 mb-6">
            <div className="flex-1">
              <Label htmlFor="staff-name" className="sr-only">Nom du membre</Label>
              <Input
                id="staff-name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Nom du membre du personnel"
                disabled={isCreating}
              />
            </div>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </form>

          {staffMembers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Aucun membre du personnel. Ajoutez-en un pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Scans totaux</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.total_scans}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyStaffQRUrl(staff.id)}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copier URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

