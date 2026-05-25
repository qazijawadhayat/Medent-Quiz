import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "dental-basics", label: "Dental Basics", icon: "🦷", audience: "all" },
  { id: "oral-anatomy", label: "Oral Anatomy", icon: "🔬", audience: "dental" },
  { id: "dental-procedures", label: "Dental Procedures", icon: "⚙️", audience: "dental" },
  { id: "medical-general", label: "General Medicine", icon: "🏥", audience: "medical" },
  { id: "pharmacology", label: "Pharmacology", icon: "💊", audience: "medical" },
  { id: "patient-care", label: "Patient Care", icon: "❤️", audience: "all" },
];

const QUIZ_PROMPTS = {
  "dental-basics": "Generate 5 quiz questions about basic dental health, tooth structure, hygiene, and common dental conditions. Mix multiple choice (4 options labeled A/B/C/D) and true/false questions. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
  "oral-anatomy": "Generate 5 quiz questions about oral anatomy for dental students: teeth types, periodontal structures, salivary glands, jaw anatomy. Mix MC and true/false. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
  "dental-procedures": "Generate 5 quiz questions about dental procedures for dental students: extractions, fillings, root canals, orthodontics, anesthesia. Mix MC and true/false. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
  "medical-general": "Generate 5 quiz questions about general medicine for medical students: physiology, common diseases, diagnostics. Mix MC and true/false. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
  "pharmacology": "Generate 5 quiz questions about pharmacology for medical students: drug classes, mechanisms, side effects, interactions. Mix MC and true/false. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
  "patient-care": "Generate 5 quiz questions about patient care for healthcare students and general public: hygiene, preventive care, when to see a doctor/dentist. Mix MC and true/false. Format ONLY as JSON array: [{\"question\":\"...\",\"type\":\"mc\" or \"tf\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"] (omit for tf),\"answer\":\"A\" or \"True\" or \"False\",\"explanation\":\"...\"}]",
};

