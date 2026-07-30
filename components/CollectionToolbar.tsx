export default function CollectionToolbar({
  action,
  search,
  placeholder,
  hidden = {},
  activeFilters,
  children,
}: {
  action: string;
  search: string;
  placeholder: string;
  hidden?: Record<string, string | number | undefined>;
  activeFilters?: boolean;
  children?: React.ReactNode;
}) {
  const clearParams = new URLSearchParams();
  for (const [name, value] of Object.entries(hidden)) {
    if (value !== undefined && value !== "") clearParams.set(name, String(value));
  }
  const clearHref = clearParams.size ? `${action}?${clearParams.toString()}` : action;
  return (
    <form className="collection-toolbar" action={action} method="get">
      {Object.entries(hidden).map(([name, value]) =>
        value === undefined || value === "" ? null : (
          <input key={name} type="hidden" name={name} value={value} />
        ),
      )}
      <label className="collection-search">
        <span>Search</span>
        <input
          type="search"
          name="q"
          defaultValue={search}
          maxLength={120}
          placeholder={placeholder}
        />
      </label>
      {children}
      <button className="btn" type="submit">
        Apply
      </button>
      {activeFilters ?? Boolean(search) ? (
        <a className="small-btn" href={clearHref}>
          Clear
        </a>
      ) : null}
    </form>
  );
}
