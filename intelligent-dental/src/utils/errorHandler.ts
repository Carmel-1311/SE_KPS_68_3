import { AppError } from "@/utils/AppError"
import * as res from "@/utils/responseFormatter"

import { Prisma } from "@prisma/client"
import { ZodError } from "zod"

export function handleError(err: unknown) {
  console.error(err)

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || "Validation error"

    const appError = new AppError(
      400,
      "VALIDATION-001",
      message,
      "VALIDATION"
    )

    return res.error(
      appError.status,
      appError.code,
      appError.message,
      appError.category
    )
  }

  if (err instanceof AppError) {
    return res.error(
      err.status,
      err.code,
      err.message,
      err.category
    ) }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.error(
        409,
        "DB-UNIQUE",
        "Unique constraint failed",
        "CONFLICT"
      )
    }
  }

    return res.error(
      500,
      "SYS-001",
      "Internal server error",
      "SYSTEM"
    )
 
}
