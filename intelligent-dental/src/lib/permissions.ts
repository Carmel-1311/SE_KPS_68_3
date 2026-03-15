import { AppError } from "@/utils/AppError"

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(403, "AUTH-003", message, "AUTHORIZATION")
    }
}

export function requireRole(
    role: string,
    allowed: string[]
) {
    if (!allowed.includes(role)) {
        throw new (ForbiddenError)()
    }
}
