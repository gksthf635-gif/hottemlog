import Link from "next/link";
import type { Analytics } from "@/types";
export function Stats({
  items,
}: {
  items: { label: string; value: number; note?: string }[];
}) {
  return (
    <div className="stats-grid">
      {items.map((i) => (
        <div className="stat-card" key={i.label}>
          <span>{i.label}</span>
          <strong>{i.value.toLocaleString("ko-KR")}</strong>
          {i.note && <small>{i.note}</small>}
        </div>
      ))}
    </div>
  );
}
export function DailyChart({ daily }: { daily: Analytics["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.count));
  const points = daily
    .map(
      (d, i) =>
        `${30 + (i / Math.max(1, daily.length - 1)) * 640},${175 - (d.count / max) * 140}`,
    )
    .join(" ");
  return (
    <div className="chart-panel">
      <h2>날짜별 클릭</h2>
      <p className="form-hint">한국 시간 기준 · 쿠팡으로 이동한 횟수</p>
      <svg
        viewBox="0 0 700 210"
        role="img"
        aria-label={`${daily[0]?.date || ""}부터 ${daily.at(-1)?.date || ""}까지 클릭 추이. 총 ${daily.reduce((sum, d) => sum + d.count, 0)}회`}
      >
        <line
          x1="30"
          y1="35"
          x2="670"
          y2="35"
          stroke="#f0dfe5"
          strokeDasharray="4 4"
        />
        <line
          x1="30"
          y1="105"
          x2="670"
          y2="105"
          stroke="#f0dfe5"
          strokeDasharray="4 4"
        />
        <line x1="30" y1="175" x2="670" y2="175" stroke="#e9dce1" />
        <polygon points={`30,175 ${points} 670,175`} fill="#fce4ec" />
        <polyline
          points={points}
          fill="none"
          stroke="#b45b7c"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {daily.length === 1 && (
          <circle
            cx="30"
            cy={175 - (daily[0].count / max) * 140}
            r="4"
            fill="#b45b7c"
          />
        )}
        <text x="30" y="202" fontSize="12" fill="#77777d">
          {daily[0]?.date}
        </text>
        <text x="670" y="202" textAnchor="end" fontSize="12" fill="#77777d">
          {daily.at(-1)?.date}
        </text>
      </svg>
      <details>
        <summary>날짜별 수치 보기</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>클릭</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.count.toLocaleString()}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
export function Ranking({
  title,
  rows,
  kind,
  limit = 10,
}: {
  title: string;
  rows: { id: string; name: string; count: number }[];
  kind?: "products" | "videos";
  limit?: number;
}) {
  return (
    <section className="ranking-panel">
      <h2>{title}</h2>
      {rows.length ? (
        <ol>
          {rows.slice(0, limit).map((r, i) => (
            <li key={r.id}>
              <span className="rank-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              {kind && r.id !== "deleted" ? (
                <Link href={`/admin/${kind}/${r.id}`}>{r.name}</Link>
              ) : (
                <span>{r.name}</span>
              )}
              <strong>
                {r.count.toLocaleString()}
                <small>회</small>
              </strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="admin-empty">아직 기록된 클릭이 없습니다.</p>
      )}
    </section>
  );
}
