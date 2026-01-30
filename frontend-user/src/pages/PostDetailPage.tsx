import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsAPI, ContentBlock } from '../services/api';
import { isPostBookmarked, togglePostBookmark } from '../utils/bookmarks';
import ZaloButton from '../components/ZaloButton';

const categoryLabels: Record<string, string> = {
  news: 'Tin tức',
  review: 'Đánh giá',
  promotion: 'Khuyến mãi',
  event: 'Sự kiện',
};

// Helper to extract YouTube video ID
const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/,
  );
  return match ? match[1] : null;
};

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const {
    data: postData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await postsAPI.getBySlug(slug!);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const post = postData;

  // Check bookmark status when post loads
  useEffect(() => {
    if (post?._id) {
      setIsBookmarked(isPostBookmarked(post._id));
    }
  }, [post?._id]);

  const handleToggleBookmark = () => {
    if (post?._id) {
      const newState = togglePostBookmark(post._id);
      setIsBookmarked(newState);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(2)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  // Check if event is expired
  const isEventExpired = () => {
    if (post?.category !== 'event' || !post.eventEndDate) return false;
    return new Date(post.eventEndDate) < new Date();
  };

  // Render a single content block
  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            key={index}
            className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap"
          >
            {block.content}
          </div>
        );

      case 'image':
        return (
          <figure key={index} className="my-8">
            <img src={block.url} alt={block.caption || ''} className="w-full rounded-xl" />
            {block.caption && (
              <figcaption className="text-center text-sm text-text-secondary mt-3 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'video': {
        const youtubeId = block.url ? getYouTubeId(block.url) : null;
        return (
          <figure key={index} className="my-8">
            {youtubeId ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={block.caption || 'Video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={block.url} controls className="w-full rounded-xl" />
            )}
            {block.caption && (
              <figcaption className="text-center text-sm text-text-secondary mt-3 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      case 'car':
        if (!block.car) return null;
        return (
          <div key={index} className="my-8">
            <Link
              to={`/cars/${block.car.slug}`}
              className="flex items-center gap-4 p-4 glass border border-border rounded-2xl hover:border-primary transition-colors group"
            >
              {block.car.thumbnail && (
                <img
                  src={block.car.thumbnail}
                  alt={block.car.name}
                  className="w-32 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                {block.description && (
                  <p className="text-xs text-primary font-bold mb-1">{block.description}</p>
                )}
                <p className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                  {block.car.name}
                </p>
                {block.car.price && (
                  <p className="text-sm text-text-secondary">Từ {formatPrice(block.car.price)}</p>
                )}
              </div>
              <span className="btn-primary py-2 px-4 text-sm">Xem 3D ngay →</span>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Không tìm thấy bài viết</h1>
        <Link to="/posts" className="btn-primary">
          Quay lại Tin tức
        </Link>
      </div>
    );
  }

  const hasContentBlocks = post.contentBlocks && post.contentBlocks.length > 0;

  return (
    <article className="pt-24 pb-16">
      {/* Back Button + Actions */}
      <div className="container mx-auto px-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </button>

        {/* Bookmark & Views */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {post.viewCount?.toLocaleString()}
          </span>
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1 text-sm transition-colors ${isBookmarked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
          >
            <svg
              className="size-5"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {isBookmarked ? 'Đã lưu' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Expired Event Warning */}
        {isEventExpired() && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 font-bold">Sự kiện đã kết thúc</p>
              <p className="text-red-400/70 text-sm">
                Sự kiện này đã kết thúc vào ngày {formatDate(post.eventEndDate)}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="max-w-4xl mx-auto mb-8">
          {/* Category & Event/Promotion Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded">
              {categoryLabels[post.category] || post.category}
            </span>

            {/* Event date badge */}
            {post.category === 'event' && post.eventEndDate && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${isEventExpired() ? 'bg-gray-500/10 text-gray-400' : 'bg-amber-500/10 text-amber-400'}`}
              >
                📅 {formatDate(post.eventStartDate)} - {formatDate(post.eventEndDate)}
              </span>
            )}

            {/* Promotion badge */}
            {post.category === 'promotion' && (post.discountAmount || post.discountPercent) && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded">
                {post.discountAmount && `💰 Giảm ${formatPrice(post.discountAmount)}`}
                {post.discountPercent && `🏷️ Giảm ${post.discountPercent}%`}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-text-primary mb-6">
            {post.title}
          </h1>

          {/* Meta - Date only */}
          <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm">
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-5xl mx-auto mb-10 rounded-2xl overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        {/* Related Car CTA (for review/news) */}
        {post.relatedCar && (
          <div className="max-w-4xl mx-auto mb-10">
            <Link
              to={`/cars/${post.relatedCar.slug}`}
              className="flex items-center gap-4 p-4 glass border border-border rounded-2xl hover:border-primary transition-colors group"
            >
              {post.relatedCar.thumbnail && (
                <img
                  src={post.relatedCar.thumbnail}
                  alt={post.relatedCar.name}
                  className="w-24 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-1">Xe được nhắc đến trong bài</p>
                <p className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                  {post.relatedCar.name}
                </p>
              </div>
              <span className="btn-primary py-2 px-4 text-sm">Xem 3D ngay</span>
            </Link>
          </div>
        )}

        {/* Content - Render blocks if available, otherwise fallback to content string */}
        <div className="max-w-4xl mx-auto space-y-6">
          {hasContentBlocks ? (
            post.contentBlocks!.map((block, index) => renderContentBlock(block, index))
          ) : (
            <div className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-4xl mx-auto mt-10 pt-10 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface text-text-secondary text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Posts */}
        <div className="max-w-4xl mx-auto mt-10 text-center">
          <Link to="/posts" className="btn-secondary">
            ← Xem thêm tin tức
          </Link>
        </div>
      </div>

      {/* Zalo Button */}
      <ZaloButton postId={post._id} postTitle={post.title} postThumbnail={post.coverImage} />
    </article>
  );
};

export default PostDetailPage;
