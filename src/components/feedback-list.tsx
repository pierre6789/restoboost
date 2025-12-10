import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface FeedbackListProps {
  restaurantId: string
}

export async function FeedbackList({ restaurantId }: FeedbackListProps) {
  const supabase = await createClient()

  const { data: feedbacks, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching feedback:', error)
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Erreur lors du chargement des feedbacks
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>
            Aucun feedback négatif reçu pour le moment
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Type assertion for feedbacks array
  type FeedbackItem = {
    id: string
    created_at: string
    rating: number
    comment: string | null
    contact_email: string | null
  }
  const typedFeedbacks = feedbacks as FeedbackItem[]

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#2C2C2C]">Feedback Reçus</CardTitle>
        <CardDescription className="text-base">
          Liste des commentaires négatifs interceptés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typedFeedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  {format(new Date(feedback.created_at), 'PPp')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < feedback.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({feedback.rating}/5)
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  {feedback.comment || (
                    <span className="text-muted-foreground italic">
                      Aucun commentaire
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {feedback.contact_email || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

