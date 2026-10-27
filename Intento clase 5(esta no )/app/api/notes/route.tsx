import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const notes = await db.listNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.title == null || body.text == null || body.minutes == null) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newNote = await db.createNote({
      id: crypto.randomUUID(),
      title: body.title,
      text: body.text,
      minutes: Number(body.minutes),
      createdAt: Date.now(),
      notified: false,
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear la nota" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ message: "Falta el id" }, { status: 400 });
    }

    const updatedNote = await db.updateNote(body.id, body);
    
    if (!updatedNote) {
      return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar la nota" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ message: "Falta el id" }, { status: 400 });
  }

  const success = await db.deleteNote(id);
  
  if (!success) {
    return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ message: "Eliminada correctamente" });
}
