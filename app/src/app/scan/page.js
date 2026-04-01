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
    let cancelled = false;

    async function initializeCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.error("Camera access denied:", err);
        setErrorMsg("Camera access is needed to scan artwork. Please allow camera permissions and try again.");
        setPhase("error");
      }
    }

    void initializeCamera();

    return () => {
      cancelled = true;
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
      const topResults = goodMatches.slice(0, 5);

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
      const topResults = goodMatches.slice(0, 5);

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
            <div style={{ position: "absolute", bottom: 184, left: 0, right: 0, textAlign: "center", animation: "fadeIn 0.5s ease" }}>
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
            <div style={{ position: "absolute", bottom: 96, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
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
            display: "flex", flexDirection: "column", overflow: "auto",
          }}>
            <div style={{ padding: "12px 16px", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
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

              {/* All results — uniform cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.map((artwork, i) => (
                  <ResultCard key={artwork.id || i} artwork={artwork} rank={i + 1} />
                ))}
              </div>

              <button className="scan-again-btn" onClick={handleScanAgain} style={{
                width: "100%", marginTop: 12, padding: "12px", borderRadius: 14,
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
            <div style={{ padding: "0 18px", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
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
            <div style={{ padding: "0 18px", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))", animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
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

// Result card — large image on top for easy visual matching, info below
function ResultCard({ artwork, rank }) {
  const scoreColor = artwork.score >= 0.9 ? "#81C784" : artwork.score >= 0.8 ? "#FFD54F" : "#FFB74D";
  const scorePct = Math.round(artwork.score * 100);

  return (
    <Link href={`/artwork/${artwork.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="view-btn" style={{
        background: "rgba(15,15,15,0.75)", backdropFilter: "blur(24px)",
        borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        {/* Artwork image — full width, tall, for easy visual matching */}
        {artwork.image && (
          <div style={{
            width: "100%", height: 220,
            background: "#1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={artwork.image} alt={artwork.title}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        )}

        {/* Info row */}
        <div style={{ padding: "10px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700,
              color: "#FFF", lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {artwork.title}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              {artwork.artist}{artwork.dated ? `, ${artwork.dated}` : ""}
            </div>
            {(artwork.department || artwork.gallery) && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
                📍 {[artwork.gallery, artwork.department].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>

          {/* Score badge + arrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              padding: "4px 10px", borderRadius: 10,
              background: `${scoreColor}18`, border: `1px solid ${scoreColor}40`,
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: scoreColor }}>
                {scorePct}%
              </span>
            </div>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
