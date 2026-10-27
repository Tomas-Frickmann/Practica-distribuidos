import axios from "axios";
import { Note } from "@/lib/notes";

// =========================================================================
// VARIABLE DE CONFIGURACIÓN FÁCIL DE USAR:
// Podés modificar la URL acá o mediante NEXT_PUBLIC_NOTES_API_URL en .env.local
// =========================================================================
export const NOTES_BACKEND_URL =
  process.env.NEXT_PUBLIC_NOTES_API_URL || "http://localhost:3000/notas";

export const notesService = {
  // 1. OBTENER NOTAS (GET http://localhost:3000/notas)
  getNotes: async (): Promise<Note[]> => {
    const res = await axios.get(NOTES_BACKEND_URL);

    let list: any[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data && Array.isArray(res.data.notes)) {
      list = res.data.notes;
    } else if (res.data && Array.isArray(res.data.data)) {
      list = res.data.data;
    }

    return list.map((item) => ({
      id: String(item.id || item._id || crypto.randomUUID()),
      title: item.title ?? "",
      text: item.text ?? "",
      minutes: Number(item.minutes ?? 1),
      createdAt:
        typeof item.createdAt === "number"
          ? item.createdAt
          : item.createdAt
          ? new Date(item.createdAt).getTime()
          : Date.now(),
      notified: Boolean(item.notified),
    }));
  },

  // 2. CREAR NOTA (POST http://localhost:3000/notas)
  createNote: async (newNote: { title: string; text: string; minutes: number }) => {
    const payload = {
      title: newNote.title,
      text: newNote.text,
      minutes: Number(newNote.minutes),
      notified: false,
    };
    const res = await axios.post(NOTES_BACKEND_URL, payload);
    return res.data;
  },

  // 3. MODIFICAR NOTA (PATCH http://localhost:3000/notas/:id)
  updateNote: async (updatedNote: {
    id: string;
    title?: string;
    text?: string;
    minutes?: number;
    notified?: boolean;
  }) => {
    const { id, ...data } = updatedNote;
    try {
      // Intento estándar REST: PATCH /notas/:id
      const res = await axios.patch(`${NOTES_BACKEND_URL}/${id}`, data);
      return res.data;
    } catch (err: any) {
      // Alternativas si el backend implementa PUT /notas/:id o PATCH /notas con body
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const resPut = await axios.put(`${NOTES_BACKEND_URL}/${id}`, data);
          return resPut.data;
        } catch {
          const resBody = await axios.patch(NOTES_BACKEND_URL, updatedNote);
          return resBody.data;
        }
      }
      throw err;
    }
  },

  // 4. ELIMINAR NOTA (DELETE http://localhost:3000/notas/:id)
  deleteNote: async (id: string) => {
    try {
      // Intento estándar REST: DELETE /notas/:id
      const res = await axios.delete(`${NOTES_BACKEND_URL}/${id}`);
      return res.data;
    } catch (err: any) {
      // Alternativa si el backend espera DELETE /notas?id=...
      if (err.response?.status === 404 || err.response?.status === 405) {
        const resQuery = await axios.delete(`${NOTES_BACKEND_URL}?id=${id}`);
        return resQuery.data;
      }
      throw err;
    }
  },
};
