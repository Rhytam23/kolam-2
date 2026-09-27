import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import DesignPrinciples from './DesignPrinciples';
import { useKolam } from './KolamContext';
import { ANALYSIS_PRESETS, type AnalysisPreset, type ImageSymmetry, type Point } from '../types/kolam';
import { ACCEPTED_TYPES, MAX_UPLOAD_MB, analyzeKolam } from '../lib/api';
import { downloadBlob, downloadKolamFile, parseKolamFile, svgToPng } from '../lib/kolamFile';
import { countLoops, designPath, designToSvg, diamondDesign, makeSingleLine, snapToLattice } from '../utils/kolamLogic';

const ZOOM_LEVELS = [1, 1.5, 2];
const HIT_RADIUS_PX = 12;

interface Drag {
    index: number;
    before: Point[];
    start: Point;
    moved: boolean;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const KolamAnalyzer: React.FC = () => {
    const { dots, setDots, scan, setScan, saved, save, remove, open, currentFile } = useKolam();

    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [meta, setMeta] = useState<{ confidence: number; symmetry: ImageSymmetry | null } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Upload a photo or scan of a kolam, or try the sample.');
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
    const dragRef = useRef<Drag | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    const hasSurface = !!imageUrl || dots.length > 0;
    const zoom = ZOOM_LEVELS[zoomIndex];

    // Release the object URL and cancel requests when leaving.
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
            ctx.save();
            ctx.transform(surface.w * u.x, surface.h * u.y, surface.w * v.x, surface.h * v.y, surface.w * o.x, surface.h * o.y);
            ctx.lineWidth = 0.07;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(255, 153, 51, 0.9)';
            ctx.stroke(new Path2D(designPath(scan.design)));
            ctx.restore();
        }
        dots.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * surface.w, p.y * surface.h, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#138808';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        });
    }, [dots, scan, showRecreation, surface]);

    // ------------------------------------------------------------ analysis

    const runAnalysis = async (source: File, manualDots?: Point[]) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        setStatus(manualDots ? 'Recreating from your dots…' : 'Analyzing…');
        try {
            const data = await analyzeKolam(source, { preset, deskew, dots: manualDots, signal: controller.signal });
            if (data.image) setImageUrl(data.image);
            setDots(data.dots);
            setScan(data.design ? { design: data.design, lattice: data.lattice } : null);
            setMeta({ confidence: data.confidence, symmetry: data.symmetry });
            setStatus(data.message);
            setEdited(false);
            if (!manualDots) {
                setHistory([]);
                setFuture([]);
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError((err as Error).message);
            setStatus('You can still place dots by hand, or try another image or preset.');
        } finally {
            if (abortRef.current === controller) setLoading(false);
        }
    };

    const loadImage = (next: File) => {
        if (!ACCEPTED_TYPES.includes(next.type)) {
            setError('Please upload a PNG, JPEG or WebP image.');
            return;
        }
        if (next.size > MAX_UPLOAD_MB * 1024 * 1024) {
            setError(`Images must be smaller than ${MAX_UPLOAD_MB} MB.`);
            return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(next);
        setImageUrl(objectUrlRef.current);
        setFile(next);
        setDots([]);
        setScan(null);
        setMeta(null);
        setZoomIndex(0);
        void runAnalysis(next);
    };

    const loadSample = async () => {
        const svg = designToSvg(makeSingleLine(diamondDesign(5)), { background: '#ffffff', stroke: '#1f1f1f', dot: '#1f1f1f' });
        loadImage(new File([await svgToPng(svg)], 'sample-kolam.png', { type: 'image/png' }));
    };

    const clearImage = () => {
        abortRef.current?.abort();
        setImageUrl(null);
        setFile(null);
        setMeta(null);
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
            setStatus(`Opened ${picked.name}. Its kolam is now in the generator.`);
        } catch {
            setError('That file is not a valid .kolam.json file.');
        }
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
        setDots(drag.before.map((d, k) => (k === drag.index ? point : d)));
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
            changeDots(drag.before.filter((_, k) => k !== drag.index), `Removed a dot · ${dots.length - 1} dots.`);
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
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">Kolam Analyzer</h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Finds the dot grid, reads whether strands cross or turn between each pair of dots, and recreates the kolam from that.
            </p>

            <div className="max-w-6xl mx-auto space-y-8">
                <Card>
                    <div
                        className="grid md:grid-cols-[1.3fr_1fr] gap-6 items-end"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault();
                            const dropped = e.dataTransfer.files?.[0];
                            if (dropped) loadImage(dropped);
                        }}
                    >
                        <div className="space-y-3">
                            <Label htmlFor="kolam-upload" className="text-lg">Kolam image (PNG, JPEG or WebP, up to {MAX_UPLOAD_MB} MB)</Label>
                            <input
                                id="kolam-upload"
                                type="file"
                                accept={ACCEPTED_TYPES.join(',')}
                                onChange={e => {
                                    const picked = e.target.files?.[0];
                                    e.target.value = '';
                                    if (picked) loadImage(picked);
                                }}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"
                            />
                            <p className="text-xs text-gray-500">Or drop an image here. Best results come from a top-down photo with good contrast.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="preset">Image type</Label>
                                <select
                                    id="preset"
                                    value={preset}
                                    onChange={e => setPreset(e.target.value as AnalysisPreset)}
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                                >
                                    {ANALYSIS_PRESETS.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <Button variant="secondary" className="!px-3 !py-2 text-sm" onClick={loadSample} disabled={loading}>Try a sample</Button>
                            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-300">
                                <input type="checkbox" checked={deskew} onChange={e => setDeskew(e.target.checked)} className="accent-orange-500" />
                                Straighten a photographed sheet (perspective correction)
                            </label>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2" aria-live="polite">
                        {loading && <p className="text-saffron animate-pulse">Analyzing the kolam…</p>}
                        {error && <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded">{error}</p>}
                        <p className="text-sm text-gray-400">{status}</p>
                    </div>
                </Card>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
                    <Card>
                        {hasSurface ? (
                            <>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Button variant="secondary" className="!px-3 !py-1.5 text-sm" onClick={undo} disabled={!history.length}>Undo</Button>
                                    <Button variant="secondary" className="!px-3 !py-1.5 text-sm" onClick={redo} disabled={!future.length}>Redo</Button>
                                    <Button variant="secondary" className="!px-3 !py-1.5 text-sm" onClick={() => scan?.lattice && changeDots(snapToLattice(scan.lattice, dots), 'Snapped the dots onto the lattice.')} disabled={!scan?.lattice || !dots.length}>Snap to grid</Button>
                                    <Button variant="secondary" className="!px-3 !py-1.5 text-sm" onClick={() => changeDots([], 'Cleared all dots.')} disabled={!dots.length}>Clear dots</Button>
                                    <Button variant="secondary" className="!px-3 !py-1.5 text-sm" onClick={() => setZoomIndex(z => (z + 1) % ZOOM_LEVELS.length)}>Zoom {zoom}×</Button>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 ml-auto">
                                        <input type="checkbox" checked={showRecreation} onChange={e => setShowRecreation(e.target.checked)} className="accent-orange-500" />
                                        Show recreation
                                    </label>
                                </div>
                                <div className="w-full overflow-auto max-h-[75vh] rounded-lg bg-black/30">
                                    <div ref={surfaceRef} className="relative" style={{ width: `${zoom * 100}%` }}>
                                        {imageUrl
                                            ? <img ref={imageRef} src={imageUrl} alt="Uploaded kolam" className="block w-full h-auto select-none pointer-events-none" draggable={false} />
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
                                <p className="mt-3 text-xs text-gray-500">
                                    Click to add a dot, click a dot to remove it, drag to move it. Then recreate the kolam from your corrected dots.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <Button className="!px-4 !py-2 text-sm" onClick={() => file && runAnalysis(file, dots)} disabled={!file || !edited || loading || dots.length < 4}>
                                        Recreate from my dots
                                    </Button>
                                    <Button variant="secondary" className="!px-4 !py-2 text-sm" onClick={exportOverlay} disabled={!imageUrl}>Overlay PNG</Button>
                                </div>
                            </>
                        ) : (
                            <div className="aspect-video flex items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg p-6">
                                Your kolam will appear here with its detected dots and the recreated strands on top.
                            </div>
                        )}
                    </Card>

                    <div className="space-y-8">
                        <DesignPrinciples scan={scan} imageSymmetry={meta?.symmetry ?? null} confidence={meta?.confidence ?? null} />

                        <Card>
                            <div className="flex items-center justify-between mb-4 gap-2">
                                <h3 className="text-xl font-semibold text-gray-200">Saved kolams</h3>
                                <div className="flex gap-3 text-sm">
                                    <button className="text-saffron disabled:text-gray-600" onClick={save} disabled={!scan && !dots.length}>Save</button>
                                    <button className="text-saffron disabled:text-gray-600" onClick={() => downloadKolamFile(currentFile())} disabled={!scan && !dots.length}>Export</button>
                                    <button className="text-saffron" onClick={() => jsonInputRef.current?.click()}>Import</button>
                                </div>
                            </div>
                            <input ref={jsonInputRef} type="file" accept=".json,application/json" onChange={openFile} className="hidden" />
                            <div className="space-y-2 max-h-80 overflow-auto">
                                {saved.length === 0 && <p className="text-sm text-gray-500">Saved kolams stay in this browser. Export a .kolam.json file to share one.</p>}
                                {saved.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 border border-white/10 rounded-lg p-3 bg-black/10">
                                        <div>
                                            <p className="text-sm text-white">{item.design.rows}×{item.design.cols} · {countLoops(item.design)} loop(s)</p>
                                            <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                            <button className="text-saffron" onClick={() => { clearImage(); open(item); setStatus('Opened a saved kolam.'); }}>Open</button>
                                            <button className="text-red-400" onClick={() => remove(item.id)}>Delete</button>
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
