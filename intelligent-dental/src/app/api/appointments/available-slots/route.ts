import { getCurrentUser } from "@/lib/auth"
import { requireRole } from "@/lib/permissions"
import * as dentistService from "@/services/dentistService"
import { handleError } from "@/utils/errorHandler"
import * as res from "@/utils/responseFormatter"
import { AppError } from "@/utils/AppError"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return handleError(new AppError(400, "APPT-002", "Missing required query parameter: date", "VALIDATION"));
  }

  try {
    const slots = await dentistService.getAvailableTimeSlots(date);

    return res.ok({ available_slots: slots }   );
  } catch (error) {
    return handleError(error)
  }
}