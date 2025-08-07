import type { Item } from "./components/Game";

export default function getResults(data: Item[]) {
  const result: Record<string, number> = {};
  for (const item of data) {
    result[item.cat_id] = (result[item.cat_id] || 0) + 1;
  }
  return result;
}