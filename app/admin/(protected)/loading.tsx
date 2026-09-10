export default function Loading() {
  return (
    <div role="status" className="admin-loading">
      <span>관리 화면을 불러오는 중…</span>
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="stat-card skeleton" key={i}>
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