export default function MedDentQuiz() {
  const [screen, setScreen] = useState("home"); // home | loading | quiz | result
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);

  async function startQuiz(category) {
    setSelectedCategory(category);
    setScreen("loading");
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a medical and dental education expert. Respond ONLY with valid JSON. No markdown, no explanation, no backticks.",
          messages: [{ role: "user", content: QUIZ_PROMPTS[category.id] }],
        }),
      });
      const data = await res.json();
      const text = data.content.map(b => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
      setCurrentQ(0);
      setScore(0);
      setAnswers([]);
      setSelected(null);
      setAnswered(false);
      setScreen("quiz");
    } catch (e) {
      setError("Failed to load questions. Please try again.");
      setScreen("home");
    }
  }

  function handleSelect(option) {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const q = questions[currentQ];
    const correct = option === q.answer || (q.type === "tf" && option === q.answer);
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { question: q.question, selected: option, correct, correctAnswer: q.answer, explanation: q.explanation }]);
  }

  function next() {
    if (currentQ + 1 >= questions.length) {
      setScreen("result");
    } else {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  const q = questions[currentQ];
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1923 0%, #1a2d3e 50%, #0d2135 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8f4f8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚕️</div>
        <h1 style={{
          fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          margin: 0,
          background: "linear-gradient(90deg, #7ecef4, #a8edea, #7ecef4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>MedDent Quiz</h1>
        <p style={{ color: "#7ecef4", opacity: 0.7, marginTop: 4, fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase" }}>
          Dental & Medical Study App
        </p>
      </div>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ width: "100%", maxWidth: 600 }}>
          {error && (
            <div style={{ background: "#ff4d4d22", border: "1px solid #ff4d4d55", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#ff8888", textAlign: "center" }}>
              {error}
            </div>
          )}
          <p style={{ textAlign: "center", color: "#a8d8ea", marginBottom: 28, fontSize: "1rem" }}>
            Choose a topic to begin your quiz
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => startQuiz(cat)}
                style={{
                  background: "linear-gradient(145deg, #1e3a50, #162c3e)",
                  border: "1px solid #2a5070",
                  borderRadius: 16,
                  padding: "20px 12px",
                  cursor: "pointer",
                  color: "#e8f4f8",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", textAlign: "center", lineHeight: 1.3 }}>{cat.label}</span>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: cat.audience === "all" ? "#1a5c3a" : cat.audience === "dental" ? "#1a3d5c" : "#3d1a5c",
                  color: cat.audience === "all" ? "#6dffa8" : cat.audience === "dental" ? "#6dcfff" : "#cf6dff",
                }}>
                  {cat.audience === "all" ? "Everyone" : cat.audience === "dental" ? "Dental" : "Medical"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LOADING */}
      {screen === "loading" && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{
            width: 64, height: 64, border: "4px solid #2a5070",
            borderTop: "4px solid #7ecef4", borderRadius: "50%",
            margin: "0 auto 24px",
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#7ecef4", fontSize: "1rem" }}>Generating your questions…</p>
        </div>
      )}

      {/* QUIZ */}
      {screen === "quiz" && q && (
        <div style={{ width: "100%", maxWidth: 620 }}>
          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#7ecef4", marginBottom: 8 }}>
              <span>{selectedCategory?.label}</span>
              <span>{currentQ + 1} / {questions.length}</span>
            </div>
            <div style={{ height: 6, background: "#1a3a50", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((currentQ + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg, #7ecef4, #a8edea)", borderRadius: 3, transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Question card */}
          <div style={{
            background: "linear-gradient(145deg, #1e3a50, #162c3e)",
            border: "1px solid #2a5070",
            borderRadius: 20,
            padding: "28px 24px",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{
                background: q.type === "tf" ? "#1a5c3a" : "#1a3d5c",
                color: q.type === "tf" ? "#6dffa8" : "#6dcfff",
                fontSize: "0.72rem", padding: "3px 10px", borderRadius: 20, fontFamily: "monospace", letterSpacing: 1
              }}>{q.type === "tf" ? "TRUE / FALSE" : "MULTIPLE CHOICE"}</span>
            </div>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{q.question}</p>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.type === "tf" ? (
              ["True", "False"].map(opt => {
                const isSelected = selected === opt;
                const isCorrect = answered && opt === q.answer;
                const isWrong = answered && isSelected && opt !== q.answer;
                return (
                  <button key={opt} onClick={() => handleSelect(opt)} style={{
                    padding: "16px 20px",
                    borderRadius: 14,
                    border: isCorrect ? "2px solid #6dffa8" : isWrong ? "2px solid #ff6b6b" : isSelected ? "2px solid #7ecef4" : "1px solid #2a5070",
                    background: isCorrect ? "#1a5c3a44" : isWrong ? "#5c1a1a44" : isSelected ? "#1a3d5c" : "#162c3e",
                    color: "#e8f4f8",
                    cursor: answered ? "default" : "pointer",
                    fontSize: "1rem",
                    fontFamily: "Georgia, serif",
                    fontWeight: 600,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>{opt === "True" ? "✓" : "✗"}</span>
                    {opt}
                    {isCorrect && <span style={{ marginLeft: "auto", color: "#6dffa8" }}>✔ Correct</span>}
                    {isWrong && <span style={{ marginLeft: "auto", color: "#ff6b6b" }}>✘ Wrong</span>}
                  </button>
                );
              })
            ) : (
              (q.options || []).map(opt => {
                const letter = opt.charAt(0);
                const isSelected = selected === letter;
                const isCorrect = answered && letter === q.answer;
                const isWrong = answered && isSelected && letter !== q.answer;
                return (
                  <button key={opt} onClick={() => handleSelect(letter)} style={{
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: isCorrect ? "2px solid #6dffa8" : isWrong ? "2px solid #ff6b6b" : isSelected ? "2px solid #7ecef4" : "1px solid #2a5070",
                    background: isCorrect ? "#1a5c3a44" : isWrong ? "#5c1a1a44" : isSelected ? "#1a3d5c" : "#162c3e",
                    color: "#e8f4f8",
                    cursor: answered ? "default" : "pointer",
                    fontSize: "0.95rem",
                    fontFamily: "Georgia, serif",
                    textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isCorrect ? "#6dffa8" : isWrong ? "#ff6b6b" : "#2a5070",
                      color: isCorrect || isWrong ? "#0f1923" : "#e8f4f8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                    }}>{letter}</span>
                    {opt.slice(3)}
                    {isCorrect && <span style={{ marginLeft: "auto", color: "#6dffa8", fontSize: "0.85rem" }}>✔</span>}
                    {isWrong && <span style={{ marginLeft: "auto", color: "#ff6b6b", fontSize: "0.85rem" }}>✘</span>}
                  </button>
                );
              })
            )}
          </div>

          {/* Explanation */}
          {answered && (
            <div style={{
              marginTop: 16, padding: "14px 18px",
              background: "#0f2535", borderRadius: 14,
              borderLeft: "3px solid #7ecef4",
              fontSize: "0.88rem", lineHeight: 1.6, color: "#a8d8ea",
              animation: "fadeIn 0.3s ease",
            }}>
              <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>
              <strong style={{ color: "#7ecef4" }}>Explanation: </strong>{q.explanation}
            </div>
          )}

          {answered && (
            <button onClick={next} style={{
              marginTop: 16, width: "100%", padding: "16px",
              background: "linear-gradient(90deg, #1a6b9e, #1e8fa8)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: "1rem", fontFamily: "Georgia, serif",
              fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
              transition: "opacity 0.2s",
            }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
            >
              {currentQ + 1 >= questions.length ? "See Results →" : "Next Question →"}
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && (
        <div style={{ width: "100%", maxWidth: 620 }}>
          <div style={{
            background: "linear-gradient(145deg, #1e3a50, #162c3e)",
            border: "1px solid #2a5070", borderRadius: 20, padding: "32px 24px",
            textAlign: "center", marginBottom: 20,
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>
              {pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}
            </div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.8rem" }}>
              {score} / {questions.length}
            </h2>
            <div style={{ fontSize: "3rem", fontWeight: 700, color: pct >= 80 ? "#6dffa8" : pct >= 60 ? "#ffd96d" : "#ff8c6d" }}>
              {pct}%
            </div>
            <p style={{ color: "#a8d8ea", marginTop: 8 }}>
              {pct >= 80 ? "Excellent work! You're well prepared." : pct >= 60 ? "Good effort — keep studying!" : "Keep practicing, you'll get there!"}
            </p>
          </div>

          {/* Answer review */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                background: a.correct ? "#1a5c3a22" : "#5c1a1a22",
                border: `1px solid ${a.correct ? "#6dffa855" : "#ff6b6b55"}`,
                borderRadius: 12, padding: "12px 16px",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.correct ? "✅" : "❌"}</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "0.88rem", lineHeight: 1.5 }}>{a.question}</p>
                    {!a.correct && <p style={{ margin: 0, fontSize: "0.8rem", color: "#ff8c8c" }}>Your answer: {a.selected} · Correct: {a.correctAnswer}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => startQuiz(selectedCategory)} style={{
              flex: 1, padding: "14px", background: "linear-gradient(90deg, #1a6b9e, #1e8fa8)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: "0.95rem", fontFamily: "Georgia, serif", fontWeight: 700, cursor: "pointer",
            }}>Retry Topic</button>
            <button onClick={() => setScreen("home")} style={{
              flex: 1, padding: "14px", background: "#1e3a50",
              border: "1px solid #2a5070", borderRadius: 14, color: "#e8f4f8",
              fontSize: "0.95rem", fontFamily: "Georgia, serif", fontWeight: 700, cursor: "pointer",
            }}>New Topic</button>
          </div>
        </div>
      )}
    </div>
  );
}
