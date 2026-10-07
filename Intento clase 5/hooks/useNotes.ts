import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesService } from "@/services/notes.service";

export const useNotes = () => {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: notesService.getNotes
  });

  const createMutation = useMutation({
    mutationFn: notesService.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: notesService.updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: notesService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    createNote: createMutation.mutate,
    updateNote: updateMutation.mutate,
    deleteNote: deleteMutation.mutate
  };
};
