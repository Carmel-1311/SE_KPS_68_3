import { NextResponse } from "next/server"
import { prisma } from "@/utils/prisma"
import { AppError } from "@/utils/AppError"
import { hashPassword } from "@/utils/password"
import { Prisma, status_user } from "@prisma/client"

type RegisterBody = {
  role?: string
  first_name?: string
  last_name?: string
  birthday?: string
  id_card?: string
  allergy?: string
  office_name?: string
  contact_name?: string
  address?: string
  email?: string
  phone?: string
  password?: string
  confirm_password?: string
  username?: string
}

const validPatientStatus = new Set(Object.values(status_user))

function normalizeIdCard(value?: string) {
  return value?.replace(/\D/g, "").trim() || ""
}

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
  if (raw === "patient" || raw === "company") return raw
  throw new AppError(400, "AUTH-005", "Invalid role. Allowed values: patient, company", "VALIDATION")
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody

    const email = body.email?.trim()
    const phone = body.phone?.trim()
    const password = body.password?.trim()
    const confirmPassword = body.confirm_password?.trim()
    const username = body.username?.trim() || email
    const role = normalizeRole(body.role)

    if (!email || !phone || !password || !confirmPassword || !username) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Password confirmation does not match" }, { status: 400 })
    }

    const existingAccount = await prisma.account.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { account_id: true }
    })
    if (existingAccount) {
      return NextResponse.json({ message: "Account with this email or username already exists" }, { status: 409 })
    }

    if (role === "patient") {
      const firstName = body.first_name?.trim()
      const lastName = body.last_name?.trim()
      const birthdayRaw = body.birthday?.trim()
      const idCard = normalizeIdCard(body.id_card)

      if (!firstName || !lastName || !birthdayRaw || !idCard) {
        return NextResponse.json({ message: "Missing required patient fields" }, { status: 400 })
      }

      if (!/^\d{13}$/.test(idCard)) {
        return NextResponse.json({ message: "Invalid id card. Use 13 digits" }, { status: 400 })
      }

      const birthday = parseDate(birthdayRaw)

      const duplicatePatient = await prisma.patient.findFirst({
        where: { OR: [{ email }, { phone }, { id_card: idCard }] },
        select: { patient_id: true }
      })
      if (duplicatePatient) {
        return NextResponse.json({ message: "Patient with this email, phone, or id card already exists" }, { status: 409 })
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
              id_card: idCard,
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

    const officeName = body.office_name?.trim()
    const contactName = body.contact_name?.trim()
    const address = body.address?.trim()

    if (!officeName || !contactName || !address) {
      return NextResponse.json({ message: "Missing required company fields" }, { status: 400 })
    }

    const duplicateCompany = await prisma.company.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { company_id: true }
    })
    if (duplicateCompany) {
      return NextResponse.json({ message: "Company with this email or phone already exists" }, { status: 409 })
    }

    const created = await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          username,
          email,
          password_hash: hashPassword(password),
          account_role: "company"
        }
      })

      const company = await tx.company.create({
        data: {
          contect_name: contactName,
          office_name: officeName,
          phone,
          address,
          email,
          account_id: account.account_id
        }
      })

      return { account, company }
    })

    return NextResponse.json(
      {
        data: {
          id: created.account.account_id,
          email: created.account.email ?? "",
          name: created.company.office_name ?? ""
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
