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
    <div
      className={
        interactive
          ? "rating-stars rating-stars-input interactive-stars"
          : "rating-stars"
      }
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
          >
            <path d="M12 2.6l2.91 5.9 6.51.95-4.71 4.59 1.11 6.48L12 17.46l-5.82 3.06 1.11-6.48-4.71-4.59 6.51-.95L12 2.6z" />
          </svg>
        );

        return interactive ? (
          <button
            key={star}
            type="button"
            className={`star ${active ? "active" : ""}`}
            onPointerDown={(e) => {
              e.preventDefault();
              onChange?.(star === value ? star - 1 : star);
            }}
            onClick={() => onChange?.(star === value ? star - 1 : star)}
            aria-label={`${star} نجوم`}
            aria-pressed={active}
          >
            {icon}
          </button>
        ) : (
          <span
            key={star}
            className={`star ${active ? "active" : ""}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        );
      })}
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
  const [showReviewForm, setShowReviewForm] = useState(false);
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
        setSelectedRating(data.rating.rating);
        setComment(data.rating.comment || "");
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

      setShowReviewForm(false);
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
          {!showReviewForm ? (
            <div className="review-entry">
              <h2>قيّم هذا التطبيق</h2>
              <p>أخبر الآخرين برأيك</p>

              <Stars
                value={hasOwnRating ? selectedRating : 0}
                interactive={false}
              />

              <button
                type="button"
                className="write-review-button"
                onClick={() => setShowReviewForm(true)}
              >
                {hasOwnRating ? "تعديل مراجعتك" : "كتابة مراجعة"}
              </button>
            </div>
          ) : (
            <>
              <div className="section-title">
                <h2>{hasOwnRating ? "تعديل مراجعتك" : "كتابة مراجعة"}</h2>
                <p>اختر تقييمك واكتب رأيك بالتطبيق.</p>
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

              {selectedRating > 0 && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  placeholder="اكتب مراجعتك عن تجربتك مع التطبيق..."
                />
              )}

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
                      ? "جاري النشر..."
                      : hasOwnRating
                        ? "حفظ التعديل"
                        : "نشر التقييم"}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowReviewForm(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}
            </>
          )}
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
          background: #090a0c;
          color: #f5f5f5;
          padding: 24px 16px 70px;
        }

        .rating-container {
          width: min(760px, 100%);
          margin: auto;
        }

        .rating-header {
          padding: 8px 4px 24px;
        }

        .eyebrow {
          color: #fbbc04;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        h1, h2, h3, p {
          margin: 0;
        }

        .rating-header h1 {
          font-size: clamp(24px, 5vw, 32px);
          margin-bottom: 7px;
        }

        .rating-header p,
        .section-title p,
        .reviews-title p {
          color: #9aa0a6;
          font-size: 14px;
          line-height: 1.7;
        }

        .summary-card,
        .write-card,
        .review-card,
        .empty-card {
          background: #111315;
          border: 1px solid #292c30;
          border-radius: 16px;
          box-shadow: none;
        }

        .summary-card {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 30px;
          padding: 26px;
          margin-bottom: 16px;
        }

        .summary-score {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-left: 1px solid #292c30;
          padding-left: 26px;
        }

        .summary-score strong {
          font-size: 58px;
          line-height: 1;
          font-weight: 400;
          letter-spacing: -2px;
        }

        .summary-score > span {
          color: #9aa0a6;
          font-size: 12px;
          margin-top: 7px;
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
          color: #5f6368;
          font-size: 20px;
          line-height: 1;
        }

        .star-icon {
          display: block;
          width: 1em;
          height: 1em;
          fill: currentColor;
        }

        .star.active {
          color: #fbbc04;
        }

        .distribution {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 15px 18px 1fr 38px;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #9aa0a6;
        }

        .distribution-label {
          text-align: center;
        }

        .mini-star {
          color: #fbbc04;
          font-size: 13px;
        }

        .bar {
          height: 8px;
          background: #303236;
          border-radius: 20px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #fbbc04;
          border-radius: inherit;
          transition: width .3s ease;
        }

        .distribution-percent {
          text-align: left;
        }

        .write-card {
          padding: 26px;
          margin-bottom: 32px;
        }

        .review-entry {
          text-align: center;
          padding: 8px 0 2px;
        }

        .review-entry h2 {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .review-entry p {
          color: #9aa0a6;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .review-entry .rating-stars {
          justify-content: center;
          margin-bottom: 20px;
        }

        .review-entry .star {
          font-size: 30px;
        }

        .write-review-button {
          border: 1px solid #5f6368;
          background: transparent;
          color: #f5f5f5;
          border-radius: 20px;
          padding: 10px 22px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .write-review-button:hover {
          background: #202124;
          border-color: #9aa0a6;
        }

        .cancel-button {
          border: 0;
          background: transparent;
          color: #9aa0a6;
          border-radius: 20px;
          padding: 10px 14px;
          font: inherit;
          font-size: 13px;
          cursor: pointer;
        }

        .cancel-button:hover {
          color: #f5f5f5;
          background: #202124;
        }

        .section-title {
          text-align: center;
        }

        .section-title h2,
        .reviews-title h2 {
          font-size: 20px;
          margin-bottom: 5px;
        }

        .choose-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin: 24px 0 18px;
        }

        .rating-stars-input {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          direction: ltr;
          margin: 8px 0;
        }

        .rating-stars-input .star {
          appearance: none;
          -webkit-appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px !important;
          height: 56px !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          outline: none;
          background: transparent !important;
          box-shadow: none !important;
          color: #5f6368 !important;
          font-size: 48px !important;
          line-height: 1 !important;
          font-family: Arial, sans-serif;
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          z-index: 20;
          transition: color .15s ease, transform .15s ease;
        }

        .rating-stars-input .star.active {
          color: #fbbc04 !important;
        }

        .rating-stars-input .star:hover,
        .rating-stars-input .star:focus-visible {
          color: #fbbc04 !important;
          transform: scale(1.08);
          outline: none;
        }

        .selected-text {
          color: #fbbc04;
          font-size: 13px;
          font-weight: 700;
        }

        textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          background: #0b0d0f;
          color: #f5f5f5;
          border: 1px solid #3c4043;
          border-radius: 12px;
          padding: 14px;
          outline: none;
          font: inherit;
          font-size: 14px;
          line-height: 1.8;
          box-sizing: border-box;
        }

        textarea:focus {
          border-color: #fbbc04;
        }

        textarea::placeholder {
          color: #777b80;
        }

        .form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          color: #777b80;
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
          border-radius: 20px;
          padding: 10px 18px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .save-button {
          background: #fbbc04;
          color: #202124;
        }

        .save-button:hover {
          background: #ffd15c;
        }

        .save-button:disabled,
        .delete-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .delete-button {
          background: #21191a;
          color: #ea868e;
          border: 1px solid #4b292d;
        }

        .error-box {
          margin-top: 14px;
          padding: 11px 13px;
          border-radius: 10px;
          background: #28191b;
          border: 1px solid #4d292e;
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
          background: #292b2e;
          color: #fbbc04;
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
          color: #fbbc04;
          background: rgba(251,188,4,.1);
          border: 1px solid rgba(251,188,4,.2);
          border-radius: 20px;
          padding: 2px 7px;
          font-size: 10px;
        }

        .review-date {
          color: #777b80;
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
          color: #d2d5d8;
          font-size: 14px;
          line-height: 1.9;
          margin: 15px 0 0;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .owner-actions {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #292c30;
        }

        .owner-actions button {
          border: 0;
          background: transparent;
          color: #fbbc04;
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
          background: #292b2e;
          color: #fbbc04;
          font-size: 24px;
        }

        .empty-card h3 {
          font-size: 17px;
          margin-bottom: 6px;
        }

        .empty-card p {
          color: #777b80;
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
            border-bottom: 1px solid #292c30;
            padding: 0 0 22px;
          }

          .summary-score strong {
            font-size: 52px;
          }

          .write-card {
            padding: 22px 16px;
          }

          .rating-stars-input {
            gap: 4px;
          }

          .rating-stars-input .star {
            width: 52px !important;
            height: 52px !important;
            font-size: 44px !important;
            line-height: 1 !important;
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
        }
      `}</style>
    </main>
  );
}
