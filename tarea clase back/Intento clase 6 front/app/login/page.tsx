"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(values: any, helpers: FormikHelpers<any>) {
    helpers.setStatus("");
    try {
      if (isLogin) {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email, password: values.password }),
        });

        if (!res.ok) throw new Error("Credenciales inválidas (usa admin@test.com y 123456)");
      } else {
        const res = await fetch("/api/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Error al registrarse");
        }
      }

      router.push("/");
      router.refresh();
    } catch (error: any) {
      helpers.setStatus(error.message);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>{isLogin ? "Ingresar" : "Crear cuenta"}</h2>

      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>


            {!isLogin && (
              <div>
                <label>Nombre:</label><br />
                <Field name="name" required={!isLogin} style={{ width: "100%", padding: "8px" }} />
              </div>
            )}

            <div>
              <label>Email:</label><br />
              <Field type="email" name="email" required style={{ width: "100%", padding: "8px" }} />
            </div>

            <div>
              <label>Contraseña:</label><br />
              <Field type="password" name="password" required style={{ width: "100%", padding: "8px" }} />
            </div>

            {/* Mensaje de error (seteado con formik.setStatus) */}
            {formik.status && <p style={{ color: "red", margin: 0 }}>{formik.status}</p>}


            <button type="submit" disabled={formik.isSubmitting} style={{ padding: "10px", background: "#0070f3", color: "white", border: "none" }}>
              {formik.isSubmitting ? "Cargando..." : (isLogin ? "Entrar" : "Registrarme")}
            </button>

          </Form>
        )}
      </Formik>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: "15px", background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
      >
        {isLogin ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
      </button>

    </div>
  );
}
