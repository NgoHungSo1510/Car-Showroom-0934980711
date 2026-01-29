import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  facebookAPI,
  FacebookSyncStatus,
  FacebookPost,
  SyncedPost,
  settingsAPI,
} from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FacebookSyncPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'unsynced' | 'synced' | 'settings'>('unsynced');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [autoPublish, setAutoPublish] = useState(false);

  // Config state
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  // Load existing settings
  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await settingsAPI.getAll();
      return response.data;
    },
  });

  // Populate form when settings load
  React.useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data;
      const fbToken = settings.find((s: any) => s.key === 'facebook_access_token')?.value;
      const fbPageId = settings.find((s: any) => s.key === 'facebook_page_id')?.value;

      if (fbToken) setAccessToken(fbToken);
      if (fbPageId) setPageId(fbPageId);
    }
  }, [settingsData]);

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (data: { token: string; pageId?: string }) => {
      await settingsAPI.update(
        'facebook_access_token',
        data.token,
        'Facebook Page Access Token',
        'social',
      );
      if (data.pageId) {
        await settingsAPI.update('facebook_page_id', data.pageId, 'Facebook Page ID', 'social');
      }
    },
    onSuccess: () => {
      toast.success('Đã lưu cấu hình thành công');
      setShowConfig(false);
      queryClient.invalidateQueries({ queryKey: ['facebook-sync-status'] });
    },
    onError: () => toast.error('Lỗi lưu cấu hình'),
  });

  const handleSaveConfig = () => {
    if (!accessToken.trim()) {
      toast.error('Vui lòng nhập Access Token');
      return;
    }
    updateConfigMutation.mutate({ token: accessToken, pageId });
  };

  // Auto sync settings
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(30);
  const [autoSyncAutoPublish, setAutoSyncAutoPublish] = useState(false);

  // Fetch sync status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['facebook-sync-status'],
    queryFn: async () => {
      const response = await facebookAPI.getStatus();
      const data = response.data.data;
      // Initialize auto sync settings from server
      if (data.autoSync) {
        setAutoSyncEnabled(data.autoSync.enabled);
        setAutoSyncInterval(data.autoSync.intervalMinutes);
        setAutoSyncAutoPublish(data.autoSync.autoPublish);
      }
      return data;
    },
    retry: false,
  });

  // Fetch Facebook posts
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['facebook-posts'],
    queryFn: async () => {
      const response = await facebookAPI.getPosts(50);
      return response.data.data;
    },
    enabled: statusData?.connectionStatus === 'connected',
    retry: false,
  });

  // Fetch synced posts
  const { data: syncedData, isLoading: syncedLoading } = useQuery({
    queryKey: ['synced-posts'],
    queryFn: async () => {
      const response = await facebookAPI.getSyncedPosts(1, 50);
      return response.data.data;
    },
    enabled: activeTab === 'synced',
  });

  // Sync single post mutation
  const syncSingleMutation = useMutation({
    mutationFn: (post: FacebookPost) =>
      facebookAPI.syncSingle(post.id, post.message || '', post.images, autoPublish),
    onSuccess: (response) => {
      toast.success(response.data.message);
      refetchPosts();
      queryClient.invalidateQueries({ queryKey: ['synced-posts'] });
      queryClient.invalidateQueries({ queryKey: ['facebook-sync-status'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Lỗi đồng bộ');
    },
  });

  // Sync multiple posts mutation
  const syncMultipleMutation = useMutation({
    mutationFn: (posts: FacebookPost[]) =>
      facebookAPI.syncMultiple(
        posts.map((p) => ({
          id: p.id,
          message: p.message || '',
          images: p.images,
          full_picture: p.full_picture,
        })),
        autoPublish,
      ),
    onSuccess: (response) => {
      toast.success(response.data.message);
      setSelectedIds(new Set());
      refetchPosts();
      queryClient.invalidateQueries({ queryKey: ['synced-posts'] });
      queryClient.invalidateQueries({ queryKey: ['facebook-sync-status'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Lỗi đồng bộ');
    },
  });

  // Auto sync mutation
  const autoSyncMutation = useMutation({
    mutationFn: () =>
      facebookAPI.setAutoSync(autoSyncEnabled, autoSyncInterval, autoSyncAutoPublish),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['facebook-sync-status'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Lỗi cài đặt');
    },
  });

  const handleSyncAll = () => {
    if (unsyncedPosts.length === 0) {
      toast.error('Không có bài nào để đồng bộ');
      return;
    }
    syncMultipleMutation.mutate(unsyncedPosts);
  };

  const status = statusData as FacebookSyncStatus | undefined;
  const unsyncedPosts = postsData?.posts?.filter((p) => !p.synced) || [];

  const handleSelectAll = () => {
    if (selectedIds.size === unsyncedPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unsyncedPosts.map((p) => p.id)));
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

  const handleSyncSelected = () => {
    const selectedPosts = unsyncedPosts.filter((p) => selectedIds.has(p.id));
    if (selectedPosts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 bài');
      return;
    }
    syncMultipleMutation.mutate(selectedPosts);
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

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🔄 Đồng bộ Facebook</h2>
          <p className="text-slate-400 mt-1">Quản lý và đồng bộ bài viết từ Facebook Page</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors"
          >
            ⚙️ Cấu hình Token
          </button>
          <a
            href="https://developers.facebook.com/tools/explorer/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-colors"
          >
            🔑 Lấy Token
          </a>
          <button
            onClick={() => refetchPosts()}
            disabled={postsLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      {(showConfig || status?.connectionStatus === 'error' || status?.connectionStatus === 'not_configured') && (
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            🔑 Cấu hình kết nối
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-normal text-primary hover:underline flex items-center gap-1 ml-auto sm:ml-2"
            >
              Lấy Token từ Graph API Explorer <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Facebook Page Access Token <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAG..."
                className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-xl text-white focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Page ID (Tùy chọn)
              </label>
              <input
                type="text"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="me"
                className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-xl text-white focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-slate-500 mt-1">Để trống nếu Token đã thuộc về Page</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={updateConfigMutation.isPending}
              className="px-6 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {updateConfigMutation.isPending ? '⏳ Đang lưu...' : '💾 Lưu cấu hình'}
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {statusLoading ? (
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-slate-400">Đang kiểm tra kết nối...</span>
          </div>
        </div>
      ) : status?.connectionStatus === 'connected' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            {status.pageInfo?.picture?.data?.url && (
              <img
                src={status.pageInfo.picture.data.url}
                alt={status.pageInfo.name}
                className="w-14 h-14 rounded-full border-2 border-emerald-500"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-lg">{status.pageInfo?.name}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                  ✅ Đã kết nối
                </span>
                {status.autoSync?.enabled && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                    🔄 Auto-sync: {status.autoSync.intervalMinutes}p
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {status.pageInfo?.fan_count?.toLocaleString()} người theo dõi
                {' • '}
                {status.syncedPostsCount} bài đã đồng bộ
              </p>
            </div>
          </div>
        </div>
      ) : status?.connectionStatus === 'error' ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-red-400 font-bold">Lỗi kết nối Facebook</p>
              <p className="text-slate-400 text-sm">
                Access Token có thể đã hết hạn hoặc không hợp lệ. Vui lòng cập nhật Token ở trên.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-400 font-bold">Chưa cấu hình Facebook</p>
              <p className="text-slate-400 text-sm">
                Vui lòng nhập Facebook Page Access Token ở trên để bắt đầu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Only show content if connected */}
      {status?.connectionStatus === 'connected' && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('unsynced')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'unsynced'
                ? 'bg-primary text-white'
                : 'bg-card-dark text-slate-400 hover:text-white'
                }`}
            >
              📥 Chưa đồng bộ ({postsData?.unsynced || 0})
            </button>
            <button
              onClick={() => setActiveTab('synced')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'synced'
                ? 'bg-primary text-white'
                : 'bg-card-dark text-slate-400 hover:text-white'
                }`}
            >
              ✅ Đã đồng bộ ({status?.syncedPostsCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'bg-card-dark text-slate-400 hover:text-white'
                }`}
            >
              ⚙️ Cài đặt
            </button>
          </div>

          {/* Tab: Unsynced Posts */}
          {activeTab === 'unsynced' && (
            <>
              {/* Actions Bar */}
              <div className="bg-card-dark border border-border-dark rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === unsyncedPosts.length && unsyncedPosts.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                      />
                      <span className="text-white">Chọn tất cả</span>
                    </label>
                    <span className="text-slate-500">|</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPublish}
                        onChange={(e) => setAutoPublish(e.target.checked)}
                        className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                      />
                      <span className="text-slate-400">Tự động xuất bản</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">Đã chọn: {selectedIds.size}</span>
                    <button
                      onClick={handleSyncSelected}
                      disabled={syncMultipleMutation.isPending || selectedIds.size === 0}
                      className="px-4 py-2 bg-primary hover:bg-accent-blue text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {syncMultipleMutation.isPending
                        ? '🔄 Đang xử lý...'
                        : `📥 Đồng bộ (${selectedIds.size})`}
                    </button>
                    <button
                      onClick={handleSyncAll}
                      disabled={syncMultipleMutation.isPending || unsyncedPosts.length === 0}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      🚀 Đồng bộ tất cả ({unsyncedPosts.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              {postsLoading ? (
                <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-slate-400">Đang tải bài viết từ Facebook...</p>
                </div>
              ) : unsyncedPosts.length === 0 ? (
                <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="text-white font-bold">Tất cả bài viết đã được đồng bộ!</p>
                  <p className="text-slate-400 text-sm mt-1">Không có bài viết mới từ Facebook</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unsyncedPosts.map((post) => (
                    <div
                      key={post.id}
                      className={`bg-card-dark border rounded-2xl p-5 transition-all ${selectedIds.has(post.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border-dark hover:border-primary/50'
                        }`}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post.id)}
                            onChange={() => handleToggleSelect(post.id)}
                            className="rounded border-border-dark bg-background-dark text-primary focus:ring-primary w-5 h-5"
                          />
                        </div>

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
                                {post.message || '(Không có nội dung)'}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-slate-500 text-xs">
                                  📅 {formatDate(post.created_time)}
                                </span>
                                {post.images.length > 1 && (
                                  <span className="text-slate-500 text-xs">
                                    🖼️ {post.images.length} ảnh
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0">
                              <button
                                onClick={() => syncSingleMutation.mutate(post)}
                                disabled={syncSingleMutation.isPending}
                                className="px-3 py-1.5 bg-primary hover:bg-accent-blue text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                              >
                                📥 Đồng bộ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: Synced Posts */}
          {activeTab === 'synced' && (
            <div>
              {syncedLoading ? (
                <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-slate-400">Đang tải...</p>
                </div>
              ) : !syncedData?.posts?.length ? (
                <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-400">Chưa có bài viết nào được đồng bộ</p>
                </div>
              ) : (
                <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-border-dark">
                        <th className="text-left py-4 px-4">Bài viết</th>
                        <th className="text-center py-4 px-2">Danh mục</th>
                        <th className="text-center py-4 px-2">Trạng thái</th>
                        <th className="text-center py-4 px-2">Ngày tạo</th>
                        <th className="text-center py-4 px-2">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncedData.posts.map((post: SyncedPost) => (
                        <tr
                          key={post._id}
                          className="border-b border-border-dark/50 hover:bg-background-dark/50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="text-white font-medium line-clamp-1">{post.title}</p>
                                {post.excerpt && (
                                  <p className="text-slate-500 text-xs line-clamp-1">
                                    {post.excerpt}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded ${post.category === 'news'
                                ? 'bg-blue-500/20 text-blue-400'
                                : post.category === 'promotion'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : post.category === 'event'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                            >
                              {post.category === 'news'
                                ? 'Tin tức'
                                : post.category === 'promotion'
                                  ? 'Khuyến mãi'
                                  : post.category === 'event'
                                    ? 'Sự kiện'
                                    : 'Review'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded ${post.status === 'published'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-500/20 text-slate-400'
                                }`}
                            >
                              {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center text-slate-400">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <Link
                              to={`/posts/${post._id}`}
                              className="text-primary text-sm hover:underline"
                            >
                              Chỉnh sửa
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-6">⚙️ Cài đặt tự động đồng bộ</h3>

              <div className="space-y-6">
                {/* Enable Auto Sync */}
                <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl">
                  <div>
                    <p className="text-white font-medium">Tự động đồng bộ</p>
                    <p className="text-slate-400 text-sm">
                      Hệ thống sẽ tự động đồng bộ bài viết mới từ Facebook
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncEnabled}
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-600 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                {/* Interval */}
                <div className="p-4 bg-background-dark rounded-xl">
                  <label className="block text-white font-medium mb-2">Tần suất đồng bộ</label>
                  <select
                    value={autoSyncInterval}
                    onChange={(e) => setAutoSyncInterval(Number(e.target.value))}
                    disabled={!autoSyncEnabled}
                    className="w-full px-4 py-3 bg-card-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value={15}>Mỗi 15 phút</option>
                    <option value={30}>Mỗi 30 phút</option>
                    <option value={60}>Mỗi 1 giờ</option>
                    <option value={120}>Mỗi 2 giờ</option>
                    <option value={360}>Mỗi 6 giờ</option>
                    <option value={720}>Mỗi 12 giờ</option>
                    <option value={1440}>Mỗi 24 giờ</option>
                  </select>
                </div>

                {/* Auto Publish */}
                <div className="flex items-center justify-between p-4 bg-background-dark rounded-xl">
                  <div>
                    <p className="text-white font-medium">Tự động xuất bản</p>
                    <p className="text-slate-400 text-sm">
                      Bài viết mới sẽ được xuất bản ngay sau khi đồng bộ
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncAutoPublish}
                      onChange={(e) => setAutoSyncAutoPublish(e.target.checked)}
                      disabled={!autoSyncEnabled}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-slate-600 rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                {/* Last Sync Info */}
                {status?.autoSync?.lastSync && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-400 text-sm">
                      🕐 Lần đồng bộ cuối: {formatDate(status.autoSync.lastSync)}
                    </p>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={() => autoSyncMutation.mutate()}
                  disabled={autoSyncMutation.isPending}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent-blue hover:from-accent-blue hover:to-primary text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {autoSyncMutation.isPending ? '🔄 Đang lưu...' : '💾 Lưu cài đặt'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Help */}
      <div className="mt-8 bg-slate-800/50 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-3">📚 Hướng dẫn</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            • <strong>Chưa đồng bộ:</strong> Hiển thị các bài viết từ Facebook chưa được đồng bộ vào
            hệ thống
          </li>
          <li>
            • <strong>Đã đồng bộ:</strong> Danh sách các bài viết đã được đồng bộ, có thể chỉnh sửa
          </li>
          <li>
            • <strong>Cài đặt:</strong> Bật/tắt tự động đồng bộ để hệ thống tự động lấy bài mới
          </li>
          <li>
            • AI sẽ tự động phân loại bài viết thành: <span className="text-blue-400">tin tức</span>
            , <span className="text-amber-400">review</span>,{' '}
            <span className="text-rose-400">khuyến mãi</span>, hoặc{' '}
            <span className="text-purple-400">sự kiện</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookSyncPage;
