"use client";

import { useActionState } from "react";

import { AUTH_NEW_PASSWORD_INPUT_PROPS } from "@/components/auth/auth-input-props";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resetUserPasswordAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";

const initialState: AdminUserActionState = {};

type ResetPasswordFieldsProps = {
  userId: string;
  enabled: boolean;
  compact?: boolean;
};

export function ResetPasswordFields({
  userId,
  enabled,
  compact = false,
}: ResetPasswordFieldsProps) {
  const [state, action, pending] = useActionState(
    resetUserPasswordAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <label
        htmlFor={`password-${userId}`}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Reset password
      </label>
      <Input
        id={`password-${userId}`}
        name="password"
        required
        minLength={8}
        {...AUTH_NEW_PASSWORD_INPUT_PROPS}
        disabled={!enabled || pending}
        placeholder="New password (min 8 characters)"
      />
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex gap-2"}>
        <Input
          name="confirmPassword"
          required
          minLength={8}
          {...AUTH_NEW_PASSWORD_INPUT_PROPS}
          disabled={!enabled || pending}
          placeholder="Confirm password"
        />
        <Button
          type="submit"
          variant="action"
          size="sm"
          className="shrink-0"
          disabled={!enabled || pending}
        >
          {pending ? "Updating..." : "Reset Password"}
        </Button>
      </div>
      {!enabled ? (
        <p className="text-xs text-muted-foreground">
          Add the Supabase service-role key to enable password changes.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
