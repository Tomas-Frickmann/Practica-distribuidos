"use client";

import { Theme, useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { noteSchema } from "@/lib/esquema";
import { title } from "process";


type NoteFormProps = {
  editing: boolean;
  initialTitle: string;
  initialText: string;
  initialMinutes: string;
  onSubmit: (values: { title: string; text: string; minutes: number }) => void;
  onCancel: () => void;
};

export function NoteForm({
  editing,
  initialTitle,
  initialText,
  initialMinutes,
  onSubmit,
  onCancel,
}: NoteFormProps) {

  const { theme } = useTheme();
  const dark = theme === Theme.DARK;

  const inputStyle = {
    border: dark ? "1px solid #5c5146" : "1px solid #d9d0c3",
    background: dark ? "#1c1915" : "#fff",
    color: dark ? "#f6f1e8" : "#231c14",
    borderRadius: 10,
    padding: "10px 12px",
    font: "inherit",
  };

  return (
    <section
      style={{
        background: dark ? "#2c261f" : "#fffdf8",
        border: dark ? "1px solid #453c32" : "1px solid #e6dccb",
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
      }}
    >
      <Formik
        initialValues={{ title: initialTitle, text: initialText, minutes: initialMinutes }}
        validationSchema={toFormikValidationSchema(noteSchema)}
        enableReinitialize
        onSubmit={(values, { resetForm }) => {
          onSubmit({ title: values.title, text: values.text, minutes: Number(values.minutes) });
          if (!editing) resetForm();
        }}
      >
        {({ isValid, dirty }) => (
          <Form style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Título
              <Field name="title" placeholder="Por ejemplo, llamar al veterinario" style={inputStyle} />
              <ErrorMessage name="title" component="p" style={{ margin: 0, color: "#8a3b2c", fontSize: 14 }} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Texto
              <Field as="textarea" name="text" rows={3} placeholder="Detalle de la nota" style={{ ...inputStyle, resize: "vertical" }} />
              <ErrorMessage name="text" component="p" style={{ margin: 0, color: "#8a3b2c", fontSize: 14 }} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Minutos de validez
              <Field type="number" name="minutes" min={1} step={1} max={30} style={{ ...inputStyle, width: 120 }} />
              <ErrorMessage name="minutes" component="p" style={{ margin: 0, color: "#8a3b2c", fontSize: 14 }} />
            </label> //no funciona como creo el max ver y ni idea el style

            {editing ? (
              <p style={{ margin: 0, color: "#5c5146", fontSize: 14 }}>
                Al guardar, la validez vuelve a contar desde ahora.
              </p>
            ) : null}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={!isValid || (!dirty && !editing)}
                style={{
                  ...inputStyle,
                  border: 0,
                  background: dark ? "#f6f1e8" : "#231c14",
                  color: dark ? "#231c14" : "#fffdf8",
                  cursor: (!isValid || (!dirty && !editing)) ? "not-allowed" : "pointer",
                  opacity: (!isValid || (!dirty && !editing)) ? 0.6 : 1,
                }}
              >
                {editing ? "Guardar cambios" : "Crear nota"}
              </button>
              {editing ? (
                <button type="button" onClick={onCancel} style={{ ...inputStyle, cursor: "pointer" }}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}
