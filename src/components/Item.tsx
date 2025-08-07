import type { Item } from "./Game";

export default function Item({ title, tn, selected, mock }: Item & {mock: boolean}) {
  if (mock) {
    return <div className="w-60 aspect-video bg-neutral-300 animate-pulse rounded-2xl" />
  }

  return (
    <div className={`w-60 relative aspect-video border rounded-2xl border-neutral-300 hover:border-neutral-600 hover:scale-105 active:scale-100 transition-all cursor-pointer overflow-hidden ${selected ? "shadow-2xl !border-black": ""}`}>
      <div className="absolute size-full rounded-2xl backdrop-blur-lg">
        <div className={`absolute size-full z-20 rounded-2xl ${selected ? "bg-emerald-100/80" : "bg-neutral-100/50"} backdrop-blur-md p-5 text-neutral-800 text-xl font-bold flex justify-center items-center text-center`}>
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
