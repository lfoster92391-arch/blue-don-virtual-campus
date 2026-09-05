"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import {
  Field,
  FormFeedback,
  ImageField,
  Select,
  StatusPill,
  TextArea,
  initialSportsState,
} from "@/components/sports/form-primitives";
import { HighlightSubmitForm } from "@/components/sports/sports-student-forms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GAME_SITE_LABELS,
  GAME_STATUS_LABELS,
  HIGHLIGHT_KIND_LABELS,
  HIGHLIGHT_STATUS_LABELS,
  REPORT_KIND_LABELS,
  REPORT_STATUS_LABELS,
  SPORT_SEASON_LABELS,
  formatGameDateTime,
  statFieldsForSport,
  type GameSiteKey,
  type GameStatusKey,
  type SportSeasonKey,
} from "@/config/sports-highlights";
import {
  archiveOpponentSchoolAction,
  archivePlayerAction,
  deleteGameAction,
  deleteHighlightAction,
  removeOpponentTeamAction,
  saveGameAction,
  saveOpponentSchoolAction,
  saveOpponentTeamAction,
  savePlayerAction,
  savePlayerStatAction,
  saveSportAction,
  setHighlightStatusAction,
  setReportStatusAction,
  toggleSportAction,
} from "@/features/sports-highlights/actions";
import type {
  OpponentSchoolView,
  OpponentTeamView,
  SportView,
  SportsGameView,
  SportsHighlightView,
  SportsPlayerView,
  SportsPlayerStatView,
  SportsReportView,
} from "@/services/sports-highlights-service";

