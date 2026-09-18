"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

function SavedReviewStars({ value }: { value: number }) {
  return (
    <div className="saved-review-stars" aria-label={`${value} من 5 نجوم`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="saved-review-star" aria-hidden="true">
          {star <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

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
      style={{
        display: "inline-flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",
        gap: "2px",
        direction: "ltr",
        width: "max-content",
      }}
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
            <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24z" />
          </svg>
        );

        return interactive ? (
          <button
            key={star}
            type="button"
            className="star"
            style={{
              display: "inline-flex",
              flex: "0 0 20px",
              width: "20px",
              height: "20px",
              padding: 0,
              margin: 0,
              alignItems: "center",
              justifyContent: "center",
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
            className="star"
            aria-hidden="true"
            style={{
              display: "inline-flex",
              flex: "0 0 20px",
              width: "20px",
              height: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
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
  const [showAllReviews, setShowAllReviews] = useState(false);
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
      {/* Header مع زر الرجوع */}
      <header className="page-top-bar">
        <Link href="/" className="back-btn" aria-label="العودة">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
        <h1 className="page-title">التقييمات</h1>
        <div style={{ width: "40px" }}></div>
      </header>

      <div className="rating-shell">
        <header className="rating-header">
          <div className="rating-header-top">
            <div>
              <span className="rating-eyebrow">تقييم التطبيق</span>
              <h2>Photo Editor Pro</h2>
            </div>

            <button
              type="button"
              className="rating-reviews-link"
              onClick={() => setShowAllReviews(true)}
              aria-label="فتح التقييمات والمراجعات"
            >
              <span className="rating-reviews-score">
                <span className="rating-reviews-main">
                  <svg className="rating-reviews-star" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.31 6.2 20.37l1.11-6.47 6.49-.94L12 2.5z" />
                  </svg>
                  <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}</strong>
                </span>
                <span className="rating-reviews-count">{stats.total} مراجعة</span>
              </span>
            </button>
          </div>

          <p>شارك تجربتك مع التطبيق من خلال تقييمك ومراجعتك.</p>
        </header>

        <section className="rating-overview">
          <div className="rating-score">
            <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}</strong>
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
                    <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.31 6.2 20.37l1.11-6.47-4.7-.94 6.49-.94L12 2.5z" />
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

        <section className="rating-write">
          {!showReviewForm ? (
            <>
              <h3>قيّم هذا التطبيق</h3>
              <p>ما رأيك بتجربتك مع Photo Editor Pro؟</p>

              <div className="write-stars">
                <Stars value={hasOwnRating ? selectedRating : 0} interactive={false} />
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => setShowReviewForm(true)}
              >
                {hasOwnRating ? "تعديل تقييمك" : "قيّم التطبيق"}
              </button>
            </>
          ) : (
            <>
              <h3>{hasOwnRating ? "تعديل تقييمك" : "تقييم التطبيق"}</h3>
              <p>اختر عدد النجوم واكتب مراجعتك.</p>

              <div className="interactive-rating">
                <Stars value={selectedRating} interactive onChange={setSelectedRating} />
                {selectedRating > 0 && <span>{selectedRating} من 5</span>}
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
                      disabled={deleting}
                      onClick={deleteRating}
                    >
                      {deleting ? "جاري الحذف..." : "حذف التقييم"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowReviewForm(false)}
                  >
                    إلغاء
                  </button>

                  <button
                    type="button"
                    className="save-button"
                    disabled={saving || !selectedRating}
                    onClick={saveRating}
                  >
                    {saving ? "جاري النشر..." : hasOwnRating ? "حفظ التعديل" : "نشر التقييم"}
                  </button>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}
            </>
          )}
        </section>

        {showAllReviews && (
          <section className="all-reviews-section">
            <div className="all-reviews-header">
              <button
                type="button"
                className="back-reviews-button"
                onClick={() => setShowAllReviews(false)}
              >
                ← العودة
              </button>

              <div>
                <h3>مراجعة التقييمات</h3>
                <p>{stats.total} مراجعة حقيقية من مستخدمي التطبيق</p>
              </div>
            </div>

            {loading ? (
              <div className="state-card">جاري تحميل التقييمات...</div>
            ) : ratings.length === 0 ? (
              <div className="state-card">
                <svg className="empty-star" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.31 6.2 20.37l1.11-6.47-4.7-.94 4.58-4.58 6.49-.94L12 2.5z" />
                </svg>
                <h4>لا توجد مراجعات بعد</h4>
                <p>ستظهر هنا التقييمات والتعليقات الحقيقية للمستخدمين.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {ratings.map((item) => (
                  <article className="all-review-card" key={item.id}>
                    <div className="all-review-user">
                      <div className="all-review-avatar" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                        </svg>
                      </div>

                      <div className="all-review-body">
                        <div className="all-review-name">
                          {item.full_name || "مستخدم"}
                          {item.is_owner && <span className="owner-badge">أنت</span>}
                        </div>

                        <div className="all-review-meta">
                          <SavedReviewStars value={item.rating} />
                          <span className="all-review-date">
                            {formatDate(item.updated_at || item.created_at)}
                            {item.updated_at !== item.created_at && <span> · تم التعديل</span>}
                          </span>
                        </div>

                        {item.comment && <p className="all-review-comment">{item.comment}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="reviews-section">
          <div className="reviews-heading">
            <h3>مراجعات المستخدمين</h3>
            <p>{stats.total} تقييم حقيقي من مستخدمي التطبيق</p>
          </div>

          {loading ? (
            <div className="state-card">جاري تحميل التقييمات...</div>
          ) : ratings.length === 0 ? (
            <div className="state-card">
              <svg className="empty-star" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.31 6.2 20.37l1.11-6.47-4.7-4.58-6.49-.94 4.7 4.58L12 2.5z" />
              </svg>
              <h4>لا توجد تقييمات بعد</h4>
              <p>كن أول من يشارك تجربته مع التطبيق.</p>
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
                          {item.is_owner && <span className="owner-badge">أنت</span>}
                        </div>

                        <div className="saved-review-rating">
                          <SavedReviewStars value={item.rating} />
                          <span className="review-date">
                            {formatDate(item.updated_at || item.created_at)}
                            {item.updated_at !== item.created_at && <span> · تم التعديل</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.comment && <p className="review-comment">{item.comment}</p>}

                  {item.is_owner && (
                    <div className="owner-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(item.rating);
                          setComment(item.comment || "");
                          setShowReviewForm(true);
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

      {/* شريط التنقل السفلي */}
      <BottomNavigation />

      <style jsx>{`
        .rating-page {
          min-height: 100vh;
          background: #fff;
          color: #202124;
          padding: 0 18px 100px;
        }

        .page-top-bar {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          background: #fff;
          border-bottom: 1px solid #e8eaed;
          z-index: 50;
          margin: 0 -18px;
          padding-left: 18px;
          padding-right: 18px;
        }

        .page-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #202124;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f1f3f4;
          color: #202124;
          text-decoration: none;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: #e8eaed;
        }

        .back-btn svg {
          width: 20px;
          height: 20px;
          transform: rotate(180deg);
        }

        .rating-shell {
          width: min(900px, 100%);
          margin: auto;
          padding-top: 8px;
        }

        .rating-header {
          padding: 8px 0 28px;
        }

        .rating-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .rating-reviews-link {
          appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          white-space: nowrap;
          cursor: pointer;
          font: inherit;
          text-align: center;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .rating-reviews-score {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          direction: rtl;
          gap: 2px;
          color: #202124;
        }

        .rating-reviews-main {
          display: inline-flex;
          align-items: center;
          direction: ltr;
          gap: 5px;
        }

        .rating-reviews-count {
          font-size: 12px;
          font-weight: 500;
          color: #5f6368;
          direction: rtl;
        }

        .rating-reviews-score strong {
          font-size: 15px;
          font-weight: 700;
        }

        .rating-reviews-star {
          width: 18px;
          height: 18px;
          fill: #1a73e8;
        }

        .rating-reviews-link:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .all-reviews-section {
          margin: 8px 0 30px;
          padding: 22px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #fff;
        }

        .all-reviews-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .all-reviews-header h3 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #202124;
        }

        .all-reviews-header p {
          margin: 6px 0 0;
          color: #5f6368;
          font-size: 13px;
        }

        .back-reviews-button {
          border: 0;
          background: transparent;
          color: #1a73e8;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .back-reviews-button:hover {
          text-decoration: underline;
        }

        .all-review-card {
          padding: 18px 0;
          border-bottom: 1px solid #e8eaed;
        }

        .all-review-user {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .all-review-avatar {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f1f3f4;
        }

        .all-review-avatar svg {
          width: 20px;
          height: 20px;
          fill: #5f6368;
        }

        .all-review-body {
          min-width: 0;
          flex: 1;
        }

        .all-review-name {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          color: #202124;
        }

        .all-review-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 15px;
          margin-top: 3px;
        }

        .all-review-meta .saved-review-stars {
          margin-top: 0 !important;
        }

        .all-review-date {
          color: #80868b;
          font-size: 11px;
          white-space: nowrap;
        }

        .all-review-comment {
          margin: 7px 0 0;
          color: #3c4043;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .rating-eyebrow {
          color: #5f6368;
          font-size: 14px;
          font-weight: 600;
        }

        .rating-header h2 {
          margin: 7px 0 0;
          font-size: 34px;
          font-weight: 700;
        }

        .rating-header p,
        .rating-write > p,
        .reviews-heading p {
          color: #5f6368;
          font-size: 14px;
          line-height: 1.7;
          margin: 8px 0 0;
        }

        .rating-overview {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 38px;
          align-items: center;
          padding: 28px 0;
          border-top: 1px solid #e8eaed;
          border-bottom: 1px solid #e8eaed;
        }

        .rating-score {
          text-align: center;
        }

        .rating-score strong {
          display: block;
          font-size: 56px;
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
          display: block;
          fill: #fbbc04;
          stroke: none;
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

        .rating-write {
          margin-top: 26px;
          padding: 24px;
          border: 1px solid #dadce0;
          border-radius: 14px;
        }

        .rating-write h3,
        .reviews-heading h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 600;
        }

        .write-stars {
          margin: 20px 0;
        }

        .primary-button,
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
          gap: 9px;
        }

        .cancel-button,
        .delete-button,
        .owner-actions button {
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-button,
        .owner-actions button {
          color: #1a73e8;
        }

        .delete-button {
          color: #d93025;
        }

        .save-button:disabled {
          opacity: 0.45;
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
          margin-top: 38px;
        }

        .reviews-heading {
          padding-bottom: 15px;
        }

        .saved-review-stars {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          direction: ltr !important;
          gap: 2px !important;
          width: max-content !important;
          height: 20px !important;
          margin-top: 4px !important;
          flex: 0 0 auto !important;
        }

        .saved-review-star {
          display: block !important;
          width: 18px !important;
          height: 20px !important;
          flex: 0 0 18px !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif !important;
          font-size: 18px !important;
          line-height: 20px !important;
          text-align: center !important;
        }

        .reviews-list {
          border-top: 1px solid #e8eaed;
        }

        .review-card {
          padding: 22px 0;
          border-bottom: 1px solid #e8eaed;
        }

        .review-top {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          gap: 11px;
        }

        .user-info {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          width: 100%;
        }

        .user-info > div:last-child {
          min-width: 0;
          flex: 1;
        }

        .user-info > div:last-child > .saved-review-stars {
          margin-top: 4px !important;
        }

        .avatar {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f1f3f4;
          color: #5f6368;
          font-size: 15px;
          font-weight: 600;
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
          margin-top: 3px;
          color: #80868b;
          font-size: 11px;
        }

        .review-comment {
          margin: 15px 0 0;
          color: #3c4043;
          font-size: 14px;
          line-height: 1.8;
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

        .state-card h4 {
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

        .rating-stars {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 2px !important;
          direction: ltr !important;
          width: max-content !important;
          height: 20px !important;
        }

        .rating-stars > .star {
          display: inline-flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: center !important;
          width: 20px !important;
          min-width: 20px !important;
          max-width: 20px !important;
          height: 20px !important;
          min-height: 20px !important;
          max-height: 20px !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          background: transparent !important;
          flex: 0 0 20px !important;
          line-height: 0 !important;
          box-sizing: border-box !important;
        }

        .rating-stars > .star > .star-icon {
          display: block !important;
          width: 18px !important;
          min-width: 18px !important;
          max-width: 18px !important;
          height: 18px !important;
          min-height: 18px !important;
          max-height: 18px !important;
          flex: 0 0 18px !important;
          margin: 0 !important;
        }

        .rating-stars-input {
          gap: 2px;
        }

        .rating-stars-input > .star {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          flex: 0 0 24px !important;
          cursor: pointer;
        }

        .rating-stars-input > .star > .star-icon {
          width: 20px !important;
          height: 20px !important;
          flex: 0 0 20px !important;
        }

        .rating-stars-input .star:hover {
          background: #f8f9fa;
          border-radius: 50%;
        }

        @media (max-width: 640px) {
          .rating-page {
            padding: 0 14px 100px;
          }

          .page-top-bar {
            margin: 0 -14px;
            padding-left: 14px;
            padding-right: 14px;
          }

          .rating-overview {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .rating-write {
            padding: 20px 16px;
          }

          .form-footer {
            align-items: flex-start;
            flex-direction: column-reverse;
          }

          .actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .review-top {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

/* ============================================
   شريط التنقل السفلي - ضع هذا في ملف منفصل
   (components/BottomNavigation.tsx) ليتم
   مشاركته بين جميع الصفحات
   ============================================ */
function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "الرئيسية",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/explore",
      label: "استكشاف",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      href: "/rating",
      label: "مراجعة",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      href: "/profile",
      label: "حسابي",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #e8eaed;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
          z-index: 100;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 8px 14px;
          text-decoration: none;
          color: #5f6368;
          transition: color 0.2s;
          border-radius: 10px;
          min-width: 60px;
        }

        .nav-item:hover {
          background: #f8f9fa;
        }

        .nav-item.active {
          color: #1a73e8;
        }

        .nav-item.active .nav-icon {
          background: #e8f0fe;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 28px;
          border-radius: 14px;
          transition: background 0.2s;
        }

        .nav-icon svg {
          width: 22px;
          height: 22px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .nav-item {
            padding: 8px 10px;
            min-width: 50px;
          }

          .nav-label {
            font-size: 10px;
          }
        }
      `}</style>
    </nav>
  );
}
