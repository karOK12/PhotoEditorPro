"use client";

import { useEffect, useState } from "react";

type RatingItem = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  full_name: string;
  is_owner: boolean;
};

type Stats = {
  total: number;
  average: number;
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
};

const emptyStats: Stats = {
  total: 0,
  average: 0,
  five: 0,
  four: 0,
  three: 0,
  two: 0,
  one: 0,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-IQ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function Stars({
  value,
  interactive = false,
  selected,
  onSelect,
}: {
  value: number;
  interactive?: boolean;
  selected?: number;
  onSelect?: (value: number) => void;
}) {
  return (
    <div className="stars" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = interactive
          ? star <= (selected ?? 0)
          : star <= value;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={`star-button ${active ? "active" : ""}`}
              onClick={() => onSelect?.(star)}
              aria-label={`${star} نجوم`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={star}
            className={`display-star ${active ? "active" : ""}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRatings() {
    try {
      setLoading(true);

      const response = await fetch("/api/ratings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "تعذر جلب التقييمات");
      }

      if (data.rating) {
        setSelected(Number(data.rating.rating) || 0);
        setComment(data.rating.comment || "");
      } else {
        setSelected(0);
        setComment("");
      }

      setRatings(Array.isArray(data.ratings) ? data.ratings : []);
      setStats(data.stats || emptyStats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء جلب التقييمات"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRatings();
  }, []);

  async function saveRating() {
    if (selected < 1 || selected > 5) {
      setError("يرجى اختيار عدد النجوم أولاً");
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating: selected,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "حدث خطأ أثناء حفظ التقييم");
      }

      setMessage("تم حفظ تقييمك بنجاح.");
      await loadRatings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء حفظ التقييم"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRating() {
    if (!window.confirm("هل تريد حذف تقييمك نهائيًا؟")) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/ratings", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "حدث خطأ أثناء حذف التقييم");
      }

      setSelected(0);
      setComment("");
      setMessage("تم حذف تقييمك.");
      await loadRatings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء حذف التقييم"
      );
    } finally {
      setDeleting(false);
    }
  }

  const distribution = [
    { label: 5, count: stats.five },
    { label: 4, count: stats.four },
    { label: 3, count: stats.three },
    { label: 2, count: stats.two },
    { label: 1, count: stats.one },
  ];

  return (
    <main dir="rtl" className="rating-page">
      <section className="hero-card">
        <div className="title-row">
          <div className="title-icon">★</div>
          <div>
            <h1>تقييم التطبيق</h1>
            <p>شاركنا تجربتك مع Photo Editor Pro</p>
          </div>
        </div>

        <div className="overview">
          <div className="average-box">
            <strong>{Number(stats.average).toFixed(1)}</strong>
            <Stars value={Math.round(Number(stats.average))} />
            <span>{stats.total} تقييم</span>
          </div>

          <div className="distribution">
            {distribution.map((item) => {
              const percentage =
                stats.total > 0
                  ? (item.count / stats.total) * 100
                  : 0;

              return (
                <div className="distribution-row" key={item.label}>
                  <span>{item.label}</span>
                  <span className="mini-star">★</span>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="write-card">
        <h2>{selected ? "تعديل تقييمك" : "قيّم التطبيق"}</h2>
        <p className="section-description">
          اختر عدد النجوم وأخبرنا عن تجربتك.
        </p>

        <Stars
          value={selected}
          selected={selected}
          interactive
          onSelect={(value) => {
            setSelected(value);
            setMessage("");
            setError("");
          }}
        />

        <div className="selected-label">
          {selected
            ? `${selected} من 5 نجوم`
            : "اضغط على النجوم لاختيار تقييمك"}
        </div>

        <textarea
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            setMessage("");
            setError("");
          }}
          maxLength={2000}
          placeholder="اكتب رأيك أو اقتراحك..."
          rows={5}
        />

        <div className="textarea-footer">
          <span>{comment.length} / 2000</span>
        </div>

        {error && <div className="status error">{error}</div>}
        {message && <div className="status success">{message}</div>}

        <div className="actions">
          <button
            type="button"
            className="save-button"
            onClick={saveRating}
            disabled={saving || deleting || loading}
          >
            {saving
              ? "جاري الحفظ..."
              : selected
                ? "تحديث التقييم"
                : "نشر التقييم"}
          </button>

          {selected > 0 && (
            <button
              type="button"
              className="delete-button"
              onClick={deleteRating}
              disabled={saving || deleting || loading}
            >
              {deleting ? "جاري الحذف..." : "حذف تقييمي"}
            </button>
          )}
        </div>
      </section>

      <section className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2>تقييمات المستخدمين</h2>
            <p>آراء حقيقية من مستخدمي Photo Editor Pro</p>
          </div>
          <span className="reviews-count">{stats.total}</span>
        </div>

        {loading ? (
          <div className="empty-card">جاري تحميل التقييمات...</div>
        ) : ratings.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">★</div>
            <strong>لا توجد تقييمات بعد</strong>
            <span>كن أول من يشارك تجربته مع التطبيق.</span>
          </div>
        ) : (
          <div className="reviews-list">
            {ratings.map((item) => (
              <article className="review-card" key={item.id}>
                <div className="review-top">
                  <div className="user-info">
                    <div className="avatar">
                      {(item.full_name || "م").trim().charAt(0)}
                    </div>

                    <div>
                      <div className="user-name">
                        {item.full_name || "مستخدم"}
                        {item.is_owner && (
                          <span className="owner-badge">تقييمي</span>
                        )}
                      </div>

                      <div className="review-date">
                        {formatDate(item.created_at)}
                        {item.updated_at !== item.created_at && (
                          <span> · تم التعديل</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Stars value={item.rating} />
                </div>

                {item.comment && (
                  <p className="review-comment">{item.comment}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .rating-page {
          min-height: calc(100dvh - 100px);
          padding: 32px 20px 60px;
          background:
            radial-gradient(circle at 85% 0%, rgba(139, 92, 246, 0.13), transparent 30%),
            radial-gradient(circle at 10% 30%, rgba(59, 130, 246, 0.08), transparent 25%),
            #08090d;
          color: #f7f7f8;
        }

        .hero-card,
        .write-card,
        .review-card,
        .empty-card {
          width: min(920px, 100%);
          margin-inline: auto;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(145deg, rgba(25,27,36,0.96), rgba(14,15,21,0.96));
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          border-radius: 24px;
        }

        .hero-card {
          padding: 28px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: linear-gradient(135deg, #f6c453, #a66b05);
          color: #17120a;
          font-size: 29px;
          box-shadow: 0 10px 30px rgba(214,158,46,0.2);
        }

        h1,
        h2,
        p {
          margin: 0;
        }

        h1 {
          font-size: 30px;
          font-weight: 850;
        }

        .title-row p,
        .section-description,
        .reviews-header p {
          margin-top: 5px;
          color: #9b9daa;
          font-size: 14px;
        }

        .overview {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 34px;
          margin-top: 30px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .average-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 10px;
        }

        .average-box strong {
          font-size: 58px;
          line-height: 1;
          font-weight: 850;
          background: linear-gradient(135deg, #fff, #d7d9e1);
          -webkit-background-clip: text;
          color: transparent;
        }

        .average-box span {
          color: #858794;
          font-size: 13px;
        }

        .stars {
          display: flex;
          gap: 3px;
          align-items: center;
          direction: ltr;
        }

        .display-star {
          font-size: 22px;
          color: #454752;
        }

        .display-star.active {
          color: #f4b83f;
        }

        .star-button {
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          background: rgba(255,255,255,0.035);
          color: #555865;
          font-size: 29px;
          cursor: pointer;
          transition: .18s ease;
        }

        .star-button:hover,
        .star-button.active {
          color: #f4b83f;
          border-color: rgba(244,184,63,0.45);
          background: rgba(244,184,63,0.08);
          transform: translateY(-2px);
        }

        .distribution {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 16px 20px 1fr 30px;
          align-items: center;
          gap: 6px;
          color: #9a9ca7;
          font-size: 13px;
        }

        .mini-star {
          color: #f4b83f;
        }

        .bar {
          height: 8px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
        }

        .bar-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #f4b83f, #d98b18);
          transition: width .35s ease;
        }

        .count {
          text-align: left;
        }

        .write-card {
          margin-top: 18px;
          padding: 28px;
        }

        .write-card h2,
        .reviews-header h2 {
          font-size: 21px;
          font-weight: 800;
        }

        .write-card > .stars {
          margin-top: 22px;
        }

        .selected-label {
          margin-top: 9px;
          color: #9b9daa;
          font-size: 13px;
        }

        textarea {
          width: 100%;
          min-height: 130px;
          margin-top: 20px;
          padding: 15px;
          box-sizing: border-box;
          resize: vertical;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          outline: none;
          background: rgba(0,0,0,0.2);
          color: #f5f5f6;
          font: inherit;
        }

        textarea:focus {
          border-color: rgba(244,184,63,0.5);
        }

        textarea::placeholder {
          color: #666875;
        }

        .textarea-footer {
          text-align: left;
          direction: ltr;
          margin-top: 6px;
          color: #666875;
          font-size: 11px;
        }

        .status {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 13px;
        }

        .status.error {
          background: rgba(220,38,38,0.1);
          color: #ff8e8e;
        }

        .status.success {
          background: rgba(34,197,94,0.1);
          color: #7ee2a0;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .save-button,
        .delete-button {
          flex: 1;
          min-height: 50px;
          border: 0;
          border-radius: 14px;
          font: inherit;
          font-weight: 750;
          cursor: pointer;
          transition: .18s ease;
        }

        .save-button {
          background: linear-gradient(135deg, #f4c75e, #b77b12);
          color: #17120a;
        }

        .delete-button {
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(248,113,113,0.18);
          color: #ff8f8f;
        }

        .save-button:hover:not(:disabled),
        .delete-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .reviews-section {
          width: min(920px, 100%);
          margin: 34px auto 0;
        }

        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding: 0 4px;
        }

        .reviews-count {
          min-width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          color: #c9cad0;
          font-size: 13px;
        }

        .reviews-list {
          display: grid;
          gap: 12px;
        }

        .review-card {
          padding: 20px;
        }

        .review-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          flex: 0 0 43px;
          border-radius: 50%;
          background: linear-gradient(135deg, #353849, #1e2029);
          color: #f2c75b;
          font-weight: 800;
        }

        .user-name {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          font-weight: 750;
        }

        .owner-badge {
          padding: 3px 7px;
          border-radius: 7px;
          background: rgba(244,184,63,0.1);
          color: #e9b949;
          font-size: 10px;
          font-weight: 700;
        }

        .review-date {
          margin-top: 4px;
          color: #71737e;
          font-size: 11px;
        }

        .review-comment {
          margin-top: 16px;
          color: #c4c5cb;
          line-height: 1.9;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 180px;
          padding: 30px;
          box-sizing: border-box;
          text-align: center;
          color: #8b8d98;
        }

        .empty-icon {
          margin-bottom: 12px;
          font-size: 34px;
          color: #454752;
        }

        .empty-card strong {
          color: #d9dae0;
        }

        .empty-card span {
          margin-top: 5px;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .rating-page {
            padding: 20px 13px 45px;
          }

          .hero-card,
          .write-card {
            padding: 20px;
            border-radius: 20px;
          }

          h1 {
            font-size: 24px;
          }

          .title-icon {
            width: 50px;
            height: 50px;
            font-size: 25px;
          }

          .overview {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .average-box {
            padding-bottom: 0;
          }

          .average-box strong {
            font-size: 50px;
          }

          .star-button {
            width: 45px;
            height: 45px;
            font-size: 27px;
          }

          .review-top {
            flex-direction: column;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
