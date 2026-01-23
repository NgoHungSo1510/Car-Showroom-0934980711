import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Default AI configuration
const defaultConfig = {
    promotionKeywords: {
        strong: ['khuyến mãi', 'khuyến mại', 'giảm giá', 'sale', 'giảm ngay'],
        weak: ['ưu đãi đặc biệt', 'ưu đãi lớn', 'tặng quà', 'quà tặng', 'giá sốc', 'giá tốt nhất', 'tiết kiệm', 'miễn phí 100%'],
    },
    eventKeywords: ['sự kiện', 'lái thử', 'triển lãm', 'khai trương', 'ra mắt'],
    reviewKeywords: ['đánh giá', 'review', 'trải nghiệm', 'so sánh', 'thử nghiệm', 'cảm nhận'],
    autoPublish: {
        enabled: false,
        minConfidence: 0.8,
    },
};

interface ClassificationResult {
    category: string;
    title: string;
    excerpt: string;
    relatedCarName?: string;
    confidence: number;
    tags: string[];
    eventStartDate?: string;
    eventEndDate?: string;
    discountAmount?: number;
    discountPercent?: number;
    discountDescription?: string;
    contentBlocks?: Array<{ type: string; content?: string }>;
}

const AIConfigPage: React.FC = () => {
    const [config, setConfig] = useState(defaultConfig);
    const [testContent, setTestContent] = useState('');
    const [testResult, setTestResult] = useState<ClassificationResult | null>(null);
    const [newKeyword, setNewKeyword] = useState('');
    const [activeTab, setActiveTab] = useState<'promotion' | 'event' | 'review' | 'settings'>('promotion');

    const testMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await api.post('/webhook/facebook/test-ai', { content });
            return response.data;
        },
        onSuccess: (data) => {
            setTestResult(data.data);
            toast.success('Đã phân loại xong!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Lỗi phân loại');
        },
    });

    const handleTest = () => {
        if (!testContent.trim()) {
            toast.error('Vui lòng nhập nội dung test');
            return;
        }
        testMutation.mutate(testContent);
    };

    const addKeyword = (category: 'promotionStrong' | 'promotionWeak' | 'event' | 'review') => {
        if (!newKeyword.trim()) return;

        if (category === 'promotionStrong') {
            setConfig({
                ...config,
                promotionKeywords: {
                    ...config.promotionKeywords,
                    strong: [...config.promotionKeywords.strong, newKeyword.trim().toLowerCase()],
                },
            });
        } else if (category === 'promotionWeak') {
            setConfig({
                ...config,
                promotionKeywords: {
                    ...config.promotionKeywords,
                    weak: [...config.promotionKeywords.weak, newKeyword.trim().toLowerCase()],
                },
            });
        } else if (category === 'event') {
            setConfig({
                ...config,
                eventKeywords: [...config.eventKeywords, newKeyword.trim().toLowerCase()],
            });
        } else if (category === 'review') {
            setConfig({
                ...config,
                reviewKeywords: [...config.reviewKeywords, newKeyword.trim().toLowerCase()],
            });
        }
        setNewKeyword('');
        toast.success('Đã thêm từ khóa');
    };

    const removeKeyword = (category: 'promotionStrong' | 'promotionWeak' | 'event' | 'review', keyword: string) => {
        if (category === 'promotionStrong') {
            setConfig({
                ...config,
                promotionKeywords: {
                    ...config.promotionKeywords,
                    strong: config.promotionKeywords.strong.filter(k => k !== keyword),
                },
            });
        } else if (category === 'promotionWeak') {
            setConfig({
                ...config,
                promotionKeywords: {
                    ...config.promotionKeywords,
                    weak: config.promotionKeywords.weak.filter(k => k !== keyword),
                },
            });
        } else if (category === 'event') {
            setConfig({
                ...config,
                eventKeywords: config.eventKeywords.filter(k => k !== keyword),
            });
        } else if (category === 'review') {
            setConfig({
                ...config,
                reviewKeywords: config.reviewKeywords.filter(k => k !== keyword),
            });
        }
    };

    const categoryColors: Record<string, string> = {
        news: 'bg-blue-500',
        review: 'bg-purple-500',
        promotion: 'bg-emerald-500',
        event: 'bg-amber-500',
    };

    const categoryLabels: Record<string, string> = {
        news: '📰 Tin tức',
        review: '⭐ Đánh giá',
        promotion: '🏷️ Khuyến mãi',
        event: '📅 Sự kiện',
    };

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">⚙️ Cấu hình AI</h2>
                    <p className="text-slate-400 mt-1">
                        Quản lý từ khóa phân loại và cài đặt AI
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/ai-test"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        🧪 Test phân loại
                    </Link>
                    <Link
                        to="/facebook-sync"
                        className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        🔄 Đồng bộ FB
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Config Tabs */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 bg-card-dark rounded-xl p-2">
                        {[
                            { key: 'promotion', label: '🏷️ Khuyến mãi' },
                            { key: 'event', label: '📅 Sự kiện' },
                            { key: 'review', label: '⭐ Đánh giá' },
                            { key: 'settings', label: '⚙️ Cài đặt' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Promotion Keywords */}
                    {activeTab === 'promotion' && (
                        <div className="bg-card-dark border border-border-dark rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-emerald-400 mb-2">Từ khóa MẠNH (1 từ = promotion)</h3>
                                <p className="text-xs text-slate-500 mb-3">Chỉ cần 1 từ khóa này xuất hiện → category = promotion</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {config.promotionKeywords.strong.map((kw) => (
                                        <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                                            {kw}
                                            <button onClick={() => removeKeyword('promotionStrong', kw)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                                        placeholder="Thêm từ khóa..."
                                        onKeyDown={(e) => e.key === 'Enter' && addKeyword('promotionStrong')}
                                    />
                                    <button onClick={() => addKeyword('promotionStrong')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">Thêm</button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-yellow-400 mb-2">Từ khóa YẾU (cần 2+ từ = promotion)</h3>
                                <p className="text-xs text-slate-500 mb-3">Cần ít nhất 2 từ khóa này → category = promotion</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {config.promotionKeywords.weak.map((kw) => (
                                        <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                            {kw}
                                            <button onClick={() => removeKeyword('promotionWeak', kw)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                                        placeholder="Thêm từ khóa..."
                                        onKeyDown={(e) => e.key === 'Enter' && addKeyword('promotionWeak')}
                                    />
                                    <button onClick={() => addKeyword('promotionWeak')} className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm">Thêm</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Keywords */}
                    {activeTab === 'event' && (
                        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-amber-400 mb-2">Từ khóa sự kiện</h3>
                            <p className="text-xs text-slate-500 mb-3">Cần từ khóa này + có ngày cụ thể → category = event</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {config.eventKeywords.map((kw) => (
                                    <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                                        {kw}
                                        <button onClick={() => removeKeyword('event', kw)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                                    placeholder="Thêm từ khóa..."
                                    onKeyDown={(e) => e.key === 'Enter' && addKeyword('event')}
                                />
                                <button onClick={() => addKeyword('event')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">Thêm</button>
                            </div>
                        </div>
                    )}

                    {/* Review Keywords */}
                    {activeTab === 'review' && (
                        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-purple-400 mb-2">Từ khóa đánh giá</h3>
                            <p className="text-xs text-slate-500 mb-3">Có từ khóa này → category = review</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {config.reviewKeywords.map((kw) => (
                                    <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                        {kw}
                                        <button onClick={() => removeKeyword('review', kw)} className="ml-1 text-red-400 hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    className="flex-1 bg-background-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm"
                                    placeholder="Thêm từ khóa..."
                                    onKeyDown={(e) => e.key === 'Enter' && addKeyword('review')}
                                />
                                <button onClick={() => addKeyword('review')} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm">Thêm</button>
                            </div>
                        </div>
                    )}

                    {/* Settings */}
                    {activeTab === 'settings' && (
                        <div className="bg-card-dark border border-border-dark rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold mb-4">🔄 Tự động đăng bài (Auto-Publish)</h3>
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={config.autoPublish.enabled}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            autoPublish: { ...config.autoPublish, enabled: e.target.checked }
                                        })}
                                        className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                                    />
                                    <span className="text-white">Tự động công khai bài từ Facebook webhook</span>
                                </label>

                                {config.autoPublish.enabled && (
                                    <div className="ml-8 p-4 bg-background-dark rounded-xl">
                                        <label className="block text-sm text-slate-300 mb-2">
                                            Độ tin cậy tối thiểu (confidence)
                                        </label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="1"
                                            step="0.05"
                                            value={config.autoPublish.minConfidence}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                autoPublish: { ...config.autoPublish, minConfidence: parseFloat(e.target.value) }
                                            })}
                                            className="w-full"
                                        />
                                        <div className="text-center text-primary font-bold mt-2">
                                            {Math.round(config.autoPublish.minConfidence * 100)}%
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Chỉ tự động đăng nếu AI confidence ≥ {Math.round(config.autoPublish.minConfidence * 100)}%
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border-dark pt-6">
                                <button className="w-full py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all">
                                    💾 Lưu cấu hình
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-2">
                                    * Tính năng lưu vào database sẽ được thêm sau
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Test Area */}
                <div className="space-y-4">
                    <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">🧪 Test phân loại</h3>
                        <textarea
                            value={testContent}
                            onChange={(e) => setTestContent(e.target.value)}
                            rows={6}
                            className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white text-sm resize-none"
                            placeholder="Nhập nội dung để test AI phân loại..."
                        />
                        <button
                            onClick={handleTest}
                            disabled={testMutation.isPending || !testContent.trim()}
                            className="w-full mt-4 py-3 bg-primary hover:bg-accent-blue text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {testMutation.isPending ? '🔄 Đang phân tích...' : '🧪 Test AI'}
                        </button>
                    </div>

                    {testResult && (
                        <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4">📊 Kết quả</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Category:</span>
                                    <span className={`px-3 py-1 ${categoryColors[testResult.category]} text-white text-sm font-bold rounded-full`}>
                                        {categoryLabels[testResult.category]}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Confidence:</span>
                                    <span className="text-white font-bold">{Math.round(testResult.confidence * 100)}%</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-sm">Tiêu đề:</span>
                                    <p className="text-white text-sm mt-1">{testResult.title}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-sm">Tags:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {testResult.tags?.map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIConfigPage;
