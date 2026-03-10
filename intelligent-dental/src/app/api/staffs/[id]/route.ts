import { getStaffByIdController, updateStaffByIdController } from "./controller";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  return getStaffByIdController(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return updateStaffByIdController(request, context);
}
