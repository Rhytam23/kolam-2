import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import DesignPrinciples from './DesignPrinciples';
import { useKolam } from './KolamContext';
import { ANALYSIS_PRESETS, type AnalysisPreset, type AnalysisResponse, type Point } from '../types/kolam';
import { ACCEPTED_TYPES, MAX_UPLOAD_MB, analyzeKolam, shrinkImage } from '../lib/api';
import { downloadBlob, parseKolamFile, svgToPng, downloadKolamFile } from '../lib/kolamFile';
import { countLoops, designPath, designToSvg, diamondDesign, makeSingleLine, rowPattern, snapToLattice } from '../utils/kolamLogic';

const ZOOM_LEVELS = [1, 1.5, 2];
const HIT_RADIUS_PX = 12;

const PRESET_LABELS: Record<AnalysisPreset, string> = {
    'balanced': 'Any photo',
    'clean-scan': 'Drawing on paper / scan',
    'phone-photo': 'Phone photo of a floor',
    'noisy-background': 'Textured or busy floor',
};

interface Drag {
    index: number;
    before: Point[];
    start: Point;
    moved: boolean;
}

type Meta = Pick<AnalysisResponse, 'confidence' | 'symmetry' | 'radial' | 'palette'>;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const KolamAnalyzer: React.FC = () => {
    const k = useKolam();
    const { dots, setDots, scan, setScan, traced, setTraced, saved, save, remove, open, currentFile } = k;

    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Take or upload a photo of a kolam, rangoli or alpana, or try the sample.');
    const [history, setHistory] = useState<Point[][]>([]);
    const [future, setFuture] = useState<Point[][]>([]);
    const [edited, setEdited] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);
    const [preset, setPreset] = useState<AnalysisPreset>('balanced');
    const [deskew, setDeskew] = useState(true);
    const [showRecreation, setShowRecreation] = useState(true);
    const [surface, setSurface] = useState({ w: 0, h: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const surfaceRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const jsonInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    const hasSurface = !!imageUrl || dots.length > 0;
    const zoom = ZOOM_LEVELS[zoomIndex];

    useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        abortRef.current?.abort();
    }, []);

    // Keep the canvas the same size as the displayed image (or blank board).
    useEffect(() => {
        const node = surfaceRef.current;
        if (!node) return;
        const observer = new ResizeObserver(() => setSurface({ w: node.clientWidth, h: node.clientHeight }));
        observer.observe(node);
        return () => observer.disconnect();
    }, [hasSurface]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !surface.w) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = surface.w * dpr;
        canvas.height = surface.h * dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        if (showRecreation && scan?.lattice) {
            const { origin: o, u, v } = scan.lattice;
            const strands = new Path2D(designPath(scan.design));
            ctx.save();
            ctx.transform(surface.w * u.x, surface.h * u.y, surface.w * v.x, surface.h * v.y, surface.w * o.x, surface.h * o.y);
            ctx.lineCap = 'round';
            ctx.lineWidth = 0.13;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.stroke(strands);
            ctx.lineWidth = 0.07;
            ctx.strokeStyle = '#F08A00';
            ctx.stroke(strands);
            ctx.restore();
        } else if (showRecreation && traced && imageUrl) {
            ctx.save();
            ctx.scale(surface.w, surface.h);
            ctx.globalAlpha = 0.85;
            traced.layers.forEach(layer => {
                ctx.fillStyle = layer.color;
                ctx.fill(new Path2D(layer.path), 'evenodd');
            });
            ctx.restore();
        }
        dots.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * surface.w, p.y * surface.h, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#2E7D32';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        });
    }, [dots, scan, traced, imageUrl, showRecreation, surface]);

    // ------------------------------------------------------------ analysis

    const runAnalysis = async (source: File, manualDots?: Point[]) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setStatus(manualDots ? 'Recreating from your dots…' : 'Reading the design…');
        try {
            const data = await analyzeKolam(source, { preset, deskew, dots: manualDots, signal: controller.signal });
            if (data.image) setImageUrl(data.image);
            setDots(data.dots);
            if (data.design) {
                setTraced(null);
                setScan({ design: data.design, lattice: data.lattice });
            } else {
                setScan(null);
                setTraced(data.layers.length ? { layers: data.layers, palette: data.palette, width: data.width, height: data.height } : null);
            }
            setMeta({ confidence: data.confidence, symmetry: data.symmetry, radial: data.radial, palette: data.palette });
            setStatus(data.message);
            setEdited(false);
            if (!manualDots) {
                setHistory([]);
                setFuture([]);
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError((err as Error).message);
            setStatus('You can still place dots by hand, or try another photo or image type.');
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    };

    const loadImage = async (picked: File) => {
        if (!picked.type.startsWith('image/')) {
            setError('Please choose a photo (PNG, JPEG or WebP).');
            return;
        }
        const upload = await shrinkImage(picked);
        if (!ACCEPTED_TYPES.includes(upload.type)) {
            setError('This photo format is not supported here. Please use a PNG, JPEG or WebP image.');
            return;
        }
        if (upload.size > MAX_UPLOAD_MB * 1024 * 1024) {
            setError(`Images must be smaller than ${MAX_UPLOAD_MB} MB.`);
            return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(picked);
        setImageUrl(objectUrlRef.current);
        setFile(upload);
        setDots([]);
        setScan(null);
        setTraced(null);
        setMeta(null);
        setZoomIndex(0);
        void runAnalysis(upload);
    };

    const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        e.target.value = '';
        if (picked) void loadImage(picked);
    };

    const loadSample = async () => {
        const svg = designToSvg(makeSingleLine(diamondDesign(5)), { background: '#ffffff', stroke: '#1f1f1f', dot: '#1f1f1f' });
        void loadImage(new File([await svgToPng(svg)], 'sample-kolam.png', { type: 'image/png' }));
    };

    const clearImage = () => {
        abortRef.current?.abort();
        setImageUrl(null);
        setFile(null);
        setMeta(null);
        setTraced(null);
        setHistory([]);
        setFuture([]);
        setEdited(false);
    };

    const openFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        e.target.value = '';
        if (!picked) return;
        try {
            const parsed = parseKolamFile(JSON.parse(await picked.text()));
            if (!parsed) throw new Error('invalid');
            clearImage();
            open(parsed);
            setError(null);
            setStatus(`Opened ${picked.name}. Its kolam is now in the Design Studio.`);
        } catch {
            setError('That file is not a valid .kolam.json file.');
        }
    };

    const recreate = () => {
        if (scan) {
            k.setUseScan(true);
            k.setMode('kolam');
        } else if (traced) {
            k.setMode('traced');
        }
        scrollTo('generator');
    };

    const makeSimilar = () => {
        if (scan) {
            // Same kind of dot grid, drawn fresh in the studio.
            const pattern = rowPattern(scan.design).split('-').map(Number);
            const diamond = pattern.length > 2 && pattern[0] < pattern[Math.floor(pattern.length / 2)];
            k.setUseScan(false);
            k.setShape(diamond ? 'diamond' : 'square');
            k.setSize(Math.max(scan.design.rows, scan.design.cols));
            k.setSingleLine(countLoops(scan.design) === 1);
            k.setMode('kolam');
        } else {
            k.makeSimilar(meta?.radial?.order ?? 8, meta?.palette ?? []);
        }
        scrollTo('generator');
    };

    // ------------------------------------------------------------ dot editing

    const changeDots = (next: Point[], message: string) => {
        setHistory(h => [...h.slice(-49), dots]);
        setFuture([]);
        setDots(next);
        setEdited(true);
        setStatus(message);
    };

    const pointerPosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { point: { x: clamp((e.clientX - rect.left) / rect.width), y: clamp((e.clientY - rect.top) / rect.height) }, rect };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const { point, rect } = pointerPosition(e);
        const index = dots.findIndex(d => Math.hypot((d.x - point.x) * rect.width, (d.y - point.y) * rect.height) < HIT_RADIUS_PX);
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { index, before: dots, start: point, moved: false };
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.index < 0) return;
        const { point, rect } = pointerPosition(e);
        if (!drag.moved && Math.hypot((point.x - drag.start.x) * rect.width, (point.y - drag.start.y) * rect.height) < 3) return;
        drag.moved = true;
        setDots(drag.before.map((d, i) => (i === drag.index ? point : d)));
    };

    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag) return;
        if (drag.index < 0) {
            changeDots([...dots, pointerPosition(e).point], `Added a dot · ${dots.length + 1} dots.`);
        } else if (drag.moved) {
            setHistory(h => [...h.slice(-49), drag.before]);
            setFuture([]);
            setEdited(true);
            setStatus('Moved a dot.');
        } else {
            changeDots(drag.before.filter((_, i) => i !== drag.index), `Removed a dot · ${dots.length - 1} dots.`);
        }
    };

    const onPointerCancel = () => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (drag?.moved) setDots(drag.before);
    };

    const undo = () => {
        const previous = history[history.length - 1];
        if (!previous) return;
        setHistory(h => h.slice(0, -1));
        setFuture(f => [dots, ...f]);
        setDots(previous);
        setEdited(true);
    };

    const redo = () => {
        const next = future[0];
        if (!next) return;
        setFuture(f => f.slice(1));
        setHistory(h => [...h, dots]);
        setDots(next);
        setEdited(true);
    };

    const exportOverlay = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;
        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height;
        const ctx = out.getContext('2d')!;
        ctx.drawImage(img, 0, 0, out.width, out.height);
        ctx.drawImage(canvas, 0, 0);
        out.toBlob(blob => blob && downloadBlob(blob, `kolam-overlay-${Date.now()}.png`), 'image/png');
    };

    // ------------------------------------------------------------ view

    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">Read a Design</h2>
            <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
                Photograph a kolam, rangoli, alpana or muggulu. SOLVIX finds the dots, the symmetry and the colours, and recreates the design so you can draw it again.
            </p>

            <div className="max-w-6xl mx-auto space-y-8">
                <Card>
                    <div
                        className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-end"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault();
                            const dropped = e.dataTransfer.files?.[0];
                            if (dropped) void loadImage(dropped);
                        }}
                    >
                        <div className="space-y-3">
                            <Label htmlFor="kolam-upload" className="text-base">Your photo</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={() => cameraInputRef.current?.click()} disabled={loading}>Take a photo</Button>
                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />
                                <Button size="sm" variant="secondary" onClick={loadSample} disabled={loading}>Try a sample</Button>
                            </div>
                            <input
                                id="kolam-upload"
                                type="file"
                                accept="image/*"
                                onChange={onPick}
                                className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kaavi/10 file:text-kaavi hover:file:bg-kaavi/20 cursor-pointer"
                            />
                            <p className="text-xs text-muted">Or drop a photo here. Stand directly above the design, in daylight, with all of it in the frame.</p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="preset">Kind of photo</Label>
                                <select
                                    id="preset"
                                    value={preset}
                                    onChange={e => setPreset(e.target.value as AnalysisPreset)}
                                    className="w-full p-2 bg-white border border-kaavi/30 rounded-lg text-ink"
                                >
                                    {ANALYSIS_PRESETS.map(option => <option key={option} value={option}>{PRESET_LABELS[option]}</option>)}
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-ink">
                                <input type="checkbox" checked={deskew} onChange={e => setDeskew(e.target.checked)} className="accent-kaavi" />
                                Straighten a photo taken at an angle
                            </label>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2" aria-live="polite">
                        {loading && <p className="text-kaavi animate-pulse">Reading the design…</p>}
                        {error && <p className="text-kumkum text-sm bg-kumkum/10 px-4 py-2 rounded">{error}</p>}
                        <p className="text-sm text-muted">{status}</p>
                    </div>
                </Card>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
                    <Card>
                        {hasSurface ? (
                            <>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Button variant="secondary" size="sm" onClick={undo} disabled={!history.length}>Undo</Button>
                                    <Button variant="secondary" size="sm" onClick={redo} disabled={!future.length}>Redo</Button>
                                    <Button variant="secondary" size="sm" onClick={() => scan?.lattice && changeDots(snapToLattice(scan.lattice, dots), 'Snapped the dots onto the grid.')} disabled={!scan?.lattice || !dots.length}>Snap to grid</Button>
                                    <Button variant="secondary" size="sm" onClick={() => changeDots([], 'Cleared all dots.')} disabled={!dots.length}>Clear dots</Button>
                                    <Button variant="secondary" size="sm" onClick={() => setZoomIndex(z => (z + 1) % ZOOM_LEVELS.length)}>Zoom {zoom}×</Button>
                                    <label className="flex items-center gap-2 text-sm text-ink ml-auto">
                                        <input type="checkbox" checked={showRecreation} onChange={e => setShowRecreation(e.target.checked)} className="accent-kaavi" />
                                        Show recreation
                                    </label>
                                </div>
                                <div className="w-full overflow-auto max-h-[75vh] rounded-xl bg-sand/60 border border-kaavi/10">
                                    <div ref={surfaceRef} className="relative" style={{ width: `${zoom * 100}%` }}>
                                        {imageUrl
                                            ? <img ref={imageRef} src={imageUrl} alt="Your design" className="block w-full h-auto select-none pointer-events-none" draggable={false} />
                                            : <div className="w-full aspect-square" />}
                                        <canvas
                                            ref={canvasRef}
                                            onPointerDown={onPointerDown}
                                            onPointerMove={onPointerMove}
                                            onPointerUp={onPointerUp}
                                            onPointerCancel={onPointerCancel}
                                            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                                        />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-muted">
                                    Tap to add a missed dot, tap a dot to remove it, drag to move it. Then recreate the kolam from your corrected dots.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Button size="sm" onClick={() => file && runAnalysis(file, dots)} disabled={!file || !edited || loading || dots.length < 4}>
                                        Recreate from my dots
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={exportOverlay} disabled={!imageUrl}>Save overlay as PNG</Button>
                                </div>
                            </>
                        ) : (
                            <div className="aspect-video flex items-center justify-center text-center text-muted border-2 border-dashed border-kaavi/25 rounded-xl p-6">
                                Your photo will appear here, with the dots it found and the recreated lines drawn on top.
                            </div>
                        )}
                    </Card>

                    <div className="space-y-8">
                        <DesignPrinciples
                            scan={scan}
                            imageSymmetry={meta?.symmetry ?? null}
                            radial={meta?.radial ?? null}
                            palette={meta?.palette ?? []}
                            confidence={meta?.confidence ?? null}
                            onRecreate={recreate}
                            onSimilar={makeSimilar}
                            onDraw={() => { recreate(); scrollTo('walkthrough'); }}
                        />

                        <Card>
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <h3 className="font-heading text-xl text-kaavi">Saved kolams</h3>
                                <div className="flex gap-3 text-sm font-semibold">
                                    <button className="text-kaavi disabled:text-muted/50" onClick={save} disabled={!scan && !dots.length}>Save</button>
                                    <button className="text-kaavi disabled:text-muted/50" onClick={() => downloadKolamFile(currentFile())} disabled={!scan && !dots.length}>Export</button>
                                    <button className="text-kaavi" onClick={() => jsonInputRef.current?.click()}>Import</button>
                                </div>
                            </div>
                            <input ref={jsonInputRef} type="file" accept=".json,application/json" onChange={openFile} className="hidden" />
                            <div className="space-y-2 max-h-80 overflow-auto">
                                {saved.length === 0 && <p className="text-sm text-muted">Saved kolams stay in this browser. Export a .kolam.json file to share one.</p>}
                                {saved.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 border border-kaavi/15 rounded-xl p-3 bg-paper">
                                        <div>
                                            <p className="text-sm text-ink">{item.design.rows}×{item.design.cols} · {countLoops(item.design)} line(s)</p>
                                            <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-3 text-xs font-semibold">
                                            <button className="text-kaavi" onClick={() => { clearImage(); open(item); setStatus('Opened a saved kolam.'); }}>Open</button>
                                            <button className="text-kumkum" onClick={() => remove(item.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KolamAnalyzer;
