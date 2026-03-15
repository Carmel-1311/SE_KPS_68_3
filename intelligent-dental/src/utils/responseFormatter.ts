type PaginationMeta = {
  page: number
  limit: number
  total: number
}

export function ok<T>(data: T) {
  return Response.json({ data }, { status: 200 })
}

export function created<T>(data: T) {
  return Response.json({ data }, { status: 201 })
}

export function noContent() {
  return new Response(null, { status: 204 })
}

export function okList<T>(
  data: T[],
  meta: PaginationMeta
) {
  const total_pages = Math.ceil(meta.total / meta.limit)

  return Response.json(
    {
      data,
      meta: {
        ...meta,
        total_pages
      }
    },
    { status: 200 }
  )
}

export function error(
  status: number,
  code: string,
  message: string,
  category: string
) {
  return Response.json(
    {
      error: {
        code,
        message,
        category,
        traceId: crypto.randomUUID()
      }
    },
    { status }
  )
}