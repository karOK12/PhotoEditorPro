"use client";

import { useEffect, useState } from "react";

type RatingItem = {
  id: string;
  user_id: string;
  full_name: string | null;
  profile_image: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
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

function Stars({
  value,
  interactive = false,
  onChange,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div
      className={interactive ? "rating-stars rating-stars-input" : "rating-stars"}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "اختر تقييمك من نجمة إلى خمس نجوم" : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        const icon = (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="star-icon"
            fill={active ? "#fbbc04" : "none"}
            stroke={active ? "#fbbc04" : "#8a8a8a"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77l-6.18 3.23L7 14.13l-5-4.87 6.91-1L12 2z" />
          </svg>
        );

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className="star"
              onClick={() => onChange?.(star)}
              aria-label={`${star} نجوم`}
              aria-pressed={active}
            >
              {icon}
            </button>
          );
        }

        return (
          <span key={star} className="star" aria-hidden="true">
            {icon}
          </span>
        );
      })}
    </div>
  );
}

function SavedReviewStars({ value }: { value: number }) {
  return <Stars value={value} />;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default function ReviewsPage() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasOwnRating, setHasOwnRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function loadRatings() {
    try {
      setError("");

      const response = await fetch("/api/ratings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر تحميل المراجعات");
      }

      setRatings(data.ratings || []);

      setStats({
        ...emptyStats,
        ...(data.stats || {}),
        total: Number(data.stats?.total || 0),
        average: Number(data.stats?.average || 0),
        five: Number(data.stats?.five || 0),
        four: Number(data.stats?.four || 0),
        three: Number(data.stats?.three || 0),
        two: Number(data.stats?.two || 0),
        one: Number(data.stats?.one || 0),
      });

      if (data.rating) {
        setHasOwnRating(true);
        setSelectedRating(Number(data.rating.rating));
        setComment(data.rating.comment || "");
      } else {
        setHasOwnRating(false);
        setSelectedRating(0);
        setComment("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المراجعات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRatings();
  }, []);

  async function saveRating() {
    if (!selectedRating) {
      setError("اختر عدد النجوم أولاً");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر حفظ التقييم");
      }

      await loadRatings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التقييم");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRating() {
    if (!window.confirm("هل تريد حذف تقييمك؟")) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch("/api/ratings", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر حذف التقييم");
      }

      await loadRatings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف التقييم");
    } finally {
      setDeleting(false);
    }
  }

  const distributions = [
    { stars: 5, count: stats.five },
    { stars: 4, count: stats.four },
    { stars: 3, count: stats.three },
    { stars: 2, count: stats.two },
    { stars: 1, count: stats.one },
  ];

  return (
    <main dir="rtl" className="reviews-page">
      <div className="reviews-shell">
        <header className="reviews-header">
          <a href="/dashboard/rating" className="back-button">
            ← العودة للتقييم
          </a>

          <div>
            <span className="eyebrow">المراجعات</span>
            <h1>تقييمات المستخدمين</h1>
            <p>
              شارك تجربتك مع التطبيق من خلال تقييمك ومراجعتك.
            </p>
          </div>
        </header>

        <section className="reviews-overview">
          <div className="rating-score">
            <strong>
              {stats.average ? stats.average.toFixed(1) : "0.0"}
            </strong>

            <Stars value={Math.round(stats.average)} />

            <span>{stats.total} تقييم</span>
          </div>

          <div className="rating-distribution">
            {distributions.map((item) => {
              const percent = percentage(item.count, stats.total);

              return (
                <div className="distribution-row" key={item.stars}>
                  <span>{item.stars}</span>

                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77l-6.18 3.23L7 14.13l-5-4.87 6.91-1L12 2z" />
                  </svg>

                  <div className="distribution-bar">
                    <div style={{ width: `${percent}%` }} />
                  </div>

                  <small>{percent}%</small>
                </div>
              );
            })}
          </div>
        </section>

        <section className="write-review">
          <h2>{hasOwnRating ? "تعديل تقييمك" : "قيّم التطبيق"}</h2>

          <p>
            {hasOwnRating
              ? "يمكنك تعديل تقييمك وتعليقك في أي وقت."
              : "اختر عدد النجوم واكتب مراجعتك."}
          </p>

          <div className="interactive-rating">
            <Stars
              value={selectedRating}
              interactive
              onChange={setSelectedRating}
            />

            {selectedRating > 0 && (
              <span>{selectedRating} من 5</span>
            )}
          </div>

          {selectedRating > 0 && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              placeholder="اكتب مراجعتك..."
            />
          )}

          <div className="form-footer">
            <span>{comment.length}/2000</span>

            <div className="actions">
              {hasOwnRating && (
                <button
                  type="button"
                  className="delete-button"
                  disabled={deleting || saving}
                  onClick={deleteRating}
                >
                  {deleting ? "جاري الحذف..." : "حذف التقييم"}
                </button>
              )}

              <button
                type="button"
                className="save-button"
                disabled={saving || deleting || !selectedRating}
                onClick={saveRating}
              >
                {saving
                  ? "جاري النشر..."
                  : hasOwnRating
                    ? "حفظ التعديل"
                    : "نشر التقييم"}
              </button>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="reviews-section">
          <div className="reviews-heading">
            <h2>المراجعات</h2>
            <p>{stats.total} مراجعة حقيقية من مستخدمي التطبيق</p>
          </div>

          {loading ? (
            <div className="state-card">
              جاري تحميل التقييمات...
            </div>
          ) : ratings.length === 0 ? (
            <div className="state-card">
              <svg
                className="empty-star"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.77l-6.18 3.23L7 14.13l-5-4.87 6.91-1L12 2z" />
              </svg>

              <h3>لا توجد مراجعات بعد</h3>

              <p>
                كن أول من يشارك تجربته مع التطبيق.
              </p>
            </div>
          ) : (
            <div className="reviews-list">
              {ratings.map((item) => (
                <article className="review-card" key={item.id}>
                  <div className="review-user">
                    <div className="avatar">
                      {item.profile_image ? (
                        <img
                          src={item.profile_image}
                          alt=""
                          className="avatar-image"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="profile-icon">
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                        </svg>
                      )}
                    </div>

                    <div className="review-content">
                      <div className="user-name">
                        {item.full_name || "مستخدم"}

                        {item.is_owner && (
                          <span className="owner-badge">
                            أنت
                          </span>
                        )}
                      </div>

                      <div className="saved-review-rating">
                        <SavedReviewStars value={item.rating} />

                        <span className="review-date">
                          {formatDate(
                            item.updated_at || item.created_at
                          )}

                          {item.updated_at !== item.created_at && (
                            <span> · تم التعديل</span>
                          )}
                        </span>
                      </div>

                      {item.comment && (
                        <p className="review-comment">
                          {item.comment}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.is_owner && (
                    <div className="owner-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(item.rating);
                          setComment(item.comment || "");
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        تعديل تقييمي
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .reviews-page {
          min-height: 100vh;
          background: #fff;
          color: #202124;
          padding: 24px 18px 70px;
        }

        .reviews-shell {
          width: min(900px, 100%);
          margin: auto;
        }

        .reviews-header {
          padding: 8px 0 28px;
        }

        .back-button {
          display: inline-block;
          margin-bottom: 22px;
          color: #1a73e8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .back-button:hover {
          text-decoration: underline;
        }

        .eyebrow {
          color: #5f6368;
          font-size: 14px;
          font-weight: 600;
        }

        .reviews-header h1 {
          margin: 7px 0 0;
          font-size: 32px;
          font-weight: 700;
        }

        .reviews-header p,
        .write-review > p,
        .reviews-heading p {
          color: #5f6368;
          font-size: 14px;
          line-height: 1.7;
          margin: 8px 0 0;
        }

        .reviews-overview {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 34px;
          align-items: center;
          padding: 26px 0;
          border-top: 1px solid #e8eaed;
          border-bottom: 1px solid #e8eaed;
        }

        .rating-score {
          text-align: center;
        }

        .rating-score strong {
          display: block;
          font-size: 52px;
          line-height: 1;
          font-weight: 500;
        }

        .rating-score > span {
          display: block;
          margin-top: 7px;
          color: #5f6368;
          font-size: 13px;
        }

        .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 15px 17px minmax(80px, 1fr) 40px;
          gap: 7px;
          align-items: center;
          direction: ltr;
        }

        .distribution-row span,
        .distribution-row small {
          color: #5f6368;
          font-size: 12px;
          text-align: center;
        }

        .distribution-row svg {
          width: 15px;
          height: 15px;
          fill: #fbbc04;
          stroke: #fbbc04;
        }

        .distribution-bar {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #e8eaed;
        }

        .distribution-bar div {
          height: 100%;
          border-radius: inherit;
          background: #fbbc04;
        }

        .write-review {
          margin-top: 28px;
          padding: 22px 24px;
          border: 1px solid #dadce0;
          border-radius: 12px;
          background: #fff;
        }

        .write-review h2,
        .reviews-heading h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 600;
        }

        .interactive-rating {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .interactive-rating > span {
          color: #5f6368;
          font-size: 14px;
          font-weight: 600;
        }

        .rating-stars {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: center;
          gap: 2px;
          direction: ltr;
          width: max-content;
          height: 20px;
        }

        .rating-stars > .star {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          min-width: 20px;
          height: 20px;
          padding: 0;
          margin: 0;
          border: 0;
          background: transparent;
          flex: 0 0 20px;
          line-height: 0;
          box-sizing: border-box;
        }

        .rating-stars > .star > .star-icon {
          display: block;
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
        }

        .rating-stars-input > .star {
          width: 24px;
          height: 24px;
          min-width: 24px;
          flex: 0 0 24px;
          cursor: pointer;
        }

        .rating-stars-input > .star > .star-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
        }

        .rating-stars-input .star:hover {
          background: #f8f9fa;
          border-radius: 50%;
        }

        textarea {
          width: 100%;
          min-height: 120px;
          box-sizing: border-box;
          resize: vertical;
          padding: 13px;
          border: 1px solid #dadce0;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #202124;
          font: inherit;
        }

        textarea:focus {
          border-color: #1a73e8;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
        }

        .form-footer > span {
          color: #80868b;
          font-size: 12px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .delete-button,
        .owner-actions button {
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .delete-button {
          color: #d93025;
        }

        .owner-actions button {
          color: #1a73e8;
        }

        .save-button {
          border: 0;
          border-radius: 22px;
          padding: 11px 20px;
          background: #1a73e8;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: .45;
          cursor: default;
        }

        .error-box {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 8px;
          background: #fce8e6;
          color: #c5221f;
          font-size: 13px;
        }


        .reviews-section {
          margin-top: 34px;
        }

        .reviews-heading {
          padding-bottom: 15px;
        }

        .reviews-list {
          border-top: 1px solid #e8eaed;
        }

        .review-card {
          padding: 18px 0;
          border-bottom: 1px solid #e8eaed;
        }

        .review-user {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          width: 100%;
        }

        .review-content {
          min-width: 0;
          flex: 1;
        }

        .saved-review-rating {
          display: flex;
          align-items: center;
          flex-direction: row;
          gap: 8px;
          margin-top: 3px;
          width: max-content;
          min-height: 20px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          background: #f1f3f4;
          color: #5f6368;
          font-size: 15px;
          font-weight: 600;
        }

        .avatar-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
        }

        .owner-badge {
          padding: 2px 7px;
          border-radius: 10px;
          background: #e8f0fe;
          color: #1967d2;
          font-size: 10px;
        }

        .review-date {
          color: #80868b;
          font-size: 11px;
        }

        .review-comment {
          margin: 7px 0 0;
          color: #3c4043;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .owner-actions {
          margin-top: 12px;
        }

        .state-card {
          padding: 50px 20px;
          text-align: center;
          border-top: 1px solid #e8eaed;
          border-bottom: 1px solid #e8eaed;
          color: #5f6368;
        }

        .state-card h3 {
          margin: 12px 0 4px;
          color: #202124;
          font-size: 16px;
        }

        .state-card p {
          margin: 0;
          font-size: 13px;
        }

        .empty-star {
          width: 42px;
          height: 42px;
          fill: none;
          stroke: #fbbc04;
          stroke-width: 1.8;
        }

        @media (max-width: 640px) {
          .reviews-page {
            padding: 22px 14px 50px;
          }

          .reviews-overview {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .write-review {
            padding: 20px 16px;
          }

          .form-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .review-user {
            flex-direction: row;
          }
        }
      `}</style>
    </main>
  );
}
