# Intento Clase 6 - Frontend

Frontend preparado para conectarse al backend de notas (`api-notes`) mientras mantiene el inicio de sesión y registro de usuarios en el JSON DB local (`data/db.json`).

---

## 🚀 Cómo iniciar el frontend

```bash
cd "Intento clase 6 front"
npm run dev
```

> **Nota:** Se configuró para correr en el puerto **`3001`** (`http://localhost:3001`) para evitar colisiones de puerto si tu backend de NestJS (`api-notes`) corre en el puerto **`3000`**.

---

## ⚙️ Configuración de la URL del Backend

La URL hacia tu backend está centralizada en una variable fácil de modificar:

1. **Desde `.env.local`:**
   ```env
   NEXT_PUBLIC_NOTES_API_URL=http://localhost:3000/notas
   ```

2. **O directamente en el código:**
   En [`services/notes.service.ts`](file:///c:/Users/tomas/Facu/Sistemas%20Distribuidos/Intento%20clase%206%20front/services/notes.service.ts):
   ```typescript
   export const NOTES_BACKEND_URL =
     process.env.NEXT_PUBLIC_NOTES_API_URL || "http://localhost:3000/notas";
   ```

---

## 📡 Endpoints del Backend esperados para Notas

El servicio [`notes.service.ts`](file:///c:/Users/tomas/Facu/Sistemas%20Distribuidos/Intento%20clase%206%20front/services/notes.service.ts) está preparado de manera flexible:

1. **Listar notas:**
   - `GET http://localhost:3000/notas`
   - Acepta tanto un array directo `[ { id, title, text, minutes, ... } ]` como `{ notes: [ ... ] }` o `{ data: [ ... ] }`.

2. **Crear nota:**
   - `POST http://localhost:3000/notas`
   - Body enviado: `{ title: string, text: string, minutes: number, notified: false }` (coincide con tu `CreateNotaDto` de `api-notes`).

3. **Modificar nota:**
   - `PATCH http://localhost:3000/notas/:id` (o `PUT http://localhost:3000/notas/:id`).
   - Body enviado: `{ title, text, minutes, notified }`.
   - Si tu backend prefiere recibir el `id` en el body en vez de en la URL, tiene fallback automático.

4. **Eliminar nota:**
   - `DELETE http://localhost:3000/notas/:id`.
   - Si tu backend prefiere query params (`DELETE /notas?id=...`), también tiene fallback automático.

---

## 🔒 Autenticación e Inicio de Sesión (JSON DB)

- La autenticación sigue funcionando 100% de manera local con la base de datos `data/db.json` y cookies JWT.
- Rutas locales que siguen activas:
  - `POST /api/login`
  - `POST /api/registro`
  - `GET /api/me`
  - `POST /api/logout`
- Los usuarios se persisten en [`data/db.json`](file:///c:/Users/tomas/Facu/Sistemas%20Distribuidos/Intento%20clase%206%20front/data/db.json).

---

## 💡 Consejo para tu Backend (`api-notes`)
Si tu backend de NestJS corre en `localhost:3000` y este frontend en `localhost:3001`, recordá habilitar CORS en tu backend agregando en `api-notes/src/main.ts`:
```typescript
app.enableCors();
```
antes de `await app.listen(...)`.
