"use client";

import { useRef } from "react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAMPUS_IMAGE_ACCEPT_WITH_SVG } from "@/config/uploads";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";
import { cn } from "@/lib/utils";
import type { SportsActionState } from "@/features/sports-highlights/actions";

export const initialSportsState: SportsActionState = {};

export function Field({
  label,
  name,
  id,
  type = "text",
  required,
  placeholder,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  id?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
}) {
  const fieldId = id ?? `sports-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={fieldId}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  rows = 3,
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  const fieldId = `sports-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const fieldId = `sports-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ImageField({
  label,
  fileName = "image",
  urlName = "imageUrl",
  storageConfigured,
  currentUrl,
  hint,
}: {
  label: string;
  fileName?: string;
  urlName?: string;
  storageConfigured: boolean;
  currentUrl?: string | null;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const guard = useUploadGuard({ inputRef });

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <p className="text-sm font-medium">{label}</p>
      {currentUrl ? (
        <div className="flex items-center gap-3">
          {/* Logos are arbitrary remote URLs, so plain img avoids host allowlisting. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt=""
            className="size-12 rounded-md bg-white object-contain p-0.5 ring-1 ring-border"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="clearImage" value="1" className="size-3.5" />
            Remove current image
          </label>
        </div>
      ) : null}

      {storageConfigured ? (
        <div className="space-y-1.5">
          <label htmlFor={`sports-${fileName}`} className="text-xs text-muted-foreground">
            Upload an image (PNG, JPG, WEBP, SVG, or a photo straight off your
            phone — big photos are resized automatically)
          </label>
          <input
            ref={inputRef}
            id={`sports-${fileName}`}
            name={fileName}
            type="file"
            accept={CAMPUS_IMAGE_ACCEPT_WITH_SVG}
            onChange={guard.onFileChange}
            className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0A2342] file:px-3 file:py-1.5 file:text-sm file:text-white"
          />
          <UploadGuardNotice guard={guard} />
        </div>
      ) : (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Campus storage is not configured yet — paste an image URL below instead.
        </p>
      )}

      <Field
        label="…or paste an image URL"
        name={urlName}
        type="url"
        placeholder="https://…"
        hint={hint}
      />
    </div>
  );
}

export function StatusPill({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "muted" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "success" && "bg-[#2E8B57]/10 text-[#2E8B57]",
        tone === "warning" && "bg-[#D4A017]/10 text-[#D4A017]",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function FormFeedback({
  state,
  pending,
  submitLabel,
}: {
  state: SportsActionState;
  pending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-2">
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]" role="status">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}
