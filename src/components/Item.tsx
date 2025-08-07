import type { Item } from "./Game";

export default function Item({ title, tn, selected, mock }: Item & {mock: boolean}) {
  if (mock) {
    return <div className="w-60 aspect-video bg-neutral-300 dark:bg-neutral-700 animate-pulse rounded-2xl" />
  }

  return (
    <div className={`w-60 relative aspect-video border rounded-2xl border-neutral-300 dark:border-neutral-700 hover:border-neutral-600 hover:dark:border-neutral-400 hover:scale-105 active:scale-100 transition-all cursor-pointer overflow-hidden ${selected ? "shadow-2xl !border-black dark:!border-white": ""}`}>
      <div className="absolute size-full rounded-2xl backdrop-blur-lg">
        <div className={`absolute size-full z-20 rounded-2xl ${selected ? "bg-emerald-100/80 dark:bg-emerald-900/80" : "bg-neutral-100/50 dark:bg-neutral-900/50"} backdrop-blur-md p-5 text-neutral-800 dark:text-neutral-200 text-xl font-bold flex justify-center items-center text-center`}>
          <p>{title}</p>
        </div>
        <div
          className="size-full bg-cover"
          style={{
            backgroundImage: `url(https://i.ytimg.com/vi/${tn}/hq720.jpg)`,
          }}
        />
      </div>
    </div>
  );
}
