import { BRAND } from "@/config/brand";

const LABELS: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };

export function socialLinks() {
  return Object.entries(BRAND.socials)
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, label: LABELS[key] ?? key }));
}

export function SocialButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      {socialLinks().map((s) => (
        <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="btn-ghost">
          {s.label} ↗
        </a>
      ))}
    </div>
  );
}