function Logo({
  url,
  fallback,
  size = "md",
}: {
  url: string | null;
  fallback: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "size-8" : "size-11";
  if (url) {
    return (
      // Opponent art is user-uploaded or pasted from another school's site.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`${dimension} shrink-0 rounded-md bg-white object-contain p-0.5 ring-1 ring-border`}
      />
    );
  }
  return (
    <span
      className={`${dimension} flex shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase text-muted-foreground`}
      aria-hidden="true"
    >
      {fallback.slice(0, 2)}
    </span>
  );
}

/* --------------------------------------------------- opponent school import */

function SchoolForm({
  sports,
  storageConfigured,
  school,
  onDone,
}: {
  sports: SportView[];
  storageConfigured: boolean;
  school?: OpponentSchoolView;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveOpponentSchoolAction,
    initialSportsState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      {school ? <input type="hidden" name="schoolId" value={school.id} /> : null}

      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          {school ? `Edit ${school.name}` : "Add an opponent school"}
        </p>
        {onDone ? (
          <Button size="icon-sm" variant="ghost" onClick={onDone} aria-label="Close">
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="School name"
          name="name"
          required
          placeholder="Indian Creek High School"
          defaultValue={school?.name}
        />
        <Field
          label="Short name"
          name="shortName"
          placeholder="Indian Creek"
          defaultValue={school?.shortName ?? undefined}
        />
        <Field
          label="Mascot"
          name="mascot"
          placeholder="Redskins"
          defaultValue={school?.mascot ?? undefined}
        />
        <Field
          label="City"
          name="city"
          placeholder="Wintersville"
          defaultValue={school?.city ?? undefined}
        />
        <Field
          label="State"
          name="state"
          placeholder="OH"
          defaultValue={school?.state ?? undefined}
        />
        <Field
          label="Team color"
          name="colorPrimary"
          placeholder="#B22222"
          defaultValue={school?.colorPrimary ?? undefined}
        />
      </div>

      <ImageField
        label="School logo"
        fileName="logo"
        urlName="logoUrl"
        storageConfigured={storageConfigured}
        currentUrl={school?.logoUrl}
        hint="Shown on the banner, schedule, and the picker students tap."
      />

      {!school ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Link a sport now (optional)"
            name="sportId"
            placeholder="Pick a sport"
            options={sports.map((sport) => ({
              value: sport.id,
              label: sport.name,
            }))}
          />
          <Field
            label="Their team name for that sport"
            name="teamName"
            placeholder="Indian Creek Football"
            hint="Leave blank to reuse the school name."
          />
        </div>
      ) : null}

      <TextArea
        label="Notes"
        name="notes"
        placeholder="Rivalry history, travel notes, contact…"
        defaultValue={school?.notes ?? undefined}
      />

      <FormFeedback
        state={state}
        pending={pending}
        submitLabel={school ? "Save school" : "Add school"}
      />
    </form>
  );
}

function LinkSportForm({
  schools,
  sports,
  storageConfigured,
}: {
  schools: OpponentSchoolView[];
  sports: SportView[];
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveOpponentTeamAction,
    initialSportsState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      <p className="font-medium">Link a school to a sport</p>
      <p className="text-sm text-muted-foreground">
        Give each opponent a team name per sport — &ldquo;Indian Creek
        Football&rdquo; — so students see the right name when they pick a game.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="School"
          name="schoolId"
          required
          placeholder="Pick a school"
          options={schools.map((school) => ({
            value: school.id,
            label: school.name,
          }))}
        />
        <Select
          label="Sport"
          name="sportId"
          required
          placeholder="Pick a sport"
          options={sports.map((sport) => ({
            value: sport.id,
            label: sport.name,
          }))}
        />
      </div>

      <Field
        label="Their sports name"
        name="teamName"
        required
        placeholder="Indian Creek Football"
      />

      <ImageField
        label="Team logo (optional — defaults to the school logo)"
        fileName="logo"
        urlName="logoUrl"
        storageConfigured={storageConfigured}
      />

      <FormFeedback state={state} pending={pending} submitLabel="Save team" />
    </form>
  );
}

/** Lisa's "Import schools" workspace: upload logos, name teams per sport. */
export function OpponentDirectoryPanel({
  schools,
  sports,
  storageConfigured,
}: {
  schools: OpponentSchoolView[];
  sports: SportView[];
  storageConfigured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(schools.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {schools.length} school{schools.length === 1 ? "" : "s"} in the
          directory. Students pick from these — they never type an opponent name.
        </p>
        <Button size="sm" onClick={() => setShowAdd((value) => !value)}>
          <Plus className="size-3.5" />
          {showAdd ? "Close" : "Add school"}
        </Button>
      </div>

      {showAdd ? (
        <SchoolForm
          sports={sports}
          storageConfigured={storageConfigured}
          onDone={() => setShowAdd(false)}
        />
      ) : null}

      {schools.length > 0 ? (
        <ul className="space-y-3">
          {schools.map((school) => (
            <li key={school.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start gap-3">
                <Logo url={school.logoUrl} fallback={school.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{school.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[school.mascot, school.city, school.state]
                      .filter(Boolean)
                      .join(" · ") || "No mascot or location set"}
                  </p>
                  {school.teams.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {school.teams.map((team) => (
                        <li
                          key={team.id}
                          className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs"
                        >
                          <Logo url={team.logoUrl} fallback={team.teamName} size="sm" />
                          <span>{team.teamName}</span>
                          <span className="text-muted-foreground">
                            · {team.sportName}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${team.teamName}`}
                            disabled={pending}
                            onClick={() =>
                              startTransition(() => {
                                void removeOpponentTeamAction(team.id);
                              })
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      Not linked to a sport yet — students won&rsquo;t see this
                      school in game pickers until you link one.
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Edit ${school.name}`}
                    onClick={() =>
                      setEditingId((current) =>
                        current === school.id ? null : school.id,
                      )
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Archive ${school.name}`}
                    disabled={pending}
                    onClick={() =>
                      startTransition(() => {
                        void archiveOpponentSchoolAction(school.id);
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {editingId === school.id ? (
                <div className="mt-3">
                  <SchoolForm
                    sports={sports}
                    storageConfigured={storageConfigured}
                    school={school}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {schools.length > 0 ? (
        <LinkSportForm
          schools={schools}
          sports={sports}
          storageConfigured={storageConfigured}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- sport catalog */

export function SportManagerPanel({ sports }: { sports: SportView[] }) {
  const [state, formAction, pending] = useActionState(
    saveSportAction,
    initialSportsState,
  );
  const [togglePending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <ul className="grid gap-2 sm:grid-cols-2">
        {sports.map((sport) => (
          <li
            key={sport.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {sport.emoji ? `${sport.emoji} ` : ""}
                {sport.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {SPORT_SEASON_LABELS[sport.season]}
              </span>
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={togglePending}
              onClick={() =>
                startTransition(() => {
                  void toggleSportAction(sport.id, !sport.isActive);
                })
              }
            >
              {sport.isActive ? "Hide" : "Show"}
            </Button>
          </li>
        ))}
      </ul>

      <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
        <p className="font-medium">Add a sport</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sport name" name="name" required placeholder="Girls Soccer" />
          <Select
            label="Season"
            name="season"
            defaultValue="FALL"
            options={(
              Object.keys(SPORT_SEASON_LABELS) as SportSeasonKey[]
            ).map((key) => ({ value: key, label: SPORT_SEASON_LABELS[key] }))}
          />
          <Field label="Emoji" name="emoji" placeholder="⚽" />
          <Field label="Sort order" name="sortOrder" type="number" placeholder="50" />
        </div>
        <FormFeedback state={state} pending={pending} submitLabel="Add sport" />
      </form>
    </div>
  );
}

/* ---------------------------------------------------------- game scheduling */

export function GameEditorPanel({
  sports,
  teams,
  games,
  defaultSportId,
}: {
  sports: SportView[];
  teams: OpponentTeamView[];
  games: SportsGameView[];
  defaultSportId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveGameAction,
    initialSportsState,
  );
  const [deletePending, startTransition] = useTransition();
  const [sportId, setSportId] = useState(defaultSportId ?? sports[0]?.id ?? "");
  const [teamId, setTeamId] = useState("");

  const sportTeams = useMemo(
    () => teams.filter((team) => team.sportId === sportId),
    [teams, sportId],
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
        <p className="font-medium">Post a game</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Sport"
            name="sportId"
            required
            value={sportId}
            onChange={(next) => {
              setSportId(next);
              setTeamId("");
            }}
            placeholder="Pick a sport"
            options={sports.map((sport) => ({
              value: sport.id,
              label: sport.name,
            }))}
          />
          <Field label="Date & time" name="kickoffAt" type="datetime-local" required />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Opponent</p>
          {sportTeams.length === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No schools linked to this sport yet. Add them under Opponent
              directory first, or type a one-off name below.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {sportTeams.map((team) => {
                const selected = teamId === team.id;
                return (
                  <li key={team.id}>
                    <button
                      type="button"
                      onClick={() => setTeamId(selected ? "" : team.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                        selected
                          ? "border-[#0A2342] bg-[#0A2342]/5 dark:border-[#2F80ED] dark:bg-[#2F80ED]/10"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <Logo url={team.logoUrl} fallback={team.teamName} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {team.teamName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {team.schoolName}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <input type="hidden" name="opponentTeamId" value={teamId} />
          <Field
            label="Or a one-off opponent name"
            name="opponentLabel"
            placeholder="Tri-county invitational"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Home or away"
            name="site"
            defaultValue="HOME"
            options={(Object.keys(GAME_SITE_LABELS) as GameSiteKey[]).map(
              (key) => ({ value: key, label: GAME_SITE_LABELS[key] }),
            )}
          />
          <Select
            label="Status"
            name="status"
            defaultValue="SCHEDULED"
            options={(Object.keys(GAME_STATUS_LABELS) as GameStatusKey[]).map(
              (key) => ({ value: key, label: GAME_STATUS_LABELS[key] }),
            )}
          />
          <Field label="Venue" name="venue" placeholder="Madonna gym" />
          <Field label="Level" name="level" placeholder="Varsity / JV" />
          <Field label="Blue Dons score" name="teamScore" type="number" />
          <Field label="Opponent score" name="opponentScore" type="number" />
        </div>

        <Field
          label="Headline"
          name="headline"
          placeholder="Blue Dons take the rivalry game in overtime"
        />
        <TextArea label="Summary" name="summary" placeholder="Short recap for the banner…" />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Stream / watch link"
            name="streamUrl"
            type="url"
            placeholder="https://…"
          />
          <Field
            label="Crew coverage note"
            name="broadcastNote"
            placeholder="2 cameras + sideline photos"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" className="size-4" />
          Feature this game
        </label>

        <FormFeedback state={state} pending={pending} submitLabel="Save game" />
      </form>

      <div className="space-y-2">
        <p className="font-medium">Schedule</p>
        {games.length === 0 ? (
          <p className="text-sm text-muted-foreground">No games posted yet.</p>
        ) : (
          <ul className="space-y-2">
            {games.map((game) => (
              <li
                key={game.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <Logo url={game.opponentLogoUrl} fallback={game.opponentName} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {game.sportName} {game.site === "HOME" ? "vs" : "at"}{" "}
                    {game.opponentName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatGameDateTime(game.kickoffAt)} ·{" "}
                    {GAME_STATUS_LABELS[game.status]}
                    {game.teamScore !== null && game.opponentScore !== null
                      ? ` · ${game.teamScore}–${game.opponentScore}`
                      : ""}
                  </span>
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove game"
                  disabled={deletePending}
                  onClick={() =>
                    startTransition(() => {
                      void deleteGameAction(game.id);
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- reviewing */

export function HighlightReviewList({
  highlights,
  sports,
  games,
  storageConfigured,
}: {
  highlights: SportsHighlightView[];
  sports: SportView[];
  games: SportsGameView[];
  storageConfigured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (highlights.length === 0) {
    return <p className="text-sm text-muted-foreground">No highlights yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="rounded-lg border border-border px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">{highlight.title}</p>
              <p className="text-xs text-muted-foreground">
                {HIGHLIGHT_KIND_LABELS[highlight.kind]} · {highlight.sportName}
                {highlight.submittedByName ? ` · ${highlight.submittedByName}` : ""}
                {highlight.gameLabel ? ` · ${highlight.gameLabel}` : ""}
              </p>
              {highlight.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {highlight.description}
                </p>
              ) : null}
            </div>
            <StatusPill
              label={HIGHLIGHT_STATUS_LABELS[highlight.status]}
              tone={highlight.status === "PUBLISHED" ? "success" : "muted"}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              size="sm"
              className="min-h-10 w-full sm:w-auto"
              disabled={pending || highlight.status === "PUBLISHED"}
              onClick={() =>
                startTransition(() => {
                  void setHighlightStatusAction(highlight.id, "PUBLISHED");
                })
              }
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-10 w-full sm:w-auto"
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  void setHighlightStatusAction(
                    highlight.id,
                    "PUBLISHED",
                    !highlight.isFeatured,
                  );
                })
              }
            >
              {highlight.isFeatured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="min-h-10 w-full sm:w-auto"
              disabled={pending || highlight.status === "ARCHIVED"}
              onClick={() =>
                startTransition(() => {
                  void setHighlightStatusAction(highlight.id, "ARCHIVED");
                })
              }
            >
              Archive
            </Button>
            <Button
              size="sm"
              className="min-h-10 w-full sm:w-auto"
              disabled={pending}
              onClick={() =>
                setEditingId((current) =>
                  current === highlight.id ? null : highlight.id,
                )
              }
            >
              {editingId === highlight.id ? "Cancel edit" : "Edit"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="min-h-10 w-full sm:w-auto"
              disabled={pending}
              onClick={() => {
                if (
                  !window.confirm(
                    `Delete “${highlight.title}”? This removes the whole submission.`,
                  )
                ) {
                  return;
                }
                startTransition(() => {
                  void deleteHighlightAction(highlight.id);
                });
              }}
            >
              Delete
            </Button>
          </div>
          {editingId === highlight.id ? (
            <div className="mt-4 border-t border-border pt-4">
              <HighlightSubmitForm
                key={highlight.id}
                sports={sports}
                games={games}
                storageConfigured={storageConfigured}
                canManage
                highlight={highlight}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ReportReviewList({ reports }: { reports: SportsReportView[] }) {
  const [pending, startTransition] = useTransition();

  if (reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No student write-ups yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded-lg border border-border px-3 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">{report.headline}</p>
              <p className="text-xs text-muted-foreground">
                {REPORT_KIND_LABELS[report.kind]} · {report.authorName}
                {report.gameLabel ? ` · ${report.gameLabel}` : ""}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {report.body}
              </p>
              {report.playerOfGame ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Player of the game: {report.playerOfGame}
                </p>
              ) : null}
              {report.keyMoment ? (
                <p className="text-sm text-muted-foreground">
                  Key moment: {report.keyMoment}
                </p>
              ) : null}
              {report.whatToWatch ? (
                <p className="text-sm text-muted-foreground">
                  What to watch: {report.whatToWatch}
                </p>
              ) : null}
            </div>
            <StatusPill
              label={REPORT_STATUS_LABELS[report.status]}
              tone={report.status === "PUBLISHED" ? "success" : "muted"}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["PUBLISHED", "APPROVED", "DECLINED"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === "PUBLISHED" ? "default" : "outline"}
                disabled={pending || report.status === status}
                onClick={() =>
                  startTransition(() => {
                    void setReportStatusAction(report.id, status);
                  })
                }
              >
                {REPORT_STATUS_LABELS[status]}
              </Button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------- roster + stat sheet */

export function RosterPanel({
  sports,
  players,
  storageConfigured,
  defaultSportId,
}: {
  sports: SportView[];
  players: SportsPlayerView[];
  storageConfigured: boolean;
  defaultSportId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    savePlayerAction,
    initialSportsState,
  );
  const [archivePending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No players on the roster yet. Add them here so stats and player-of-the-game
          callouts have somewhere to land.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <Logo url={player.photoUrl} fallback={player.fullName} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
                  {player.fullName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[player.position, player.gradeYear].filter(Boolean).join(" · ") ||
                    "Roster"}
                </span>
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Archive ${player.fullName}`}
                disabled={archivePending}
                onClick={() =>
                  startTransition(() => {
                    void archivePlayerAction(player.id);
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
        <p className="font-medium">Add a player</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Sport"
            name="sportId"
            required
            defaultValue={defaultSportId ?? sports[0]?.id}
            placeholder="Pick a sport"
            options={sports.map((sport) => ({
              value: sport.id,
              label: sport.name,
            }))}
          />
          <Field label="Jersey number" name="jerseyNumber" placeholder="12" />
          <Field label="First name" name="firstName" required />
          <Field label="Last name" name="lastName" required />
          <Field label="Position" name="position" placeholder="Setter" />
          <Field label="Grade / year" name="gradeYear" placeholder="Junior" />
        </div>
        <ImageField
          label="Player photo"
          fileName="photo"
          urlName="photoUrl"
          storageConfigured={storageConfigured}
        />
        <FormFeedback state={state} pending={pending} submitLabel="Add player" />
      </form>
    </div>
  );
}

export function PlayerStatEditor({
  players,
  games,
  sportSlug,
  defaultGameId,
}: {
  players: SportsPlayerView[];
  games: SportsGameView[];
  sportSlug: string;
  defaultGameId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    savePlayerStatAction,
    initialSportsState,
  );
  const fields = statFieldsForSport(sportSlug);

  if (players.length === 0 || games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least one player and one game for this sport to record stats.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sportSlug" value={sportSlug} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Player"
          name="playerId"
          required
          placeholder="Pick a player"
          options={players.map((player) => ({
            value: player.id,
            label: player.jerseyNumber
              ? `#${player.jerseyNumber} ${player.fullName}`
              : player.fullName,
          }))}
        />
        <Select
          label="Game"
          name="gameId"
          required
          defaultValue={defaultGameId}
          placeholder="Pick a game"
          options={games.map((game) => ({
            value: game.id,
            label: `${game.site === "HOME" ? "vs" : "at"} ${game.opponentName} · ${formatGameDateTime(game.kickoffAt)}`,
          }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            name={`stat_${field.key}`}
            placeholder={field.short}
          />
        ))}
      </div>

      <TextArea label="Notes" name="notes" placeholder="Career high, milestone…" />

      <FormFeedback state={state} pending={pending} submitLabel="Save stat line" />
    </form>
  );
}

export function PlayerStatTable({
  stats,
  sportSlug,
  emptyLabel = "No stats recorded yet.",
}: {
  stats: SportsPlayerStatView[];
  sportSlug: string;
  emptyLabel?: string;
}) {
  const fields = statFieldsForSport(sportSlug);

  if (stats.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Player</th>
            {fields.map((field) => (
              <th key={field.key} className="py-2 pr-3 font-medium">
                {field.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map((row) => (
            <tr key={row.id} className="border-b border-border/60">
              <td className="py-2 pr-3">
                <span className="font-medium">
                  {row.jerseyNumber ? `#${row.jerseyNumber} ` : ""}
                  {row.playerName}
                </span>
                {row.notes ? (
                  <span className="block text-xs text-muted-foreground">
                    {row.notes}
                  </span>
                ) : null}
              </td>
              {fields.map((field) => (
                <td key={field.key} className="py-2 pr-3 tabular-nums">
                  {row.stats[field.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
