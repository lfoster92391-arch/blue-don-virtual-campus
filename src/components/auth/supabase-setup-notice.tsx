export function SupabaseSetupNotice() {
  return (
    <div className="space-y-4 rounded-xl border border-[#D4A017]/40 bg-[#D4A017]/10 p-4 text-sm">
      <p className="font-medium text-[#0A2342] dark:text-white">
        Add your Supabase credentials
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
        <li>
          Create a project at{" "}
          <a
            href="https://supabase.com/dashboard"
            className="font-medium text-[#2F80ED] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com/dashboard
          </a>
        </li>
        <li>
          Open Project Settings → API and copy the Project URL and anon public
          key
        </li>
        <li>
          Paste them into{" "}
          <code className="rounded bg-muted px-1 py-0.5">.env</code> in this
          project folder
        </li>
        <li>Restart the dev server with `npm run dev`</li>
      </ol>
      <pre className="overflow-x-auto rounded-lg bg-[#0A2342] p-3 text-xs text-[#C6CCD6]">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=your-postgres-connection-string`}
      </pre>
    </div>
  );
}
