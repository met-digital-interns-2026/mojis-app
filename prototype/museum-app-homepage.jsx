import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    emoji: "😢",
    label: "Saddest",
    count: 2847,
    color: "#4A6FA5",
    bgGrad: "linear-gradient(135deg, #4A6FA5 0%, #2D4A7A 100%)",
    exhibition: "European Paintings",
    artwork: {
      title: "The Death of Socrates",
      artist: "Jacques-Louis David",
      year: "1787",
      image: "https://images.metmuseum.org/CRDImages/ep/original/DP-13139-001.jpg",
      reactions: { "😢": 1243, "😮": 892, "🤔": 712 },
      comments: [
        { user: "ArtLover42", emoji: "😢", text: "This one hits different when you see it in person", likes: 24, replies: [
          { user: "MuseumGuide", emoji: "😮", text: "Right?? The painting is over 10 feet wide!", likes: 8 },
          { user: "ClassicsFan", emoji: "😢", text: "I literally teared up standing in front of it", likes: 5 },
        ]},
        { user: "MuseumKid", emoji: "😮", text: "Wait he actually chose to die?? That's wild", likes: 18, replies: [
          { user: "PhiloNerd", emoji: "🤔", text: "He believed in following the law even when it was unjust", likes: 12 },
        ]},
        { user: "SocratesFan", emoji: "🤔", text: "The way his students are grieving while he stays calm...", likes: 31, replies: [] },
      ],
    },
  },
  {
    emoji: "❤️",
    label: "Most Loved",
    count: 5102,
    color: "#C1476F",
    bgGrad: "linear-gradient(135deg, #C1476F 0%, #8B2252 100%)",
    exhibition: "Modern & Contemporary",
    artwork: {
      title: "Water Lilies",
      artist: "Claude Monet",
      year: "1919",
      image: "https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg",
      reactions: { "❤️": 3891, "😍": 1211, "✨": 842 },
      comments: [
        { user: "PaintingPro", emoji: "❤️", text: "I could stare at this for hours honestly", likes: 42, replies: [
          { user: "MonetStan", emoji: "😍", text: "Same!! I sat on the bench for 20 minutes", likes: 15 },
        ]},
        { user: "LilyPad", emoji: "😍", text: "The colors are insane up close!!", likes: 33, replies: [] },
      ],
    },
  },
  {
    emoji: "😱",
    label: "Most Shocking",
    count: 1956,
    color: "#D4763A",
    bgGrad: "linear-gradient(135deg, #D4763A 0%, #A04E1B 100%)",
    exhibition: "Arms & Armor",
    artwork: {
      title: "Armor Garniture",
      artist: "Attributed to Kolman Helmschmid",
      year: "ca. 1525",
      image: "https://images.metmuseum.org/CRDImages/aa/original/DP-12881-005.jpg",
      reactions: { "😱": 987, "😮": 654, "🔥": 315 },
      comments: [
        { user: "KnightFan", emoji: "😱", text: "Imagine actually wearing this into battle", likes: 15, replies: [
          { user: "ArmorNerd", emoji: "🔥", text: "It weighs like 50 pounds and they fought in it!!", likes: 9 },
        ]},
        { user: "HistoryNerd", emoji: "🔥", text: "The detail on this is next level craftsmanship", likes: 22, replies: [] },
      ],
    },
  },
  {
    emoji: "🤔",
    label: "Most Puzzling",
    count: 3211,
    color: "#6B7B5E",
    bgGrad: "linear-gradient(135deg, #6B7B5E 0%, #4A5940 100%)",
    exhibition: "Asian Art",
    artwork: {
      title: "Under the Wave off Kanagawa",
      artist: "Katsushika Hokusai",
      year: "ca. 1830–32",
      image: "https://images.metmuseum.org/CRDImages/as/original/DP141139.jpg",
      reactions: { "🤔": 1567, "😍": 1102, "✨": 542 },
      comments: [
        { user: "WaveCatcher", emoji: "🤔", text: "Is it about nature's power or human smallness?", likes: 27, replies: [
          { user: "ArtTeacher", emoji: "✨", text: "That's the beauty of it — it's both!", likes: 19 },
        ]},
        { user: "PrintLover", emoji: "😍", text: "Fun fact: this is a woodblock print not a painting!", likes: 45, replies: [
          { user: "WaveCatcher", emoji: "😮", text: "Wait WHAT that makes it even more impressive", likes: 11 },
        ]},
        { user: "OceanVibes", emoji: "✨", text: "Mt. Fuji hiding in the background is everything", likes: 16, replies: [] },
      ],
    },
  },
  {
    emoji: "😍",
    label: "Most Beautiful",
    count: 4320,
    color: "#8E6BAD",
    bgGrad: "linear-gradient(135deg, #8E6BAD 0%, #5E3D7A 100%)",
    exhibition: "Egyptian Art",
    artwork: {
      title: "Sphinx of Hatshepsut",
      artist: "Unknown",
      year: "ca. 1479–1458 B.C.",
      image: "https://images.metmuseum.org/CRDImages/eg/original/DP246556.jpg",
      reactions: { "😍": 2104, "😮": 1305, "❤️": 911 },
      comments: [
        { user: "EgyptFan", emoji: "😍", text: "A female pharaoh!! She was ahead of her time", likes: 38, replies: [
          { user: "HistoryBuff", emoji: "🔥", text: "Hatshepsut was one of the most successful pharaohs ever", likes: 21 },
        ]},
        { user: "TimeTraveler", emoji: "😮", text: "3,500 years old and still looks this good", likes: 29, replies: [] },
      ],
    },
  },
];

