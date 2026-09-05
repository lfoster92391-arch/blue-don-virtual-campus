export type PhoneAccessHintData = {
  productionLogin: string;
  lanLogin: string | null;
};

export function PhoneAccessHint({ hint }: { hint: PhoneAccessHintData }) {
  return (
    <div
      role="note"
      className="rounded-lg border border-[#2F80ED]/30 bg-[#2F80ED]/10 p-3 text-sm text-[#0A2342] dark:text-white"
    >
      <p className="font-medium">This address only works on this computer.</p>
      <p className="mt-1 text-muted-foreground">
        On your phone, open{" "}
        <a href={hint.productionLogin} className="font-medium underline">
          {hint.productionLogin}
        </a>
        {hint.lanLogin ? (
          <>
            {" "}
            or, on the same Wi‑Fi as this PC,{" "}
            <span className="break-all font-medium">{hint.lanLogin}</span>
          </>
        ) : null}
        . Do not use localhost on the phone.
      </p>
    </div>
  );
}
