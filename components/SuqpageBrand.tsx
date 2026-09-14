import Link from "next/link";

export default function SuqpageBrand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link className={`suqpage-brand ${className}`.trim()} href={href} aria-label="Suqpage home">
      <img src="/brand/suqpage-mark.svg" alt="" width="40" height="44" />
      <span className="suqpage-wordmark"><span>suq</span><span>page</span></span>
    </Link>
  );
}
