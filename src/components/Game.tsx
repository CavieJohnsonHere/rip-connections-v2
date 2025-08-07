import { useQuery } from "@tanstack/react-query";
import Item from "./Item";
import { useRef, useState } from "react";
import getResults from "@/getResults";

export type Item = {
  id: number;
  title: string;
  tn: string;
  cat_id: number;
  selected: boolean;
};

function range(start: number, stop: number, step = 1) {
  return Array.from(
    { length: (stop - start) / step + 1 },
    (_, i) => start + i * step
  );
}

async function fetchItems(): Promise<[Record<string, string>, Item[]]> {
  const res = await fetch("api/items");
  const resContent = await res.json();
  const resItems = resContent.items;
  const resCats = resContent.cats;
  return [
    resCats,
    // shuffleArray(resItems).map((v: Item) => {
    //   return {
    //     selected: false,
    //     cat_id: v.cat_id,
    //     id: v.id,
    //     title: v.title,
    //     tn: v.tn,
    //   };
    // }),

    resItems.map((v: Item) => {
      return {
        selected: false,
        cat_id: v.cat_id,
        id: v.id,
        title: v.title,
        tn: v.tn,
      };
    }),
  ];
}

function shuffleArray<T>(array: T[]): T[] {
  // Fisher–Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Game() {
  const { isPending, isError, isSuccess, data, error } = useQuery<
    [Record<string, string>, Item[]]
  >({
    queryKey: ["gameItems"],
    queryFn: fetchItems,
  });

  const catEmojies = ["🟨", "🟩", "🟦", "🟪"];

  const [cleanData, setCleanData] = useState<Item[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [lives, setLives] = useState<number>(4);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [cleanCats, setCleanCats] = useState<Record<string, string>>({});
  const [selectedIds, setSelecteIds] = useState<number[]>([]);
  const [skippedIds, setSkipeedIds] = useState<number[]>([]);
  const [correctCats, setCorrectCats] = useState<
    { id: number; items: string[] }[]
  >([]);

  // The message that is shown in the bottom
  const [message, setMessage] = useState(
    "Start by picking four rips you think are similar."
  );

  const colors = [
    "bg-yellow-500",
    "bg-green-300",
    "bg-blue-300",
    "bg-purple-300",
  ];

  const onsubmit = () => {
    const processItems = cleanData.filter((v) => selectedIds.includes(v.id));
    const newHistory: string[] = [];
    processItems.forEach((pItem) =>
      newHistory.push(catEmojies[pItem.cat_id] ? catEmojies[pItem.cat_id] : "?")
    );
    setHistory([...history, newHistory]);
    const results = Object.entries(getResults(processItems));
    if (results.some((v) => v[1] == 3)) {
      setMessage("One away...");
      setLives(lives - 1);
    } else if (results.some((v) => v[1] == 4)) {
      setSelecteIds([]);
      setMessage("Well done! You got it!");
      setSkipeedIds([processItems.map((item) => item.id), skippedIds].flat());
      if (!(results[0] && results[0][0])) return;
      setCorrectCats(
        [
          [
            {
              id: Number(results[0][0]),
              items: processItems.map((v) => v.title),
            },
          ],
          correctCats,
        ].flat()
      );
      if (correctCats.length >= 3) {
        setGameComplete(true);
        setMessage("You completed the game! Refresh to play again.");
      }
    } else {
      setLives(lives - 1);
      if (lives === 1) {
        setMessage("You lost. Maybe tomorrow will be a little easier?");
        setGameComplete(true);

        const guessedIds = new Set(correctCats.map((cat) => cat.id));
        const remainingItems = cleanData.filter(
          (item) => !guessedIds.has(item.cat_id)
        );

        // Group remaining items by category
        const remainingGroups: Record<number, Item[]> = {};
        for (const item of remainingItems) {
          if (!remainingGroups[item.cat_id]) {
            remainingGroups[item.cat_id] = [];
          }
          remainingGroups[item.cat_id]?.push(item);
        }

        const entries = Object.entries(remainingGroups);

        entries.forEach(([catIdStr, items], index) => {
          const catId = Number(catIdStr);
          const itemTitles = items.map((item) => item.title);
          const itemIds = items.map((item) => item.id);

          setTimeout(() => {
            setCorrectCats((prev) => [
              ...prev,
              { id: catId, items: itemTitles },
            ]);
            setSkipeedIds((prev) => [...prev, ...itemIds]);
          }, index * 1000); // Delay each group reveal by 1s
        });
      } else {
        setMessage("Try again.");
      }
    }
  };

  const onCopy = () => {
    console.log(history)
    const textToCopy = `Rip Connections v2\n${history
      .map((historyAction) => historyAction.join(""))
      .join("\n")}\n\nPlay it now... somewhere...`;
    try {navigator.clipboard.writeText(textToCopy)} catch {
      setMessage("Somehing went wrong while copying. Make sure the website has the permissions to od it and make sure you are focused on the web page and the browser window")
    };
  };

  // ONLY POPULATE THE cleanData WHEN IT'S EMPTY, IT'LL CAUSE AN INFINITE LOOP IF YOU REMOVE THE CONDITION
  if (isSuccess && cleanData.length <= 0) {
    setCleanData(data[1]);
    setCleanCats(data[0]);
  }

  return (
    // size of this box = gap * 3 + size of item * 4
    <div className="grid grid-cols-4 gap-5 justify-center items-center w-255 aspect-video mx-auto">
      {isPending &&
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((v, i) => (
          <Item
            id={0}
            cat_id={-1}
            selected={false}
            title=""
            tn=""
            key={i}
            mock
          />
        ))}
      {isError && <div>Error loading items: {error.message}</div>}
      {cleanData.length > 0 && (
        <>
          {correctCats
            .sort((a, b) => a.id - b.id)
            .map((cat) => (
              <div
                key={cat.id}
                className={`col-span-4 h-[8.4375rem] rounded-2xl p-4 ${
                  colors[cat.id]
                }`}
              >
                <div className="text-center font-extrabold text-3xl text-black">
                  {cleanCats[cat.id]}
                </div>
                <div className="text-center text-lg mt-2 text-black/75 flex gap-5">
                  {cleanData
                    .filter((v) => v.cat_id == cat.id)
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((item) => (
                      <div>{item.title}</div>
                    ))}
                </div>
              </div>
            ))}
          {cleanData.map((item, index) => {
            if (skippedIds.includes(item.id)) return;
            return (
              <div
                onClick={(e) => {
                  const newData = JSON.parse(JSON.stringify(cleanData));
                  if (
                    newData[index] &&
                    (newData[index].selected || selectedIds.length < 4)
                  ) {
                    if (newData[index].selected)
                      setSelecteIds(
                        selectedIds.filter((v) => v != newData[index].id)
                      );
                    else setSelecteIds([newData[index].id, ...selectedIds]);
                    newData[index].selected = !newData[index].selected;
                    setCleanData(newData);
                  }
                }}
                key={item.id}
              >
                <Item
                  title={item.title}
                  id={item.id}
                  cat_id={item.cat_id}
                  tn={item.tn}
                  selected={item.selected}
                  mock={false}
                />
              </div>
            );
          })}
        </>
      )}
      {isSuccess && (
        <>
          {!gameComplete ? (
            <>
              <button
                onClick={onsubmit}
                className="bg-emerald-300 col-span-2 w-fit ms-auto text-neutral-800 p-4 text-xl rounded-2xl hover:bg-emerald-400 transition cursor-pointer active:scale-95 select-none border border-neutral-300"
              >
                Submit
              </button>
              <button
                onClick={() => setCleanData(shuffleArray(cleanData))}
                className="bg-neutral-300 col-span-2 w-fit me-auto text-neutral-800 p-4 text-xl rounded-2xl hover:bg-neutral-400 transition cursor-pointer active:scale-95 select-none border border-neutral-300"
              >
                Shuffle
              </button>
              <div className="col-span-4 flex gap-5 justify-center">
                {range(0, lives).map((v) => (
                  <img src="wikiicon" className="size-12" key={v} />
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onCopy}
                className="bg-emerald-300 col-span-2 w-fit ms-auto text-neutral-800 p-4 text-xl rounded-2xl hover:bg-emerald-400 transition cursor-pointer active:scale-95 select-none border border-neutral-300"
              >
                Copy
              </button>
              <button
                onClick={() => setCleanData(shuffleArray(cleanData))}
                className="bg-neutral-300 col-span-2 w-fit me-auto text-neutral-800 p-4 text-xl rounded-2xl hover:bg-neutral-400 transition cursor-pointer active:scale-95 select-none border border-neutral-300"
              >
                Archive
              </button>
            </>
          )}
          <div className="col-span-4 text-center text-neutral-950">
            {message}
          </div>
        </>
      )}
    </div>
  );
}
