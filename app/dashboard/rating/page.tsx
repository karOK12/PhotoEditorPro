"use client";

import { useEffect, useState } from "react";

type RatingItem = {
  id: string;
  user_id: string;
  full_name: string | null;
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
    <div className={interactive ? "rating-stars rating-stars-input" : "rating-stars"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          aria-label={`${star} نجوم`}
          className={star <= value ? "star active" : "star"}
        >
          ★
        </button>
      ))}
    </div>
  );
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

export default function RatingPage() {
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
      const response = await fetch("/api/ratings", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر تحميل التقييمات");
      }

      setRatings(data.ratings || []);
      setStats(data.stats || emptyStats);

      if (data.currentRating) {
        setHasOwnRating(true);
        setSelectedRating(data.currentRating.rating);
        setComment(data.currentRating.comment || "");
      } else {
        setHasOwnRating(false);
        setSelectedRating(0);
        setComment("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
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
        headers: { "Content-Type": "application/json" },
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
    <main dir="rtl" className="rating-page">
      <div className="rating-container">

        <header className="rating-header">
          <div>
            <div className="eyebrow">رأيك يهمنا</div>
            <h1>تقييم Photo Editor Pro</h1>
            <p>شاركنا تجربتك وساعد المستخدمين الآخرين على معرفة رأيك.</p>
          </div>
        </header>

        <section className="summary-card">
          <div className="summary-score">
            <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}</strong>
            <Stars value={Math.round(stats.average)} />
            <span>{stats.total} تقييم</span>
          </div>

          <div className="distribution">
            {distributions.map((item) => {
              const percent = percentage(item.count, stats.total);

              return (
                <div className="distribution-row" key={item.stars}>
                  <span className="distribution-label">{item.stars}</span>
                  <span className="mini-star">★</span>

                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="distribution-percent">{percent}%</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="write-card">
          <div className="section-title">
            <h2>{hasOwnRating ? "تعديل تقييمك" : "قيّم التطبيق"}</h2>
            <p>
              {hasOwnRating
                ? "يمكنك تحديث تقييمك أو حذفه في أي وقت."
                : "اختر عدد النجوم ثم اكتب رأيك بالتطبيق."}
            </p>
          </div>

          <div className="choose-rating">
            <Stars
              value={selectedRating}
              interactive
              onChange={setSelectedRating}
            />
            {selectedRating > 0 && (
              <span className="selected-text">
                {selectedRating} من 5
              </span>
            )}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            placeholder="اكتب مراجعتك هنا..."
          />

          <div className="form-footer">
            <span>{comment.length}/2000</span>

            <div className="actions">
              {hasOwnRating && (
                <button
                  type="button"
                  className="delete-button"
                  disabled={deleting}
                  onClick={deleteRating}
                >
                  {deleting ? "جاري الحذف..." : "حذف التقييم"}
                </button>
              )}

              <button
                type="button"
                className="save-button"
                disabled={saving || !selectedRating}
                onClick={saveRating}
              >
                {saving
                  ? "جاري الحفظ..."
                  : hasOwnRating
                    ? "حفظ التعديل"
                    : "نشر التقييم"}
              </button>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="reviews-section">
          <div className="reviews-title">
            <div>
              <h2>تقييمات المستخدمين</h2>
              <p>{stats.total} تقييم حقيقي من مستخدمي التطبيق</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-card">جاري تحميل التقييمات...</div>
          ) : ratings.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">★</div>
              <h3>لا توجد تقييمات بعد</h3>
              <p>كن أول من يشارك تجربته مع Photo Editor Pro.</p>
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
                            <span className="owner-badge">أنت</span>
                          )}
                        </div>

                        <div className="review-date">
                          {formatDate(item.updated_at || item.created_at)}
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

                  {item.is_owner && (
                    <div className="owner-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(item.rating);
                          setComment(item.comment || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
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
        .rating-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 50% -10%, rgba(245, 191, 66, .09), transparent 34%),
            #090a0d;
          color: #f5f5f5;
          padding: 28px 16px 70px;
        }

        .rating-container {
          width: min(900px, 100%);
          margin: auto;
        }

        .rating-header {
          padding: 12px 4px 28px;
        }

        .eyebrow {
          color: #e8b94f;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        h1, h2, h3, p {
          margin: 0;
        }

        .rating-header h1 {
          font-size: clamp(25px, 5vw, 36px);
          letter-spacing: -.6px;
          margin-bottom: 8px;
        }

        .rating-header p,
        .section-title p,
        .reviews-title p {
          color: #92959d;
          font-size: 14px;
          line-height: 1.7;
        }

        .summary-card,
        .write-card,
        .review-card,
        .empty-card {
          background: linear-gradient(145deg, #15171c, #101115);
          border: 1px solid #24262d;
          border-radius: 20px;
          box-shadow: 0 18px 45px rgba(0,0,0,.18);
        }

        .summary-card {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 34px;
          padding: 28px;
          margin-bottom: 18px;
        }

        .summary-score {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-left: 1px solid #292b31;
          padding-left: 28px;
        }

        .summary-score strong {
          font-size: 56px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .summary-score > span {
          color: #8e9199;
          font-size: 13px;
          margin-top: 6px;
        }

        .rating-stars {
          display: flex;
          gap: 2px;
          direction: ltr;
        }

        .star {
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          color: #3b3d44;
          font-size: 20px;
          line-height: 1;
        }

        .star.active {
          color: #f2b83f;
        }

        .distribution {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 9px;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 15px 18px 1fr 38px;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #9699a1;
        }

        .distribution-label {
          text-align: center;
        }

        .mini-star {
          color: #f2b83f;
          font-size: 13px;
        }

        .bar {
          height: 8px;
          background: #292b31;
          border-radius: 20px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #eab33e;
          border-radius: inherit;
          transition: width .3s ease;
        }

        .distribution-percent {
          text-align: left;
        }

        .write-card {
          padding: 24px;
          margin-bottom: 34px;
        }

        .section-title h2,
        .reviews-title h2 {
          font-size: 19px;
          margin-bottom: 5px;
        }

        .choose-rating {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0 18px;
        }

        .rating-stars-input {
          gap: 8px;
        }

        .rating-stars-input .star {
          cursor: pointer;
          font-size: 34px;
          transition: transform .15s ease, color .15s ease;
        }

        .rating-stars-input .star:hover {
          transform: scale(1.1);
          color: #f2b83f;
        }

        .selected-text {
          color: #e9b843;
          font-size: 13px;
          font-weight: 700;
        }

        textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          background: #0c0d10;
          color: #f5f5f5;
          border: 1px solid #292b32;
          border-radius: 14px;
          padding: 14px;
          outline: none;
          font: inherit;
          font-size: 14px;
          line-height: 1.8;
          transition: border-color .2s ease;
        }

        textarea:focus {
          border-color: #b88a2e;
        }

        textarea::placeholder {
          color: #686b73;
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          color: #666971;
          font-size: 11px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .save-button,
        .delete-button {
          border: 0;
          border-radius: 11px;
          padding: 10px 17px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .save-button {
          background: #eab33e;
          color: #17130a;
        }

        .save-button:hover {
          background: #f4c653;
        }

        .save-button:disabled,
        .delete-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .delete-button {
          background: #21171a;
          color: #e1848d;
          border: 1px solid #48262b;
        }

        .error-box {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #27171a;
          border: 1px solid #4b282d;
          color: #ee929a;
          font-size: 13px;
        }

        .reviews-title {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          padding: 0 3px;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .review-card {
          padding: 18px;
        }

        .review-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #24262c;
          color: #eab33e;
          font-weight: 800;
          font-size: 17px;
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 700;
        }

        .owner-badge {
          color: #eab33e;
          background: rgba(234,179,62,.1);
          border: 1px solid rgba(234,179,62,.2);
          border-radius: 20px;
          padding: 2px 7px;
          font-size: 10px;
        }

        .review-date {
          color: #70737b;
          font-size: 11px;
          margin-top: 3px;
        }

        .review-card .rating-stars {
          flex-shrink: 0;
        }

        .review-card .star {
          font-size: 17px;
        }

        .review-comment {
          color: #c5c7cc;
          font-size: 14px;
          line-height: 1.9;
          margin: 15px 0 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .owner-actions {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #24262c;
        }

        .owner-actions button {
          border: 0;
          background: transparent;
          color: #eab33e;
          font: inherit;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        .empty-card {
          text-align: center;
          padding: 48px 20px;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: #1e1f24;
          color: #eab33e;
          font-size: 24px;
        }

        .empty-card h3 {
          font-size: 17px;
          margin-bottom: 6px;
        }

        .empty-card p {
          color: #777a82;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .rating-page {
            padding: 18px 12px 50px;
          }

          .summary-card {
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 22px 18px;
          }

          .summary-score {
            border-left: 0;
            border-bottom: 1px solid #292b31;
            padding: 0 0 22px;
          }

          .summary-score strong {
            font-size: 50px;
          }

          .write-card {
            padding: 20px 16px;
          }

          .choose-rating {
            justify-content: center;
            flex-direction: column;
          }

          .rating-stars-input .star {
            font-size: 36px;
          }

          .form-footer {
            align-items: flex-end;
            flex-direction: column;
          }

          .actions {
            width: 100%;
          }

          .save-button,
          .delete-button {
            flex: 1;
          }

          .review-top {
            flex-direction: column;
          }

          .review-card .rating-stars {
            margin-right: 53px;
          }
        }
      `}</style>
    </main>
  );
}
