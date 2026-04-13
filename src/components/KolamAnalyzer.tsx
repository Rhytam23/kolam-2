import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { useKolam } from './KolamContext';
import type { AnalysisPreset, AnalysisResponse, Point } from '../types/kolam';
import { analyzeKolam } from '../lib/api/kolamApi';

const ZOOM_LEVELS = [1, 1.25, 1.5, 2];
const PRESETS: AnalysisPreset[] = ['balanced', 'clean-scan', 'phone-photo', 'noisy-background'];

const KolamAnalyzer: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Upload a Kolam to begin analysis.');
    const [imgDimensions, setImgDimensions] = useState<{ width: number, height: number } | null>(null);
    const [history, setHistory] = useState<Point[][]>([]);
    const [future, setFuture] = useState<Point[][]>([]);
    const [zoomIndex, setZoomIndex] = useState(0);
    const [preset, setPreset] = useState<(typeof PRESETS)[number]>('balanced');
    const [deskew, setDeskew] = useState(true);
    const [confidence, setConfidence] = useState<number | null>(null);

    const {
        analyzerDots,
        setAnalyzerDots,
        setSelectedDots,
        setAnalysisSummary,
        syncAnalyzerToGenerator,
        saveWorkspace,
        savedWorkspaces,
        loadWorkspace,
        removeWorkspace,
        exportDots,
        importWorkspace,
        snapDotsToGrid,
    } = useKolam();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragIndexRef = useRef<number | null>(null);
    const imageUrlRef = useRef<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const pushHistory = useCallback((dots: Point[]) => {
        setHistory(prev => [...prev, dots]);
        setFuture([]);
    }, []);

    const applyDots = useCallback((dots: Point[], message: string) => {
        setAnalyzerDots(dots);
        setSelectedDots(dots);
        setAnalysisSummary({ message, source: 'manual' });
        setStatus(message);
    }, [setAnalyzerDots, setSelectedDots, setAnalysisSummary]);

    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const payload = JSON.parse(text);
            importWorkspace(payload);
            setStatus('Workspace imported from JSON.');
            setError(null);
        } catch {
            setError('Failed to import workspace JSON.');
        }
    };

    const exportOverlayPng = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        const link = document.createElement('a');
        link.href = exportCanvas.toDataURL('image/png');
        link.download = `kolam-overlay-${Date.now()}.png`;
        link.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB.');
            return;
        }
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            setError('Only PNG and JPEG files are allowed.');
            return;
        }

        setError(null);
        setConfidence(null);
        setIsLoading(true);
        setHistory([]);
        setFuture([]);
        setAnalyzerDots([]);
        setSelectedDots([]);
        setStatus('Uploading image to analysis service...');

        const objectUrl = URL.createObjectURL(file);
        if (imageUrlRef.current) {
            URL.revokeObjectURL(imageUrlRef.current);
        }
        imageUrlRef.current = objectUrl;
        setImage(objectUrl);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const data: AnalysisResponse = await analyzeKolam(file, {
                preset,
                deskew,
                signal: controller.signal,
            });
            setAnalyzerDots(data.dots);
            setSelectedDots(data.dots);
            setImgDimensions({ width: data.width, height: data.height });
            setStatus(data.message || `Detected ${data.dots.length} potential dots.`);
            setConfidence(data.confidence ?? null);
            setAnalysisSummary({ message: data.message || `Detected ${data.dots.length} potential dots.`, source: 'upload' });
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error(err);
                setError('Failed to connect to analysis server. Make sure the Python backend is running.');
                setStatus('Analyzer offline. You can still manually place and edit reference dots.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img || !imgDimensions) return;

        const displayWidth = img.width;
        const displayHeight = img.height;

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        analyzerDots.forEach((point, index) => {
            const x = point.x * displayWidth;
            const y = point.y * displayHeight;

            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(253, 184, 19, 0.18)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#138808';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.fillStyle = '#FDB813';
            ctx.font = '10px Poppins';
            ctx.fillText(String(index + 1), x + 8, y - 8);
        });
    }, [analyzerDots, imgDimensions]);

    useEffect(() => {
        if (imageRef.current?.complete) {
            draw();
        } else {
            imageRef.current?.addEventListener('load', draw);
        }
        return () => imageRef.current?.removeEventListener('load', draw);
    }, [draw, analyzerDots, image]);

    useEffect(() => {
        return () => {
            if (imageUrlRef.current) {
                URL.revokeObjectURL(imageUrlRef.current);
            }
            abortRef.current?.abort();
        };
    }, []);

    const getNormalizedCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / canvas.width;
        const y = (e.clientY - rect.top) / canvas.height;
        return { x, y };
    };

    const findNearbyDotIndex = (x: number, y: number, threshold = 0.02) => analyzerDots.findIndex(p => Math.hypot(p.x - x, p.y - y) < threshold);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (dragIndexRef.current !== null) return;
        const coords = getNormalizedCoords(e);
        if (!coords) return;

        const existingDotIndex = findNearbyDotIndex(coords.x, coords.y);
        pushHistory(analyzerDots);

        const nextPoints = existingDotIndex >= 0
            ? analyzerDots.filter((_, idx) => idx !== existingDotIndex)
            : [...analyzerDots, coords];

        applyDots(nextPoints, `Manual refinement active · ${nextPoints.length} dots in workspace.`);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const coords = getNormalizedCoords(e);
        if (!coords) return;
        const existingDotIndex = findNearbyDotIndex(coords.x, coords.y, 0.025);
        if (existingDotIndex >= 0) {
            pushHistory(analyzerDots);
            dragIndexRef.current = existingDotIndex;
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (dragIndexRef.current === null) return;
        const coords = getNormalizedCoords(e);
        if (!coords) return;
        const next = analyzerDots.map((dot, idx) => idx === dragIndexRef.current ? { x: Math.min(1, Math.max(0, coords.x)), y: Math.min(1, Math.max(0, coords.y)) } : dot);
        setAnalyzerDots(next);
        setSelectedDots(next);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (dragIndexRef.current !== null) {
            dragIndexRef.current = null;
            (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
            setAnalysisSummary({ message: `Dragged dot positions updated · ${analyzerDots.length} dots in workspace.`, source: 'manual' });
            setStatus(`Dragged dot positions updated · ${analyzerDots.length} dots in workspace.`);
        }
    };

    const clearPoints = () => {
        pushHistory(analyzerDots);
        applyDots([], 'Workspace points cleared.');
    };

    const handleSnap = () => {
        pushHistory(analyzerDots);
        snapDotsToGrid();
        setStatus('Auto-snapped dots into a cleaner lattice.');
    };

    const undo = () => {
        if (!history.length) return;
        const previous = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setFuture(prev => [analyzerDots, ...prev]);
        applyDots(previous, `Undo applied · ${previous.length} dots in workspace.`);
    };

    const redo = () => {
        if (!future.length) return;
        const next = future[0];
        setFuture(prev => prev.slice(1));
        setHistory(prev => [...prev, analyzerDots]);
        applyDots(next, `Redo applied · ${next.length} dots in workspace.`);
    };

    const cycleZoom = () => setZoomIndex(prev => (prev + 1) % ZOOM_LEVELS.length);
    const zoom = ZOOM_LEVELS[zoomIndex];

    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Kolam Analyzer</h2>

            <div className="max-w-6xl mx-auto space-y-8">
                <Card>
                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="kolam-upload" className="text-xl">Upload a Kolam Image (PNG/JPEG)</Label>
                            <input
                                id="kolam-upload"
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="preset">Detection Preset</Label>
                                    <select id="preset" value={preset} onChange={(e) => setPreset(e.target.value as (typeof PRESETS)[number])} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500 transition-colors">
                                        {PRESETS.map(option => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 text-sm text-gray-300">
                                        <input type="checkbox" checked={deskew} onChange={(e) => setDeskew(e.target.checked)} className="accent-orange-500" />
                                        Enable perspective correction
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Import Workspace JSON</Button>
                                <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportJson} className="hidden" />
                                <Button variant="secondary" onClick={exportOverlayPng} disabled={!image || !analyzerDots.length}>Export Overlay PNG</Button>
                            </div>
                            {error && <p className="text-red-500 text-sm bg-red-900/20 px-4 py-2 rounded">{error}</p>}
                            {isLoading && <p className="text-saffron animate-pulse font-medium">✨ Visualizing Kolam...</p>}
                            <p className="text-sm text-gray-400">{status}</p>
                            {confidence !== null && <p className="text-sm text-saffron">Estimated detection confidence: {(confidence * 100).toFixed(0)}%</p>}
                        </div>

                        <div className="bg-black/20 rounded-xl border border-white/5 p-5 space-y-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-saffron mb-2">Workspace Summary</p>
                                <p className="text-3xl font-heading text-white">{analyzerDots.length}</p>
                                <p className="text-sm text-gray-400">active dots available for downstream generation</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="secondary" className="w-full" onClick={syncAnalyzerToGenerator} disabled={!analyzerDots.length}>Sync</Button>
                                <Button variant="secondary" className="w-full" onClick={cycleZoom}>Zoom {zoom}×</Button>
                                <Button variant="secondary" className="w-full" onClick={undo} disabled={!history.length}>Undo</Button>
                                <Button variant="secondary" className="w-full" onClick={redo} disabled={!future.length}>Redo</Button>
                                <Button variant="secondary" className="w-full" onClick={handleSnap} disabled={!analyzerDots.length}>Auto-Snap</Button>
                                <Button variant="secondary" className="w-full" onClick={saveWorkspace} disabled={!analyzerDots.length}>Save</Button>
                                <Button variant="secondary" className="w-full" onClick={exportDots} disabled={!analyzerDots.length}>Export JSON</Button>
                            </div>
                            <Button variant="secondary" className="w-full" onClick={clearPoints} disabled={!analyzerDots.length}>Clear Workspace</Button>
                        </div>
                    </div>
                </Card>

                <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
                    <div>
                        {image && (
                            <Card className="overflow-hidden">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
                                    <h3 className="text-xl font-semibold text-gray-200">Interactive Analysis</h3>
                                    <div className="space-x-4 text-sm text-gray-400">
                                        <span>Click to add/remove</span>
                                        <span>·</span>
                                        <span>Drag to reposition</span>
                                        <span>·</span>
                                        <span>{analyzerDots.length} dots in workspace</span>
                                    </div>
                                </div>

                                <div className="relative w-full overflow-auto bg-black/20 rounded-lg p-4">
                                    <div className="relative inline-block origin-top-left" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                                        <img
                                            ref={imageRef}
                                            src={image}
                                            alt="Kolam Analysis"
                                            className="max-w-full max-h-[70vh] object-contain block select-none pointer-events-none"
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            onClick={handleCanvasClick}
                                            onPointerDown={handlePointerDown}
                                            onPointerMove={handlePointerMove}
                                            onPointerUp={handlePointerUp}
                                            onPointerLeave={handlePointerUp}
                                            className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500">
                                    Detected {analyzerDots.length} dots. Refine detection manually, switch presets for different image conditions, optionally auto-snap them into a cleaner lattice, then sync them into the generator reference layer.
                                </div>
                            </Card>
                        )}
                    </div>

                    <Card>
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Saved Workspaces</h3>
                        <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
                            {savedWorkspaces.length === 0 && <p className="text-sm text-gray-500">No saved workspaces yet.</p>}
                            {savedWorkspaces.map((workspace) => (
                                <div key={workspace.id} className="border border-white/10 rounded-lg p-3 bg-black/10">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{workspace.analyzerDots.length} dots · {workspace.gridSize}×{workspace.gridSize}</div>
                                            <div className="text-xs text-gray-500">{new Date(workspace.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => loadWorkspace(workspace.id)} className="text-xs text-saffron">Load</button>
                                            <button onClick={() => removeWorkspace(workspace.id)} className="text-xs text-red-400">Delete</button>
                                        </div>
                                    </div>
                                    {workspace.summary && <p className="text-xs text-gray-400">{workspace.summary.message}</p>}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default KolamAnalyzer;
