"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Article {
  id: number;
  title: string;
  description: string;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);

 
  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(console.error);
  }, [id]);

  if (!article) {
    return <div className="dashboard-main">Učitavanje...</div>;
  }

  return (
    <div className="dashboard-main" style={{ padding: "20px" }}>
      <div
        style={{
          background: "#1a1a1a",
          padding: "24px",
          borderRadius: "12px",
          maxWidth: "700px",
          margin: "0 auto",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ marginBottom: "16px", fontSize: "1.8rem" }}>
          {article.title}
        </h1>

        <p
          style={{
            lineHeight: 1.6,
            opacity: 0.9,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
          }}
        >
          {article.description}
        </p>


        <button
          onClick={() => router.back()}
          style={{
            marginTop: "24px",
            background: "#e11d48",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Natrag
        </button>
      </div>
    </div>
  );
}
