// Scan page — point your phone at artwork to identify it.
// Uses the device camera to capture a photo, then sends it to
// the image similarity API to find matching artworks.
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { searchByImage } from "../lib/image-search";
import { upsertArtwork } from "../lib/db";

export default function ScanPage() {
  // Phase: "camera" → "searching" → "found" | "not-found" | "error"
  const [phase, setPhase] = useState("camera");
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start the camera
  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setErrorMsg("Camera access is needed to scan artwork. Please allow camera permissions and try again.");
      setPhase("error");
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Capture a photo from the video feed and search
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    // Show the captured frame
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setPhase("searching");

    // Convert canvas to blob for upload
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

    try {
      const matches = await searchByImage(file);

      // Filter to results with a decent similarity score
      // Scores close to 1.0 are strong matches
      const goodMatches = matches.filter((m) => m.score >= 0.75);
      const topResults = goodMatches.slice(0, 3);

      if (topResults.length > 0) {
        setResults(topResults);
        setPhase("found");
        // Insert matched artworks into DB so reactions/comments work (await to ensure they exist before user navigates)
        await Promise.all(topResults.map(art =>
          upsertArtwork({ id: art.id, title: art.title, artist: art.artist, year: art.dated, image: art.image, medium: art.medium, department: art.department, gallery: art.gallery })
        ));
      } else {
        setPhase("not-found");
      }
    } catch (err) {
      console.error("Image search error:", err);
      setErrorMsg(err.message || "Something went wrong identifying the artwork.");
      setPhase("error");
    }
  }, []);

  // Also support picking a photo from the gallery
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result);
    reader.readAsDataURL(file);
    setPhase("searching");

    try {
      const matches = await searchByImage(file);
      const goodMatches = matches.filter((m) => m.score >= 0.75);
      const topResults = goodMatches.slice(0, 3);

      if (topResults.length > 0) {
        setResults(topResults);
        setPhase("found");
        // Insert matched artworks into DB so reactions/comments work (await to ensure they exist before user navigates)
        await Promise.all(topResults.map(art =>
          upsertArtwork({ id: art.id, title: art.title, artist: art.artist, year: art.dated, image: art.image, medium: art.medium, department: art.department, gallery: art.gallery })
        ));
      } else {
        setPhase("not-found");
      }
    } catch (err) {
      console.error("Image search error:", err);
      setErrorMsg(err.message || "Something went wrong identifying the artwork.");
      setPhase("error");
    }
  }, []);

  // Reset to camera mode
  const handleScanAgain = useCallback(() => {
    setCapturedImage(null);
    setResults([]);
    setErrorMsg("");
    setPhase("camera");
    startCamera();
  }, [startCamera]);

  // Format the match score as a percentage
  const scorePercent = (score) => `${Math.round(score * 100)}%`;

  return (
    <div className="responsive-page" style={{
      height: "100vh",
      background: "#0A0A0A",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cornerGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .view-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
        .view-btn:active { transform: scale(0.96); }
        .scan-again-btn { transition: all 0.2s ease; cursor: pointer; }
        .scan-again-btn:active { transform: scale(0.96); }
        .capture-btn { transition: all 0.15s ease; cursor: pointer; }
        .capture-btn:active { transform: scale(0.9); }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 30,
      }}>
        <Link href="/" style={{
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: 12,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          textDecoration: "none",
        }}>
          ←
        </Link>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {phase === "camera" && "Point at artwork"}
          {phase === "searching" && "Identifying..."}
          {phase === "found" && "Artwork found"}
          {phase === "not-found" && "No match found"}
          {phase === "error" && "Scan error"}
        </div>
        {/* Upload from gallery button */}
        <label style={{
          background: "rgba(255,255,255,0.12)",
          border: "none",
          borderRadius: 12,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}>
          🖼️
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Main viewfinder area */}
      <div style={{
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Camera feed (always rendered but hidden when showing results) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: phase === "camera" ? "block" : "none",
          }}
        />

        {/* Captured image preview (shown during search/results) */}
        {capturedImage && phase !== "camera" && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: `url(${capturedImage}) center/cover`,
            filter: phase === "found" ? "brightness(0.35)" : phase === "searching" ? "brightness(0.5)" : "brightness(0.3)",
            transition: "filter 0.4s ease",
          }} />
        )}

        {/* Camera viewfinder overlay */}
        {phase === "camera" && cameraReady && (
          <>
            {/* Corner guides */}
            <div style={{ position: "absolute", width: 240, height: 240, animation: "cornerGlow 2.4s ease infinite" }}>
              {[
                { top: 0, left: 0, bt: true, bl: true, r: "8px 0 0 0" },
                { top: 0, right: 0, bt: true, br: true, r: "0 8px 0 0" },
                { bottom: 0, left: 0, bb: true, bl: true, r: "0 0 0 8px" },
                { bottom: 0, right: 0, bb: true, br: true, r: "0 0 8px 0" },
              ].map((c, i) => (
                <div key={i} style={{
                  position: "absolute", width: 40, height: 40,
                  ...(c.top !== undefined && { top: c.top }),
                  ...(c.bottom !== undefined && { bottom: c.bottom }),
                  ...(c.left !== undefined && { left: c.left }),
                  ...(c.right !== undefined && { right: c.right }),
                  ...(c.bt && { borderTop: "3px solid rgba(255,255,255,0.7)" }),
                  ...(c.bb && { borderBottom: "3px solid rgba(255,255,255,0.7)" }),
                  ...(c.bl && { borderLeft: "3px solid rgba(255,255,255,0.7)" }),
                  ...(c.br && { borderRight: "3px solid rgba(255,255,255,0.7)" }),
                  borderRadius: c.r,
                }} />
              ))}
            </div>

            {/* Hint text */}
            <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, textAlign: "center", animation: "fadeIn 0.5s ease" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", borderRadius: 20,
              }}>
                <span style={{ fontSize: 16 }}>📸</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
                  Tap the button to capture artwork
                </span>
              </div>
            </div>

            {/* Capture button */}
            <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <button
                className="capture-btn"
                onClick={handleCapture}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "4px solid rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                }} />
              </button>
            </div>
          </>
        )}

        {/* Camera not ready — waiting for permission */}
        {phase === "camera" && !cameraReady && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeIn 0.3s ease" }}>
            <div style={{
              width: 48, height: 48,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#C1476F",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
              Starting camera...
            </div>
          </div>
        )}

        {/* Searching phase */}
        {phase === "searching" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeIn 0.3s ease", position: "relative", zIndex: 10 }}>
            <div style={{
              width: 48, height: 48,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#C1476F",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
              Matching artwork...
            </div>
          </div>
        )}

        {/* Found — show top result(s) */}
        {phase === "found" && results.length > 0 && (
          <div style={{
            position: "relative", zIndex: 10, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "auto",
          }}>
            <div style={{ padding: "0 18px 18px", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              {/* Match badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", background: "rgba(76,175,80,0.2)", border: "1px solid rgba(76,175,80,0.3)",
                borderRadius: 20, marginBottom: 12, backdropFilter: "blur(10px)",
              }}>
                <span style={{ fontSize: 12 }}>✅</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: "#81C784", letterSpacing: "0.04em" }}>
                  {results.length === 1 ? "MATCH FOUND" : `${results.length} MATCHES FOUND`}
                </span>
              </div>

              {/* Top result — featured card */}
              <ResultCard artwork={results[0]} rank={1} featured />

              {/* Additional results */}
              {results.length > 1 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {results.slice(1).map((artwork, i) => (
                    <ResultCard key={artwork.id || i} artwork={artwork} rank={i + 2} />
                  ))}
                </div>
              )}

              <button className="scan-again-btn" onClick={handleScanAgain} style={{
                width: "100%", marginTop: 10, padding: "12px", borderRadius: 14,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500,
                cursor: "pointer",
              }}>
                📸 Scan Another Artwork
              </button>
            </div>
          </div>
        )}

        {/* Not found */}
        {phase === "not-found" && (
          <div style={{
            position: "relative", zIndex: 10, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            <div style={{ padding: "0 18px 18px", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <div style={{
                background: "rgba(15,15,15,0.75)", backdropFilter: "blur(24px)",
                borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
                padding: "28px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 8 }}>
                  No match found
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  Try getting closer to the artwork, or make sure the image is clear and well-lit.
                </p>
              </div>

              <button className="scan-again-btn" onClick={handleScanAgain} style={{
                width: "100%", marginTop: 10, padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                border: "none", color: "#FFF", fontSize: 15, fontWeight: 700,
                boxShadow: "0 4px 20px rgba(193,71,111,0.35)", cursor: "pointer",
              }}>
                📸 Try Again
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div style={{
            position: "relative", zIndex: 10, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            <div style={{ padding: "0 18px 18px", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <div style={{
                background: "rgba(15,15,15,0.75)", backdropFilter: "blur(24px)",
                borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
                padding: "28px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 8 }}>
                  Something went wrong
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  {errorMsg}
                </p>
              </div>

              <button className="scan-again-btn" onClick={handleScanAgain} style={{
                width: "100%", marginTop: 10, padding: "14px", borderRadius: 14,
                background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
                border: "none", color: "#FFF", fontSize: 15, fontWeight: 700,
                boxShadow: "0 4px 20px rgba(193,71,111,0.35)", cursor: "pointer",
              }}>
                📸 Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav variant="dark" />
    </div>
  );
}

// Result card component for displaying a matched artwork
function ResultCard({ artwork, rank, featured }) {
  const scoreColor = artwork.score >= 0.9 ? "#81C784" : artwork.score >= 0.8 ? "#FFD54F" : "#FFB74D";

  if (featured) {
    return (
      <div style={{
        background: "rgba(15,15,15,0.75)", backdropFilter: "blur(24px)",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
      }}>
        {artwork.image && (
          <div style={{ width: "100%", height: 180, overflow: "hidden", position: "relative" }}>
            <img src={artwork.image} alt={artwork.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
              background: "linear-gradient(transparent, rgba(15,15,15,0.9))",
            }} />
            {/* Score badge on image */}
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "4px 10px", borderRadius: 12,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
              border: `1px solid ${scoreColor}40`,
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: scoreColor }}>
                {Math.round(artwork.score * 100)}% match
              </span>
            </div>
          </div>
        )}

        <div style={{ padding: "14px 18px 10px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#FFF", lineHeight: 1.2, marginBottom: 4 }}>
            {artwork.title}
          </h2>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
            {artwork.artist}{artwork.dated ? `, ${artwork.dated}` : ""}
          </div>
          {(artwork.department || artwork.gallery) && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
              padding: "4px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 12,
            }}>
              <span style={{ fontSize: 12 }}>📍</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {[artwork.gallery, artwork.department].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}
          {artwork.culture && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, marginLeft: 6,
              padding: "4px 10px", background: "rgba(255,255,255,0.08)", borderRadius: 12,
            }}>
              <span style={{ fontSize: 12 }}>🌍</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {artwork.culture}
              </span>
            </div>
          )}
        </div>

        {/* View Details button */}
        <div style={{ padding: "8px 18px 16px" }}>
          <Link href={`/artwork/${artwork.id}`} className="view-btn" style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: "linear-gradient(135deg, #C1476F 0%, #D4763A 100%)",
            color: "#FFF", fontSize: 15, fontWeight: 700,
            letterSpacing: "0.02em", boxShadow: "0 4px 20px rgba(193,71,111,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            textDecoration: "none",
          }}>
            View Details & React →
          </Link>
        </div>
      </div>
    );
  }

  // Compact card for additional results
  return (
    <Link href={`/artwork/${artwork.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "rgba(15,15,15,0.65)", backdropFilter: "blur(20px)",
        borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
        padding: 12, display: "flex", gap: 12, alignItems: "center",
      }}>
        {artwork.image && (
          <img src={artwork.image} alt={artwork.title}
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600,
            color: "#FFF", lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {artwork.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            {artwork.artist}
          </div>
        </div>
        <div style={{
          padding: "4px 8px", borderRadius: 10,
          background: "rgba(255,255,255,0.06)",
          fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: scoreColor,
          flexShrink: 0,
        }}>
          {Math.round(artwork.score * 100)}%
        </div>
      </div>
    </Link>
  );
}
