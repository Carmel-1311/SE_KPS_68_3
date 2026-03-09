import * as res from "@/repositories/dentistRepository"

function getDayEnum(date: Date) {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(date)

  return day as "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat"
}

export async function getFreeDentist(date: string, start_time: string) {
  const day = getDayEnum(new Date(date))
  const data = await res.findFreeDentist(start_time, new Date(date), day)
  return data
}