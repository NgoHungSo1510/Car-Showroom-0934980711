import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { carsAPI } from '../services/api';
import ThreeDViewer from '../components/ThreeDViewer';
import ImageGallery from '../components/ImageGallery';
import PostCard from '../components/PostCard';
import ZaloButton from '../components/ZaloButton';
import { isCarBookmarked, toggleCarBookmark } from '../utils/bookmarks';

type TabType = 'overview' | 'exterior' | 'interior' | 'colors' | 'specs';

const CarDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch car details
  const {
    data: carData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['car', slug],
    queryFn: async () => {
      const response = await carsAPI.getBySlug(slug!);
      return response.data.data;
    },
    enabled: !!slug,
  });

  // Fetch related posts
  const { data: relatedPostsData } = useQuery({
    queryKey: ['car-related-posts', carData?._id],
    queryFn: async () => {
      const response = await carsAPI.getRelatedPosts(carData!._id);
      return response.data.data;
    },
    enabled: !!carData?._id,
  });

  const car = carData;
  const relatedPosts = relatedPostsData || [];

  // Check bookmark status when car loads
  useEffect(() => {
    if (car?._id) {
      setIsBookmarked(isCarBookmarked(car._id));
    }
  }, [car?._id]);

  const handleToggleBookmark = () => {
    if (car?._id) {
      const newState = toggleCarBookmark(car._id);
      setIsBookmarked(newState);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Check if tab has content
  const hasExterior = (car?.exterior?.images?.length ?? 0) > 0 || !!car?.exterior?.description;
  const hasInterior = (car?.interior?.images?.length ?? 0) > 0 || !!car?.interior?.description;
  const hasColors = (car?.colorOptions?.length ?? 0) > 0;
  const hasSpecs = car?.specs && Object.values(car.specs).some((v) => v);

  // Memoize tabs - MUST be before any conditional returns
  const tabs = React.useMemo(() => [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: '🚗', show: true },
    { id: 'exterior' as TabType, label: 'Ngoại thất', icon: '🚘', show: hasExterior },
    { id: 'interior' as TabType, label: 'Nội thất', icon: '🛋️', show: hasInterior },
    { id: 'colors' as TabType, label: 'Màu sắc', icon: '🎨', show: hasColors },
    { id: 'specs' as TabType, label: 'Thông số', icon: '⚙️', show: hasSpecs },
  ].filter((tab) => tab.show), [hasExterior, hasInterior, hasColors, hasSpecs]);

  // Scrollspy logic - MUST be before any conditional returns
  useEffect(() => {
    if (!car) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '') as TabType;
            setActiveTab(id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0,
      },
    );

    tabs.forEach((tab) => {
      const element = document.getElementById(`section-${tab.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [car, tabs]);

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Không tìm thấy xe</h1>
        <Link to="/cars" className="btn-primary">
          Quay lại Showroom
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
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
            {car.viewCount?.toLocaleString()}
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
        {/* Car Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {car.brand?.logo && (
              <img src={car.brand.logo} alt={car.brand.name} className="h-6 object-contain" />
            )}
            <span className="text-sm text-text-secondary">{car.brand?.name}</span>
            {car.carType && (
              <>
                <span className="text-text-secondary">•</span>
                <span className="text-sm text-text-secondary">{car.carType.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2">
            {car.name}
          </h1>
          <p className="text-2xl font-bold text-primary">{formatPrice(car.price)}</p>
        </div>

        {/* Tabs Navigation - Sticky */}
        <div className="sticky top-[64px] z-30 -mx-4 px-4 mb-6 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const element = document.getElementById(`section-${tab.id}`);
                  if (element) {
                    const offset = 130;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30'
                  : 'bg-surface/50 text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - All Sections Visible */}
        <div className="space-y-16 pb-10">
          {/* OVERVIEW SECTION */}
          <section id="section-overview" className="scroll-mt-32">
            <div className="space-y-8">
              {/* 3D Viewer */}
              <ThreeDViewer
                config={car.model3D}
                fallbackImage={car.thumbnail || car.gallery?.[0]}
                carName={car.name}
              />

              {/* Quick Specs */}
              {car.specs && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {car.specs.engine && (
                    <div className="p-4 bg-surface rounded-xl">
                      <p className="text-xs text-text-secondary mb-1">Động cơ</p>
                      <p className="font-medium text-text-primary">{car.specs.engine}</p>
                    </div>
                  )}
                  {car.specs.power && (
                    <div className="p-4 bg-surface rounded-xl">
                      <p className="text-xs text-text-secondary mb-1">Công suất</p>
                      <p className="font-medium text-text-primary">{car.specs.power}</p>
                    </div>
                  )}
                  {car.specs.seats && (
                    <div className="p-4 bg-surface rounded-xl">
                      <p className="text-xs text-text-secondary mb-1">Số chỗ</p>
                      <p className="font-medium text-text-primary">{car.specs.seats} chỗ</p>
                    </div>
                  )}
                  {car.specs.acceleration && (
                    <div className="p-4 bg-surface rounded-xl">
                      <p className="text-xs text-text-secondary mb-1">Tăng tốc 0-100</p>
                      <p className="font-medium text-text-primary">{car.specs.acceleration}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {car.description && (
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">Giới thiệu chi tiết</h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {car.description}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {car.gallery && car.gallery.length > 0 && (
                <ImageGallery images={car.gallery} carName={car.name} />
              )}
            </div>
          </section>

          {/* EXTERIOR SECTION */}
          {hasExterior && (
            <section id="section-exterior" className="scroll-mt-32">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <span className="text-3xl">🚘</span> Ngoại thất
                </h2>
                {car.exterior?.description && (
                  <div className="glass rounded-2xl p-6">
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {car.exterior.description}
                    </p>
                  </div>
                )}
                {car.exterior?.images && car.exterior.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.exterior.images.map((img: string, idx: number) => (
                      <div key={idx} className="rounded-xl overflow-hidden group">
                        <img
                          src={img}
                          alt={`Ngoại thất ${idx + 1}`}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* INTERIOR SECTION */}
          {hasInterior && (
            <section id="section-interior" className="scroll-mt-32">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <span className="text-3xl">🛋️</span> Nội thất
                </h2>
                {car.interior?.description && (
                  <div className="glass rounded-2xl p-6">
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {car.interior.description}
                    </p>
                  </div>
                )}
                {car.interior?.images && car.interior.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {car.interior.images.map((img: string, idx: number) => (
                      <div key={idx} className="rounded-xl overflow-hidden group">
                        <img
                          src={img}
                          alt={`Nội thất ${idx + 1}`}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* COLORS SECTION */}
          {hasColors && (
            <section id="section-colors" className="scroll-mt-32">
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">🎨 Tùy chọn màu sắc</h2>
                  <p className="text-text-secondary mb-6">
                    {car.name} có {car.colorOptions?.length || 0} tùy chọn màu. Chọn màu bên dưới để xem
                    hình ảnh minh họa.
                  </p>

                  {/* Color Swatches */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {car.colorOptions?.map(
                      (color: { name: string; hexCode: string; image?: string }, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColorIndex(idx)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedColorIndex === idx
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <span
                            className={
                              selectedColorIndex === idx
                                ? 'text-primary font-bold'
                                : 'text-text-secondary'
                            }
                          >
                            {color.name}
                          </span>
                        </button>
                      ),
                    )}
                  </div>

                  {/* Selected Color Image */}
                  {car.colorOptions?.[selectedColorIndex]?.image ? (
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={car.colorOptions[selectedColorIndex].image}
                        alt={car.colorOptions[selectedColorIndex].name}
                        className="w-full h-80 object-cover transition-all duration-500"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full h-80 rounded-2xl flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: car.colorOptions?.[selectedColorIndex]?.hexCode || '#333',
                      }}
                    >
                      <span className="text-6xl animate-bounce">🚗</span>
                    </div>
                  )}
                  <p className="text-center mt-4 text-text-primary font-bold text-lg">
                    {car.colorOptions?.[selectedColorIndex]?.name}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SPECS SECTION */}
          {hasSpecs && (
            <section id="section-specs" className="scroll-mt-32">
              <div className="glass rounded-2xl overflow-hidden">
                <h2 className="text-xl font-bold text-text-primary p-6 border-b border-border flex items-center gap-2">
                  <span className="text-2xl">⚙️</span> Thông số kỹ thuật
                </h2>
                <table className="w-full">
                  <tbody className="divide-y divide-border">
                    {car.specs.engine && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Động cơ</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.engine}
                        </td>
                      </tr>
                    )}
                    {car.specs.power && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Công suất</td>
                        <td className="px-6 py-4 text-text-primary font-medium">{car.specs.power}</td>
                      </tr>
                    )}
                    {car.specs.torque && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Mô-men xoắn</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.torque}
                        </td>
                      </tr>
                    )}
                    {car.specs.acceleration && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Tăng tốc 0-100km/h</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.acceleration}
                        </td>
                      </tr>
                    )}
                    {car.specs.topSpeed && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Tốc độ tối đa</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.topSpeed}
                        </td>
                      </tr>
                    )}
                    {car.specs.range && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Quãng đường</td>
                        <td className="px-6 py-4 text-text-primary font-medium">{car.specs.range}</td>
                      </tr>
                    )}
                    {car.specs.fuelConsumption && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Tiêu hao nhiên liệu</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.fuelConsumption}
                        </td>
                      </tr>
                    )}
                    {car.specs.seats && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Số chỗ ngồi</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.seats} chỗ
                        </td>
                      </tr>
                    )}
                    {car.specs.dimensions && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Kích thước (DxRxC)</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.dimensions}
                        </td>
                      </tr>
                    )}
                    {car.specs.weight && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Trọng lượng</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.weight}
                        </td>
                      </tr>
                    )}
                    {car.specs.transmission && (
                      <tr>
                        <td className="px-6 py-4 text-text-secondary">Hộp số</td>
                        <td className="px-6 py-4 text-text-primary font-medium">
                          {car.specs.transmission}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-text-primary mb-4">Tin tức về xe này</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post, index) => (
                <PostCard key={post._id} post={post} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Smart Zalo with car info */}
      <ZaloButton carId={car._id} carName={car.name} carThumbnail={car.thumbnail} />
    </div>
  );
};

export default CarDetailPage;
