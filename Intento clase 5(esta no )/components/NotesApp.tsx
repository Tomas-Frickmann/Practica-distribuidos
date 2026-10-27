"use client";

/* eslint-disable react-hooks/set-state-in-effect -- el tablero se hidrata desde localStorage y confirma las notificaciones ya enviadas */

import { useEffect, useState } from "react";
import { NoteBoard } from "@/components/NoteBoard";
import { NoteForm } from "@/components/NoteForm";
import { parseStoredNotes, STORAGE_KEY, isExpired, type Note } from "@/lib/notes";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotes } from "@/hooks/useNotes";
import { useRouter } from "next/navigation";

const announcedIds = new Set<string>();

export function NotesApp() {
  const [now, setNow] = useState(0);
  const [editing, setEditing] = useState<Note | null>(null);

  const { theme, toggleTheme } = useTheme();
  
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const ready = !isLoading;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready || now === 0) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const due = notes.filter(
      (note: Note) => isExpired(note, now) && !note.notified && !announcedIds.has(note.id),
    );
    if (due.length === 0) return;

    const sent: string[] = [];
    for (const note of due) {
      announcedIds.add(note.id);
      try {
        new Notification(`Recordatorio: ${note.title}`, {
          body: note.text
            ? `${note.text} — se cumplieron ${note.minutes} min de validez.`
            : `Se cumplieron ${note.minutes} min de validez.`,
        });
        sent.push(note.id);
      } catch {
        announcedIds.delete(note.id);
      }
    }

    if (sent.length === 0) return;
    for (const id of sent) {
      updateNote({ id, notified: true });
    }
  }, [notes, now, ready, updateNote]);

  function saveNote(values: { title: string; text: string; minutes: number }) {
    if (editing) {
      announcedIds.delete(editing.id);
      updateNote({ id: editing.id, ...values });
      setEditing(null);
    } else {
      createNote(values);
    }
  }

  function removeNote(id: string) {
    announcedIds.delete(id);
    deleteNote(id);
    if (editing?.id === id) setEditing(null);
  }

  const dark = theme === "dark";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: dark ? "#1c1915" : "#f4efe6",
        color: dark ? "#f6f1e8" : "#231c14",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        padding: "36px 20px 72px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 36, letterSpacing: "-0.03em" }}>Sticky notes</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                border: dark ? "1px solid #5c5146" : "1px solid #d9d0c3",
                background: dark ? "#2c261f" : "#fffdf8",
                color: "inherit",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {dark ? "Modo claro" : "Modo oscuro"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                border: dark ? "1px solid #5c5146" : "1px solid #d9d0c3",
                background: "#d9534f",
                color: "white",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Salir
            </button>
          </div>
        </header>

        <NoteForm
          key={editing?.id ?? "new"}
          editing={editing !== null}
          initialTitle={editing?.title ?? ""}
          initialText={editing?.text ?? ""}
          initialMinutes={editing ? String(editing.minutes) : "1"}
          onSubmit={saveNote}
          onCancel={() => setEditing(null)}
        />

        <NoteBoard
          notes={notes}
          ready={ready}
          now={now}
          editingId={editing?.id ?? null}
          onEdit={setEditing}
          onDelete={removeNote}
        />
      </div>
    </main>
  );
}
