"use client";

import { useId, useRef, useState } from "react";
import { ImageUp, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACCEPTED_TYPES, type useImageUpload } from "@/hooks/use-image-upload";

type Upload = ReturnType<typeof useImageUpload>;

/** Theme-styled drop zone with preview and live upload percentage. */
export function ImageUploadField({
  label,
  hint,
  upload,
  shape = "wide",
  disabled,
}: {
  label: string;
  hint: string;
  upload: Upload;
  shape?: "wide" | "circle";
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const uploading = upload.progress !== null;
  const locked = disabled || uploading;

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        disabled={locked}
        onChange={(e) => {
          upload.select(e.target.files?.[0]);
          e.target.value = ""; // allow picking the same file again
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!locked) upload.select(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex flex-col gap-3 rounded-3xl border-2 border-dashed p-3 transition-colors sm:flex-row sm:items-center sm:gap-4",
          dragging ? "border-primary bg-primary/10" : "border-primary/25 bg-primary/5",
          upload.error && "border-destructive/50 bg-destructive/5",
        )}
      >
        {/* Preview / empty state */}
        <button
          type="button"
          onClick={openPicker}
          disabled={locked}
          aria-label={upload.preview ? "Change image" : "Choose image"}
          className={cn(
            "group relative shrink-0 overflow-hidden bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            shape === "circle" ? "size-20 self-center rounded-full sm:self-auto" : "aspect-video w-full rounded-2xl sm:w-44",
          )}
        >
          {upload.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={upload.preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-primary">
              <ImageUp className="size-6" />
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-semibold text-primary">
              {upload.progress}%
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
          {uploading ? (
            <div className="space-y-1.5" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">
                  {upload.progress === 100 ? "Saving…" : "Uploading…"}
                </span>
                <span className="tabular-nums font-semibold text-primary">{upload.progress}%</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-primary/15"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={upload.progress ?? 0}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm">
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={locked}
                  className="font-semibold text-primary hover:underline"
                >
                  {upload.preview ? "Change image" : "Click to upload"}
                </button>{" "}
                <span className="text-muted-foreground">or drag and drop</span>
              </p>
              <p className="text-xs text-muted-foreground">{hint}</p>
              {upload.hasNewFile && (
                <p className="text-xs font-medium text-primary">New image — uploads when you save.</p>
              )}
            </>
          )}
          {upload.error && <p className="text-xs font-medium text-destructive">{upload.error}</p>}
        </div>

        {upload.preview && !uploading && (
          <div className="flex shrink-0 justify-center gap-1 sm:flex-col md:flex-row">
            <Button type="button" variant="ghost" size="icon-sm" onClick={openPicker} disabled={locked} aria-label="Replace image">
              <RefreshCw />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={upload.remove}
              disabled={locked}
              aria-label="Remove image"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
