import Link from "next/link";

export default function SuqPageBrand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link className={`suqpage-brand ${className}`.trim()} href={href} aria-label="SuqPage home">
      <img src="/brand/suqpage-mark.svg" alt="" width="40" height="40" />
      <span>SuqPage</span>
    </Link>
  );
}
