import axios from "axios";
import { Note } from "@/lib/notes";

export const notesService = {
  getNotes: async (): Promise<Note[]> => {
    const res = await axios.get("/api/notes");
    return res.data.notes;
  },

  createNote: async (newNote: { title: string; text: string; minutes: number }) => {
    const res = await axios.post("/api/notes", newNote);
    return res.data;
  },

  updateNote: async (updatedNote: { id: string; title?: string; text?: string; minutes?: number; notified?: boolean }) => {
    const res = await axios.patch("/api/notes", updatedNote);
    return res.data;
  },

  deleteNote: async (id: string) => {
    const res = await axios.delete(`/api/notes?id=${id}`);
    return res.data;
  }
};
