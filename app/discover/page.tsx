import { redirect } from "next/navigation";

export default async function DiscoverRedirect({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const target = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => target.append(key, item));
    else if (value !== undefined) target.set(key, value);
  }

  redirect(target.size > 0 ? `/?${target.toString()}` : "/");
}
