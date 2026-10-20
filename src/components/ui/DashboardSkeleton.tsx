const PLACEHOLDER_CARDS = 3;

/**
 * Stand-in for the dashboard while the first load is in flight. It keeps the
 * header height and the card grid in place so nothing jumps when data lands.
 */
export default function DashboardSkeleton() {
  return (
    <main
      className="dashboard dashboard-v2"
      aria-busy="true"
    >
      <div
        className="skeleton-header"
        aria-hidden="true"
      >
        <span className="skeleton-block skeleton-brand" />
        <span className="skeleton-block skeleton-user" />
      </div>

      <section
        className="dashboard-content"
        role="status"
      >
        <span className="visually-hidden">
          Carregando seus dados...
        </span>

        <div aria-hidden="true">
          <span className="skeleton-block skeleton-heading" />
          <span className="skeleton-block skeleton-text" />
        </div>

        <div
          className="insulin-grid"
          aria-hidden="true"
        >
          {Array.from(
            { length: PLACEHOLDER_CARDS },
            (_, index) => (
              <div
                key={index}
                className="skeleton-card"
              >
                <span className="skeleton-block skeleton-title" />
                <span className="skeleton-block skeleton-stock" />
                <span className="skeleton-block skeleton-metrics" />
                <span className="skeleton-block skeleton-button" />
                <span className="skeleton-block skeleton-button skeleton-button-short" />
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
