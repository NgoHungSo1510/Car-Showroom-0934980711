import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface FBPost {
    id: string;
    message: string;
    created_time: string;
    full_picture?: string;
    synced?: boolean;
    syncedPostId?: string;
}

// Mock data - khi kết nối FB thật sẽ fetch từ API
const mockFBPosts: FBPost[] = [
    {
        id: 'fb_post_1',
        message: '🎉 KHUYẾN MÃI CUỐI NĂM!\nGiảm ngay 100 TRIỆU cho VinFast VF8!\n✅ Tặng bảo hiểm 1 năm\n✅ Hỗ trợ trả góp 0%\n#VinFast #VF8 #KhuyenMai',
        created_time: '2026-01-20T10:30:00Z',
        full_picture: 'https://via.placeholder.com/400x300?text=VF8+Promo',
        synced: false,
    },
    {
        id: 'fb_post_2',
        message: 'Đánh giá chi tiết VinFast VF5 sau 6 tháng sử dụng:\n- Chi phí vận hành cực thấp\n- Bảo hành 7 năm\n- Miễn phí sạc đến 2027\n#VinFast #VF5 #Review',
        created_time: '2026-01-18T14:20:00Z',
        full_picture: 'https://via.placeholder.com/400x300?text=VF5+Review',
        synced: true,
        syncedPostId: '65abc123def',
    },
    {
        id: 'fb_post_3',
        message: '📅 SỰ KIỆN LÁI THỬ XE VINFAST\nThời gian: 25-26/01/2026\nĐịa điểm: Showroom VinFast Đà Nẵng\nĐăng ký ngay!\n#VinFast #LaiThu #SuKien',
        created_time: '2026-01-15T09:00:00Z',
        synced: false,
    },
];

const FacebookSyncPage: React.FC = () => {
    const [posts, setPosts] = useState<FBPost[]>(mockFBPosts);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [syncing, setSyncing] = useState(false);

    // Import single post
    const importMutation = useMutation({
        mutationFn: async (post: FBPost) => {
            const response = await api.post('/webhook/facebook/import', {
                content: post.message,
                images: post.full_picture ? [post.full_picture] : [],
                autoPublish: false,
            });
            return { fbPostId: post.id, data: response.data };
        },
        onSuccess: ({ fbPostId, data }) => {
            setPosts(prev => prev.map(p =>
                p.id === fbPostId
                    ? { ...p, synced: true, syncedPostId: data.data.post._id }
                    : p
            ));
            toast.success(`Đã đồng bộ: ${data.data.post.title.substring(0, 30)}...`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Lỗi đồng bộ');
        },
    });

    const handleSelectAll = () => {
        const unsyncedIds = posts.filter(p => !p.synced).map(p => p.id);
        if (selectedIds.size === unsyncedIds.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(unsyncedIds));
        }
    };

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSyncSelected = async () => {
        if (selectedIds.size === 0) {
            toast.error('Vui lòng chọn ít nhất 1 bài');
            return;
        }

        setSyncing(true);
        const selectedPosts = posts.filter(p => selectedIds.has(p.id));

        for (const post of selectedPosts) {
            await importMutation.mutateAsync(post);
        }

        setSelectedIds(new Set());
        setSyncing(false);
        toast.success(`Đã đồng bộ ${selectedPosts.length} bài!`);
    };

    const handleSyncSingle = (post: FBPost) => {
        importMutation.mutate(post);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const unsyncedCount = posts.filter(p => !p.synced).length;

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">🔄 Đồng bộ Facebook</h2>
                    <p className="text-slate-400 mt-1">
                        Xem và đồng bộ các bài đăng từ Facebook Page
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/ai-config"
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        ⚙️ Cấu hình AI
                    </Link>
                </div>
            </div>

            {/* Connection Status */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="text-amber-400 font-bold">Chưa kết nối Facebook</p>
                        <p className="text-slate-400 text-sm">
                            Đang hiển thị dữ liệu mẫu. Để kết nối thật, cần deploy backend lên server HTTPS và cấu hình Facebook App.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-card-dark border border-border-dark rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === unsyncedCount && unsyncedCount > 0}
                                onChange={handleSelectAll}
                                className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                            />
                            <span className="text-white">Chọn tất cả ({unsyncedCount} chưa đồng bộ)</span>
                        </label>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">
                            Đã chọn: {selectedIds.size}
                        </span>
                        <button
                            onClick={handleSyncSelected}
                            disabled={syncing || selectedIds.size === 0}
                            className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {syncing ? '🔄 Đang đồng bộ...' : `📥 Đồng bộ (${selectedIds.size})`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={`bg-card-dark border rounded-2xl p-5 transition-all ${post.synced
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-border-dark hover:border-primary/50'
                            }`}
                    >
                        <div className="flex gap-4">
                            {/* Checkbox */}
                            {!post.synced && (
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(post.id)}
                                        onChange={() => handleToggleSelect(post.id)}
                                        className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                                    />
                                </div>
                            )}

                            {/* Image */}
                            {post.full_picture && (
                                <div className="shrink-0">
                                    <img
                                        src={post.full_picture}
                                        alt=""
                                        className="w-24 h-24 object-cover rounded-xl"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-white text-sm whitespace-pre-wrap line-clamp-3">
                                            {post.message}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-2">
                                            📅 {formatDate(post.created_time)}
                                        </p>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="shrink-0 text-right">
                                        {post.synced ? (
                                            <div>
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                                                    ✅ Đã đồng bộ
                                                </span>
                                                <a
                                                    href={`/posts/${post.syncedPostId}`}
                                                    className="block mt-2 text-primary text-xs hover:underline"
                                                >
                                                    Xem bài →
                                                </a>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSyncSingle(post)}
                                                disabled={importMutation.isPending}
                                                className="px-3 py-1 bg-primary hover:bg-accent-blue text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                📥 Đồng bộ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="text-slate-400">Chưa có bài đăng nào từ Facebook</p>
                    </div>
                )}
            </div>

            {/* Help */}
            <div className="mt-8 bg-slate-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-3">📚 Hướng dẫn kết nối Facebook</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
                    <li>Deploy backend lên server có HTTPS (Railway, Render...)</li>
                    <li>Tạo Facebook App tại <a href="https://developers.facebook.com" target="_blank" className="text-primary hover:underline">developers.facebook.com</a></li>
                    <li>Cấu hình Webhooks với URL: <code className="bg-slate-700 px-2 py-0.5 rounded">https://your-domain.com/api/webhook/facebook</code></li>
                    <li>Lấy Page Access Token và thêm vào .env</li>
                    <li>Subscribe webhook vào feed của Page</li>
                </ol>
            </div>
        </div>
    );
};

export default FacebookSyncPage;
