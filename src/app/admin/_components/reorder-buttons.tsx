"use client";

import { useTransition } from "react";
import { moveVeilAction } from "../veils/actions";

/**
 * Up/down arrows that move a veil one step in the manual display order.
 * The list order in the admin dashboard IS the order on the public
 * collection page — top of the list renders first in the grid.
 */
export function ReorderButtons({
  slug,
  isFirst,
  isLast,
}: {
  slug: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, start] = useTransition();
  const move = (direction: "up" | "down") =>
    start(async () => {
      await moveVeilAction(slug, direction);
    });

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={pending || isFirst}
        aria-label="Move up"
        title="Move up"
        className="flex h-6 w-7 items-center justify-center rounded-t-md border border-mist text-graphite transition-colors hover:border-gold hover:text-gold-deep disabled:pointer-events-none disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M6 14l6-6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={pending || isLast}
        aria-label="Move down"
        title="Move down"
        className="-mt-px flex h-6 w-7 items-center justify-center rounded-b-md border border-mist text-graphite transition-colors hover:border-gold hover:text-gold-deep disabled:pointer-events-none disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M6 10l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
