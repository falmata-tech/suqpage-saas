import Link from "next/link";

export default function AfricMadeBrand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link className={`africmade-brand ${className}`.trim()} href={href} aria-label="AfricMade home">
      <img src="/brand/africmade-mark.svg" alt="" width="40" height="44" />
      <span className="africmade-wordmark"><span>afric</span><span>made</span></span>
    </Link>
  );
}
