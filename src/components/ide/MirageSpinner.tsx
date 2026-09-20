/**
 * Mirage-style stream spinner (LDRS-inspired, owned CSS — no ldrs package).
 * Decorative; parent region provides the accessible name.
 */
export function MirageSpinner() {
  return (
    <span className="mirage-spinner text-foreground" aria-hidden="true">
      <span className="mirage-spinner__track">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="mirage-spinner__dot" />
        ))}
      </span>
    </span>
  );
}