const TRENDING = [
  { emoji: "🔥", title: "Starry Night Sketch", artist: "Van Gogh", count: 89, time: "2m ago" },
  { emoji: "😂", title: "Portrait of a Man", artist: "Frans Hals", count: 45, time: "5m ago" },
  { emoji: "✨", title: "Temple of Dendur", artist: "Egyptian, 15 B.C.", count: 312, time: "12m ago" },
];

function SpeechBubble({ comment, color, delay = 0, onReply, onLike, depth = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!liked) {
      setLiked(true);
      setLikeCount(likeCount + 1);
    } else {
      setLiked(false);
      setLikeCount(likeCount - 1);
    }
    if (onLike) onLike(comment);
  };

  const handleReply = (e) => {
    e.stopPropagation();
    if (onReply) onReply(comment);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div style={{
      animation: `fadeUp 0.35s ease ${delay}s both`,
      marginLeft: depth > 0 ? 36 : 0,
    }}>
      <div style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}>
        {/* Avatar circle */}
        <div style={{
          width: depth > 0 ? 24 : 28,
          height: depth > 0 ? 24 : 28,
          borderRadius: "50%",
          background: `${color}20`,
          border: `1.5px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: depth > 0 ? 12 : 14,
          flexShrink: 0,
          marginTop: 2,
        }}>
          {comment.emoji}
        </div>
        {/* Bubble */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            position: "relative",
            background: depth > 0 ? "#F9F7F4" : "#FFF",
            border: `1.5px solid ${depth > 0 ? "#EDEAE4" : "#E8E4DD"}`,
            borderRadius: depth > 0 ? "4px 14px 14px 14px" : "4px 16px 16px 16px",
            padding: "8px 12px",
            boxShadow: "0 1px 4px rgba(45,42,38,0.04)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 3,
            }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#2D2A26",
              }}>
                {comment.user}
              </span>
              {comment.replyTo && (
                <>
                  <span style={{ fontSize: 10, color: "#A09B94" }}>→</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: color }}>
                    {comment.replyTo}
                  </span>
                </>
              )}
              <span style={{
                fontSize: 10,
                color: "#A09B94",
              }}>
                • just now
              </span>
            </div>
            <div style={{
              fontSize: 13,
              color: "#4A453D",
              lineHeight: 1.4,
            }}>
              {comment.text}
            </div>
          </div>

          {/* Like & Reply buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 4px 0",
          }}>
            <button
              onClick={handleLike}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 0",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                color: liked ? "#C1476F" : "#A09B94",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{
                fontSize: 13,
                transition: "transform 0.2s ease",
                transform: liked ? "scale(1.2)" : "scale(1)",
              }}>
                {liked ? "❤️" : "🤍"}
              </span>
              {likeCount > 0 && likeCount}
            </button>
            {depth === 0 && (
              <button
                onClick={handleReply}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 0",
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#A09B94",
                  transition: "color 0.2s ease",
                }}
              >
                ↩ Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <>
          {comment.replies.length > 1 && !showReplies ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowReplies(true); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                color: color,
                padding: "4px 0 0 44px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View {comment.replies.length} replies ▾
            </button>
          ) : null}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 6,
          }}>
            {(showReplies ? comment.replies : comment.replies.slice(0, 1)).map((reply, ri) => (
              <SpeechBubble
                key={ri}
                comment={reply}
                color={color}
                delay={ri * 0.05}
                depth={1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CommentsSection({ comments, color }) {
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState(comments || []);
  const [showInput, setShowInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const visibleComments = showAll ? localComments : localComments.slice(0, 2);

  const handleAddComment = () => {
    if (newComment.trim()) {
      if (replyingTo) {
        // Add as a reply to the target comment
        setLocalComments(localComments.map(c => {
          if (c === replyingTo) {
            return {
              ...c,
              replies: [...(c.replies || []), {
                user: "You",
                emoji: "💬",
                text: newComment.trim(),
                replyTo: replyingTo.user,
                likes: 0,
              }],
            };
          }
          return c;
        }));
      } else {
        setLocalComments([...localComments, {
          user: "You",
          emoji: "💬",
          text: newComment.trim(),
          likes: 0,
          replies: [],
        }]);
      }
      setNewComment("");
      setShowInput(false);
      setReplyingTo(null);
      setShowAll(true);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setShowInput(true);
  };

  return (
    <div style={{
      padding: "0 14px 14px",
      borderTop: "1px solid #F2EFE9",
    }}>
      {/* Comments header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0 8px",
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#8C8580",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          💬 Comments ({localComments.length})
        </span>
        {localComments.length > 2 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
            style={{
              background: "none",
              border: "none",
              fontSize: 11,
              fontWeight: 600,
              color: color,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showAll ? "Show less" : `View all ${localComments.length}`}
          </button>
        )}
      </div>

      {/* Comment bubbles */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleComments.map((comment, i) => (
          <SpeechBubble
            key={i}
            comment={comment}
            color={color}
            delay={i * 0.05}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Add comment / reply input */}
      {showInput ? (
        <div style={{
          marginTop: 10,
          animation: "fadeUp 0.25s ease",
        }}
          onClick={(e) => e.stopPropagation()}
        >
          {replyingTo && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: `${color}10`,
              borderRadius: "10px 10px 0 0",
              border: `1.5px solid ${color}25`,
              borderBottom: "none",
            }}>
              <span style={{
                fontSize: 11,
                color: "#6B6560",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                ↩ Replying to <strong style={{ color: color }}>{replyingTo.user}</strong>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  color: "#A09B94",
                  cursor: "pointer",
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Share your thoughts..."}
              autoFocus
              style={{
                flex: 1,
                border: "1.5px solid #E8E4DD",
                borderRadius: replyingTo ? "0 0 0 12px" : 12,
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                background: "#FAFAF8",
                color: "#2D2A26",
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                background: color,
                color: "#FFF",
                border: "none",
                borderRadius: replyingTo ? "0 0 12px 0" : 12,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setShowInput(true); }}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "9px 14px",
            background: "#FAFAF8",
            border: "1.5px dashed #D9D5CE",
            borderRadius: 12,
            fontSize: 12,
            color: "#A09B94",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          💬 Add a comment...
        </button>
      )}
    </div>
  );
}

export default function MuseumApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [loaded, setLoaded] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = (e) => {
      setHeaderScrolled(e.target.scrollTop > 40);
    };
    const el = document.querySelector(".app-scroll");
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      height: "100vh",
      background: "#F7F5F0",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .app-scroll { overflow-y: auto; flex: 1; }
        .app-scroll::-webkit-scrollbar { display: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .category-card {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .category-card:active {
          transform: scale(0.97);
        }

        .artwork-img {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover .artwork-img {
          transform: scale(1.05);
        }

        .emoji-pill {
          transition: all 0.2s ease;
        }
        .emoji-pill:hover {
          transform: scale(1.1);
        }

        .tab-btn {
          transition: all 0.25s ease;
          cursor: pointer;
          background: none;
          border: none;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .trending-item {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .trending-item:active {
          transform: scale(0.98);
          background: rgba(0,0,0,0.04);
        }
      `}</style>

      {/* Status Bar */}
      <div style={{
        padding: "10px 20px 0",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        fontWeight: 500,
        color: "#2D2A26",
        flexShrink: 0,
      }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 16, height: 10, border: "1.5px solid #2D2A26", borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", inset: 1.5, background: "#2D2A26", borderRadius: 0.5, width: "70%" }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: "12px 20px 8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        transition: "all 0.3s ease",
        borderBottom: headerScrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
        background: headerScrolled ? "rgba(247,245,240,0.95)" : "transparent",
        backdropFilter: headerScrolled ? "blur(10px)" : "none",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #2D2A26 0%, #5C574E 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}>
            🏛️
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#2D2A26",
              lineHeight: 1.1,
            }}>
              Moji Museum
            </div>
            <div style={{ fontSize: 11, color: "#8C8580", fontWeight: 400, letterSpacing: "0.02em" }}>
              The Met — 847 visitors reacting now
            </div>
          </div>
        </div>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#EDEAE4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
        }}>
          👤
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="app-scroll" style={{ padding: "0 0 100px" }}>

        {/* Trending Now Banner */}
        <div style={{
          margin: "16px 18px 0",
          padding: "14px 16px",
          background: "linear-gradient(135deg, #2D2A26 0%, #4A453D 100%)",
          borderRadius: 16,
          opacity: loaded ? 1 : 0,
          animation: loaded ? "fadeUp 0.5s ease forwards" : "none",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 14, animation: "pulse 2s ease infinite" }}>🔴</span>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#F7F5F0",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              Trending Now
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TRENDING.map((item, i) => (
              <div key={i} className="trending-item" style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: 10,
                animationDelay: `${0.1 + i * 0.08}s`,
              }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#F7F5F0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#A09B94" }}>{item.artist}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F5F0" }}>+{item.count}</div>
                  <div style={{ fontSize: 10, color: "#A09B94" }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories Header */}
        <div style={{
          padding: "24px 20px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          opacity: loaded ? 1 : 0,
          animation: loaded ? "fadeUp 0.5s ease 0.2s forwards" : "none",
          animationFillMode: "backwards",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#2D2A26",
              letterSpacing: "-0.01em",
            }}>
              Top Reactions
            </h2>
            <p style={{ fontSize: 13, color: "#8C8580", marginTop: 2 }}>
              Most reacted artworks this week
            </p>
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#C1476F",
            cursor: "pointer",
          }}>
            See all →
          </span>
        </div>

        {/* Category Cards */}
        <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={i}
              className="category-card"
              onClick={() => setExpandedCard(expandedCard === i ? null : i)}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "#FFF",
                boxShadow: "0 2px 16px rgba(45,42,38,0.06), 0 0.5px 2px rgba(45,42,38,0.04)",
                opacity: loaded ? 1 : 0,
                animation: loaded ? `fadeUp 0.5s ease ${0.3 + i * 0.1}s forwards` : "none",
                animationFillMode: "backwards",
              }}
            >
              {/* Card Header */}
              <div style={{
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: cat.bgGrad,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    animation: "float 3s ease infinite",
                    animationDelay: `${i * 0.5}s`,
                  }}>
                    {cat.emoji}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#2D2A26",
                    }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#8C8580" }}>
                      {cat.count.toLocaleString()} reactions
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "#F2EFE9",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#6B6560",
                }}>
                  {cat.exhibition}
                </div>
              </div>

              {/* Artwork Preview */}
              <div style={{
                position: "relative",
                height: 200,
                overflow: "hidden",
                background: "#E8E4DD",
              }}>
                <img
                  className="artwork-img"
                  src={cat.artwork.image}
                  alt={cat.artwork.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: "linear-gradient(transparent, rgba(45,42,38,0.75))",
                }} />
                {/* Artwork info */}
                <div style={{
                  position: "absolute",
                  bottom: 12,
                  left: 14,
                  right: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#FFF",
                      lineHeight: 1.2,
                      textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}>
                      {cat.artwork.title}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      marginTop: 2,
                    }}>
                      {cat.artwork.artist}, {cat.artwork.year}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reaction pills */}
              <div style={{
                padding: "12px 14px",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}>
                {Object.entries(cat.artwork.reactions).map(([emoji, count], j) => (
                  <div
                    key={j}
                    className="emoji-pill"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 20,
                      background: j === 0 ? `${cat.color}15` : "#F5F3EE",
                      border: j === 0 ? `1.5px solid ${cat.color}30` : "1.5px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{emoji}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: j === 0 ? cat.color : "#6B6560",
                    }}>
                      {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                    </span>
                  </div>
                ))}
                <div style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "#A09B94",
                  cursor: "pointer",
                  fontWeight: 500,
                }}>
                  + React
                </div>
              </div>

              {/* Comments */}
              {cat.artwork.comments && cat.artwork.comments.length > 0 && (
                <CommentsSection comments={cat.artwork.comments} color={cat.color} />
              )}
            </div>
          ))}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 20 }} />
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: "rgba(247,245,240,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        paddingTop: 8,
        zIndex: 20,
      }}>
        {[
          { icon: "🏠", label: "Home", id: "home" },
          { icon: "🗺️", label: "Gallery", id: "gallery" },
          { icon: "📸", label: "Scan", id: "scan", special: true },
          { icon: "🏆", label: "Rankings", id: "rankings" },
          { icon: "👤", label: "Profile", id: "profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            className="tab-btn"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.special ? (
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginTop: -20,
                boxShadow: "0 4px 16px rgba(193,71,111,0.35)",
              }}>
                {tab.icon}
              </div>
            ) : (
              <span style={{
                fontSize: 22,
                opacity: activeTab === tab.id ? 1 : 0.45,
                transition: "opacity 0.2s",
              }}>
                {tab.icon}
              </span>
            )}
            <span style={{
              fontSize: 10,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "#2D2A26" : "#A09B94",
              marginTop: tab.special ? -2 : 0,
            }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
