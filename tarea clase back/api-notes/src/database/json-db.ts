import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type NotaGuardada = {
    id: string;
    title: string;
    text: string;
    minutes: number;
    createdAt: number;
    notified: boolean;
};

export type DatabaseFile = {
    notas: NotaGuardada[];
};
function emptyDatabase(): DatabaseFile {
    return { notas: [] };
}
@Injectable()
export class JsonDb {
    // Cola asíncrona: asegura que las escrituras se hagan de a una y no se pisen
    private queue: Promise<unknown> = Promise.resolve();

    // Ruta del archivo: permite que los tests le pasen una ruta temporal con process.env.DATA_FILE
    filePath(): string {
        return process.env.DATA_FILE ?? join(process.cwd(), 'data', 'db.json');
    }

    // 1. Lectura del archivo JSON
    async read(): Promise<DatabaseFile> {
        try {
            const raw = await readFile(this.filePath(), 'utf8');
            return JSON.parse(raw) as DatabaseFile;
        } catch (error) {
            // Si el archivo no existe (ENOENT), devolvemos la base vacía
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return emptyDatabase();
            }
            throw error;
        }
    }

    // 2. Modificación segura (Lectura -> Cambio en memoria -> Escritura en disco)
    update<T>(change: (db: DatabaseFile) => T): Promise<T> {
        const run = this.queue.then(async () => {
            const db = await this.read();
            const result = change(db);
            await this.write(db);
            return result;
        });

        // Mantenemos la cola viva aunque una operación falle
        this.queue = run.then(
            () => undefined,
            () => undefined,
        );

        return run;
    }

    // 3. Escritura atómica
    private async write(db: DatabaseFile): Promise<void> {
        const path = this.filePath();
        await mkdir(dirname(path), { recursive: true });

        // Escribimos primero en un archivo temporal .tmp y luego lo renombramos
        // Esto garantiza que si el servidor se corta a la mitad, no te queda el db.json corrupto
        const temporary = `${path}.${randomUUID()}.tmp`;
        await writeFile(temporary, `${JSON.stringify(db, null, 2)}\n`);
        await rename(temporary, path);
    }
}
