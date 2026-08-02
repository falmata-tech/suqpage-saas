import Link from "next/link";

export default function MirtPageBrand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link className={`mirtpage-brand ${className}`.trim()} href={href} aria-label="MirtPage home">
      <img src="/brand/mirtpage-mark.svg" alt="" width="40" height="40" />
      <span>MirtPage</span>
    </Link>
  );
}
