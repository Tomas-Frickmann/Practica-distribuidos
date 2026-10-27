import { promises as fs } from "fs";
import path from "path";
import type { Note } from "@/lib/notes";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

type Database = {
  notes: Note[];
  users?: User[]; // Ahora soporta usuarios
};

const filePath = path.join(process.cwd(), "data", "db.json");

let chain: Promise<unknown> = Promise.resolve();

async function read(): Promise<Database> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { notes: [], users: [] };
  }
}

async function write(data: Database) {
  const temporary = `${filePath}.tmp`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(temporary, JSON.stringify(data, null, 2));
  await fs.rename(temporary, filePath);
}

function update<T>(change: (data: Database) => T): Promise<T> {
  const run = chain.then(async () => {
    const data = await read();
    const result = change(data);
    await write(data);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export const db = {
  // --- MÉTODOS DE NOTAS ---
  async listNotes() {
    const data = await read();
    return data.notes.sort((a, b) => b.createdAt - a.createdAt);
  },

  createNote(note: Note) {
    return update((data) => {
      data.notes.unshift(note);
      return note;
    });
  },

  updateNote(
    id: string,
    values: { title?: string; text?: string; minutes?: number; notified?: boolean },
  ) {
    return update((data) => {
      const note = data.notes.find((item) => item.id === id);
      if (!note) return null;
      
      if (values.notified !== undefined && values.title === undefined) {
        note.notified = values.notified;
      } else {
        if (values.title !== undefined) note.title = values.title;
        if (values.text !== undefined) note.text = values.text;
        if (values.minutes !== undefined) note.minutes = values.minutes;
        note.createdAt = Date.now();
        note.notified = false;
      }
      return note;
    });
  },

  deleteNote(id: string) {
    return update((data) => {
      const index = data.notes.findIndex((item) => item.id === id);
      if (index === -1) return false;
      data.notes.splice(index, 1);
      return true;
    });
  },

  // --- MÉTODOS DE USUARIOS ---
  async findUserByEmail(email: string) {
    const data = await read();
    return data.users?.find((u) => u.email === email) || null;
  },

  createUser(user: User) {
    return update((data) => {
      if (!data.users) data.users = [];
      data.users.push(user);
      return user;
    });
  }
};
