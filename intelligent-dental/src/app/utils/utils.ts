import dayjs from "dayjs";

export function convertDateTimeToBuddhist(date?: string | Date) {
  if (!date) return "-";

  const d = dayjs(date);
  if (!d.isValid()) return "-";

  const buddhistYear = d.year() + 543;

  return d.format(`DD/MM/${buddhistYear} HH:mm`);
}

export function convertDateTimeToNumber(date?: string | Date) {
  if (!date) return 0;

  const d = dayjs(date);
  if (!d.isValid()) return 0;

  return d.valueOf();
}