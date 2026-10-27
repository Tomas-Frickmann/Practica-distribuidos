import { z } from "zod";

export const noteSchema = z.object({
    title: z.string().trim().min(1, "El título es obligatorio."),
    text: z.string().trim(),

    minutes: z.preprocess(
        (val) => Number(val),
        z.number().min(1, "Los minutos deben ser mayor a 0.")
    ),
});
