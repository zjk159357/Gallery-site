type FilterBarProps = {
  categories: readonly string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export function FilterBar({ categories, activeCategory, onChange }: FilterBarProps) {
  return (
    <div className="filter-shell" aria-label="Photography categories">
      <div className="filter-bar" role="list">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className="filter-button"
            aria-pressed={activeCategory === category}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
