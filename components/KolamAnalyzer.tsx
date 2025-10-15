
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';

// Mock analysis results
const mockAnalysis = {
    dotGrid: `<circle cx="25" cy="25" r="2" fill="white"/><circle cx="50" cy="25" r="2" fill="white"/><circle cx="75" cy="25" r="2" fill="white"/><circle cx="25" cy="50" r="2" fill="white"/><circle cx="50" cy="50" r="2" fill="white"/><circle cx="75" cy="50" r="2" fill="white"/><circle cx="25" cy="75" r="2" fill="white"/><circle cx="50" cy="75" r="2" fill="white"/><circle cx="75" cy="75" r="2" fill="white"/>`,
    loopTrace: `<path d="M25 25 C 50 0, 100 50, 75 75 S 0 50, 25 25" stroke="cyan" stroke-width="1.5" fill="none" class="kolam-path" style="animation-duration: 5s;" />`,
    symmetry: `<line x1="50" y1="0" x2="50" y2="100" stroke="magenta" stroke-width="1" stroke-dasharray="4"/><path d="M25 25 L50 50 L25 75" stroke="lime" stroke-width="1.5" fill="none" /><path d="M75 25 L50 50 L75 75" stroke="lime" stroke-width="1.5" fill="none" opacity="0.5" />`,
    regeneratedSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 C 75 15, 75 40, 75 40 L 75 60 C 75 85, 50 85, 50 85 S 25 85, 25 60 L 25 40 C 25 15, 50 15, 50 15 Z" stroke="#FFD700" stroke-width="2" fill="none" /><path d="M50 15 C 65 25, 65 40, 65 40 L 65 60 C 65 75, 50 75, 50 75 S 35 75, 35 60 L 35 40 C 35 25, 50 15, 50 15 Z" stroke="#FF9933" stroke-width="1.5" fill="none" /></svg>`,
};

type AnalysisResult = typeof mockAnalysis | null;
type AnalysisStep = 'dotGrid' | 'loopTrace' | 'symmetry' | 'regeneratedSvg';


const KolamAnalyzer: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB.');
                return;
            }
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                setError('Only PNG and JPEG files are allowed.');
                return;
            }
            setError(null);
            setAnalysisResult(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const analyzeImage = useCallback(() => {
        if (!image) return;
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setAnalysisResult(mockAnalysis);
            setIsLoading(false);
        }, 3000);
    }, [image]);

    const downloadSVG = useCallback(() => {
        if (analysisResult?.regeneratedSvg) {
            const blob = new Blob([analysisResult.regeneratedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'regenerated-kolam.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, [analysisResult]);
    
    const analysisSteps = useMemo(() => [
        { key: 'dotGrid' as AnalysisStep, title: 'Dot Grid Detection' },
        { key: 'loopTrace' as AnalysisStep, title: 'Loop Tracing' },
        { key: 'symmetry' as AnalysisStep, title: 'Symmetry Visualization' },
    ], []);

    return (
        <section className="py-20 px-4 container mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Kolam Analyzer</h2>
            <div className="max-w-2xl mx-auto">
                <Card>
                    <div className="flex flex-col items-center space-y-4">
                        <Label htmlFor="kolam-upload" className="text-xl">Upload a Kolam Image (PNG/JPEG)</Label>
                        <input id="kolam-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 cursor-pointer"/>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                </Card>

                {image && (
                    <div className="mt-8 text-center space-y-6">
                        <h3 className="text-2xl font-semibold">Image Preview</h3>
                        <img src={image} alt="Kolam preview" className="max-w-sm w-full mx-auto rounded-lg shadow-lg shadow-indigo-900/20"/>
                        <Button onClick={analyzeImage} disabled={isLoading}>
                            {isLoading ? 'Analyzing...' : 'Analyze Kolam'}
                        </Button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="text-center mt-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-lg">AI is working its magic... Please wait.</p>
                </div>
            )}

            {analysisResult && (
                <div className="mt-16">
                    <h3 className="text-3xl font-heading text-center mb-8">Analysis Results</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {analysisSteps.map(step => (
                           <Card key={step.key}>
                                <h4 className="text-xl font-bold text-center mb-4 text-orange-400">{step.title}</h4>
                                <div className="aspect-square bg-indigo-900/20 rounded-lg p-4">
                                    <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: analysisResult[step.key] || '' }} />
                                </div>
                            </Card>
                        ))}
                    </div>
                     <div className="mt-12 max-w-lg mx-auto">
                        <Card>
                            <h4 className="text-2xl font-bold text-center mb-4 text-green-400">Regenerated Kolam (SVG)</h4>
                            <div className="aspect-square bg-indigo-900/20 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: analysisResult.regeneratedSvg }} />
                            <div className="text-center mt-6">
                                <Button onClick={downloadSVG}>Download SVG</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </section>
    );
};

export default KolamAnalyzer;
