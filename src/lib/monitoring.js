import { formatDay, formatMonth, toDateKey } from "@/lib/format";

export function buildDailyTrend(observations = [], days = 14) {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    buckets.set(toDateKey(date), { label: formatDay(date), count: 0 });
  }
  observations.forEach((observation) => {
    const key = toDateKey(observation.detected_at);
    if (key && buckets.has(key)) buckets.get(key).count += 1;
  });
  return Array.from(buckets.values());
}

export function buildMonthlyTrend(observations = [], months = 6) {
  const buckets = new Map();
  const now = new Date();
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { label: formatMonth(date), count: 0 });
  }
  observations.forEach((observation) => {
    const date = new Date(observation.detected_at);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) buckets.get(key).count += 1;
  });
  return Array.from(buckets.values());
}

export function groupByClassification(observations = []) {
  const counts = new Map();
  observations.forEach((observation) => {
    const key = observation.classification || "Unclassified";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts, ([classification, count]) => ({ classification, count })).sort(
    (a, b) => b.count - a.count,
  );
}

export function isWithinDays(value, days) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= Date.now() - days * 86400000;
}

export function groupBySite(observations = []) {
  const map = new Map();
  observations.forEach((observation) => {
    const key = observation.site_name || "Unknown site";
    if (!map.has(key)) {
      map.set(key, {
        site_name: key,
        region: observation.region,
        latitude: observation.latitude,
        longitude: observation.longitude,
        observations: [],
      });
    }
    map.get(key).observations.push(observation);
  });
  return Array.from(map.values());
}
