"use client";

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Hash, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;

/** "#Next JS " → "next-js" (same rules as the server action). */
export function normalizeTag(raw: string) {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, MAX_TAG_LENGTH);
}

/**
 * Pill-style tag editor. Enter / comma / Tab adds a tag, Backspace on an empty
 * field removes the last one, pasting "a, b, c" adds several. Submits as a
 * comma-separated hidden field named `name`, so the Server Action is unchanged.
 */
export function TagInput({
  name,
  label,
  defaultValue = [],
  placeholder = "Add a tag…",
  disabled,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const full = tags.length >= MAX_TAGS;

  function add(values: string[]) {
    setTags((current) => {
      const next = [...current];
      for (const value of values) {
        const tag = normalizeTag(value);
        if (!tag || next.includes(tag)) continue;
        if (next.length >= MAX_TAGS) {
          setNotice(`You can add up to ${MAX_TAGS} tags`);
          break;
        }
        next.push(tag);
      }
      return next;
    });
    setDraft("");
  }

  function remove(tag: string) {
    setTags((current) => current.filter((t) => t !== tag));
    setNotice(null);
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Enter must not submit the whole form
      add([draft]);
    } else if (e.key === "Tab" && draft.trim()) {
      e.preventDefault();
      add([draft]);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      remove(tags[tags.length - 1]);
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (!/[,\n]/.test(text)) return;
    e.preventDefault();
    add(text.split(/[,\n]/));
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={inputId}>{label}</Label>

      {/* What the Server Action reads */}
      <input type="hidden" name={name} value={tags.join(",")} />

      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-3xl border border-transparent bg-input/50 px-1.5 py-1 transition-[color,box-shadow,background-color]",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-6 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 pr-1 pl-2.5 text-xs font-medium text-primary"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              aria-label={`Remove tag ${tag}`}
              className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        <div className="flex min-w-28 flex-1 items-center gap-1 px-1.5">
          {tags.length === 0 && <Hash className="size-3.5 shrink-0 text-muted-foreground" />}
          <input
            ref={inputRef}
            id={inputId}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value.replace(",", ""));
              setNotice(null);
            }}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={() => draft.trim() && add([draft])}
            disabled={disabled || full}
            maxLength={MAX_TAG_LENGTH + 1}
            placeholder={full ? "Tag limit reached" : tags.length ? "" : placeholder}
            aria-describedby={hintId}
            enterKeyHint="done"
            className="h-6 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
          />
        </div>
      </div>

      <p id={hintId} className={cn("text-xs", notice ? "text-destructive" : "text-muted-foreground")}>
        {notice ?? `Press Enter or comma to add · ${tags.length}/${MAX_TAGS}`}
      </p>
    </div>
  );
}
