"use client";

import { useEffect, useState } from "react";

type RatingData = {
  rating: number;
  comment: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function Page() {
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRating() {
      try {
        const response = await fetch("/api/ratings", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "تعذر جلب التقييم");
        }

        if (data?.rating) {
          setSelected(Number(data.rating.rating) || 0);
          setComment(data.rating.comment || "");
        }
      } catch (err) {
        console.error("Load rating error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRating();
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

  return (
    <main dir="rtl" className="settings-page">
      <div className="settings-card">
        <div className="settings-icon">★</div>

        <h1>تقييم التطبيق</h1>

        <div className="settings-content">
          <p>
            رأيك يساعدنا على تحسين Photo Editor Pro وتطوير أدوات
            التحرير.
          </p>

          <div className="rating-section">
            <div className="stars" aria-label="اختيار التقييم">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= selected ? "star active" : "star"}
                  onClick={() => {
                    setSelected(star);
                    setMessage("");
                    setError("");
                  }}
                  aria-label={`${star} نجوم`}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="rating-label">
              {loading
                ? "جاري تحميل تقييمك..."
                : selected > 0
                  ? `${selected} من 5 نجوم`
                  : "اختر التقييم الذي يعبر عن تجربتك"}
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="rating-comment">
              تعليقك <span>(اختياري)</span>
            </label>

            <textarea
              id="rating-comment"
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

            <div className="counter">
              {comment.length} / 2000
            </div>
          </div>

          {error && <div className="status error">{error}</div>}
          {message && <div className="status success">{message}</div>}

          <button
            type="button"
            className="save-button"
            onClick={saveRating}
            disabled={saving || loading}
          >
            {saving ? "جاري الحفظ..." : "حفظ التقييم"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: calc(100dvh - 100px);
          padding: 40px 24px;
          background: #ffffff;
          color: #111111;
          box-sizing: border-box;
        }

        .settings-card {
          width: min(900px, 100%);
          margin: 0 auto;
          padding: 32px;
          border-radius: 22px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .settings-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #f1f1f1;
          color: #111111;
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 18px;
        }

        h1 {
          margin: 0 0 24px;
          font-size: 30px;
          font-weight: 800;
          color: #111111;
        }

        .settings-content {
          color: #333333;
          line-height: 1.9;
          font-size: 16px;
        }

        .settings-content > p {
          margin: 0 0 26px;
        }

        .rating-section {
          padding: 24px 0;
          border-top: 1px solid #eeeeee;
          border-bottom: 1px solid #eeeeee;
        }

        .stars {
          display: flex;
          direction: ltr;
          gap: 8px;
        }

        .star {
          width: 52px;
          height: 52px;
          padding: 0;
          border: 1px solid #dddddd;
          border-radius: 14px;
          background: #ffffff;
          color: #c7c7c7;
          font-size: 30px;
          line-height: 1;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .star:hover {
          transform: translateY(-2px);
          border-color: #bbbbbb;
          color: #f2b01e;
          background: #fffaf0;
        }

        .star.active {
          color: #f2b01e;
          background: #fff8e6;
          border-color: #f2d58b;
        }

        .rating-label {
          margin-top: 12px;
          color: #666666;
          font-size: 14px;
        }

        .comment-section {
          margin-top: 26px;
        }

        .comment-section label {
          display: block;
          margin-bottom: 10px;
          color: #111111;
          font-weight: 700;
        }

        .comment-section label span {
          color: #888888;
          font-weight: 400;
        }

        textarea {
          width: 100%;
          min-height: 130px;
          resize: vertical;
          box-sizing: border-box;
          padding: 14px 16px;
          border: 1px solid #dddddd;
          border-radius: 14px;
          background: #ffffff;
          color: #111111;
          font: inherit;
          outline: none;
        }

        textarea:focus {
          border-color: #999999;
        }

        textarea::placeholder {
          color: #999999;
        }

        .counter {
          margin-top: 6px;
          text-align: left;
          direction: ltr;
          color: #999999;
          font-size: 12px;
        }

        .status {
          margin-top: 16px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
        }

        .status.error {
          background: #fff1f1;
          color: #b42318;
        }

        .status.success {
          background: #f0faf3;
          color: #18794e;
        }

        .save-button {
          width: 100%;
          margin-top: 20px;
          padding: 14px 18px;
          border: 0;
          border-radius: 14px;
          background: #111111;
          color: #ffffff;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .save-button:hover:not(:disabled) {
          opacity: 0.88;
        }

        .save-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .settings-page {
            padding: 24px 16px;
          }

          .settings-card {
            padding: 20px;
            border-radius: 18px;
          }

          h1 {
            font-size: 25px;
          }

          .star {
            width: 48px;
            height: 48px;
            font-size: 27px;
          }
        }
      `}</style>
    </main>
  );
}
