import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { AppError } from "@/utils/AppError"
import { hashPassword } from "@/utils/password"
import { Prisma, role_staff, status_user } from "@prisma/client"

type RegisterBody = {
  role?: string
  staff_role?: string
  first_name?: string
  last_name?: string
  birthday?: string
  allergy?: string
  email?: string
  phone?: string
  license_number?: string
  password?: string
  username?: string
}

const validStaffRoles = new Set(Object.values(role_staff))
const validPatientStatus = new Set(Object.values(status_user))

function parseDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "AUTH-004", "Invalid birthday format. Use YYYY-MM-DD", "VALIDATION")
  }
  return date
}

function normalizeRole(role?: string) {
  const raw = role?.trim().toLowerCase()
  if (!raw) return "patient"
  if (raw === "patient" || raw === "staff" || raw === "dentist") return raw
  throw new AppError(400, "AUTH-005", "Invalid role. Allowed values: patient, staff, dentist", "VALIDATION")
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody

    const firstName = body.first_name?.trim()
    const lastName = body.last_name?.trim()
    const birthdayRaw = body.birthday?.trim()
    const email = body.email?.trim()
    const phone = body.phone?.trim()
    const password = body.password?.trim()
    const username = body.username?.trim() || email
    const role = normalizeRole(body.role)

    if (!firstName || !lastName || !birthdayRaw || !email || !phone || !password || !username) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const birthday = parseDate(birthdayRaw)

    const existingAccount = await prisma.account.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { account_id: true }
    })
    if (existingAccount) {
      return NextResponse.json({ message: "Account with this email or username already exists" }, { status: 409 })
    }

    if (role === "patient") {
      const duplicatePatient = await prisma.patient.findFirst({
        where: { OR: [{ email }, { phone }] },
        select: { patient_id: true }
      })
      if (duplicatePatient) {
        return NextResponse.json({ message: "Patient with this email or phone already exists" }, { status: 409 })
      }

      const allergy = body.allergy?.trim() || ""
      const status = "active"
      if (!validPatientStatus.has(status as status_user)) {
        throw new AppError(400, "PAT-001", "Invalid status. Allowed values: active, inactive", "VALIDATION")
      }

      const createPatientAccount = () =>
        prisma.$transaction(async (tx) => {
          const account = await tx.account.create({
            data: {
              username,
              email,
              password_hash: hashPassword(password),
              account_role: "patient"
            }
          })

          const patient = await tx.patient.create({
            data: {
              first_name: firstName,
              last_name: lastName,
              birthday,
              allergy,
              email,
              phone,
              status: status as status_user,
              account_id: account.account_id
            }
          })

          return { account, patient }
        })

      let created
      try {
        created = await createPatientAccount()
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          Array.isArray((err.meta as { target?: string[] } | undefined)?.target) &&
          (err.meta as { target?: string[] }).target?.includes("patient_id")
        ) {
          await prisma.$executeRaw`
            SELECT setval(
              pg_get_serial_sequence('public.patient','patient_id'),
              COALESCE((SELECT MAX(patient_id) FROM public.patient), 0)
            )
          `
          created = await createPatientAccount()
        } else {
          throw err
        }
      }

      return NextResponse.json(
        {
          data: {
            id: created.account.account_id,
            email: created.account.email ?? "",
            name: `${created.patient.first_name ?? ""} ${created.patient.last_name ?? ""}`.trim()
          }
        },
        { status: 201 }
      )
    }

    const staffRoleRaw = body.staff_role?.trim().toLowerCase()
    const staffRole = staffRoleRaw || (role === "dentist" ? "dentist" : "staff")
    if (!validStaffRoles.has(staffRole as role_staff)) {
      throw new AppError(400, "STAFF-001", "Invalid staff role. Allowed values: staff, dentist", "VALIDATION")
    }

    const duplicateStaff = await prisma.staff.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { staff_id: true }
    })
    if (duplicateStaff) {
      return NextResponse.json({ message: "Staff with this email or phone already exists" }, { status: 409 })
    }

    const licenseNumber = body.license_number?.trim() || null
    const accountRole = staffRole === "dentist" ? "doctor" : "staff"

    const created = await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          username,
          email,
          password_hash: hashPassword(password),
          account_role: accountRole
        }
      })

      const staff = await tx.staff.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          birthday,
          email,
          phone,
          license_number: licenseNumber,
          role: staffRole as role_staff,
          account_id: account.account_id
        }
      })

      return { account, staff }
    })

    return NextResponse.json(
      {
        data: {
          id: created.account.account_id,
          email: created.account.email ?? "",
          name: `${created.staff.first_name ?? ""} ${created.staff.last_name ?? ""}`.trim()
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    console.error("POST /api/auth/register error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
