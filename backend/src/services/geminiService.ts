import { getGeminiModel } from '../config/gemini.js';

export interface ClassificationResult {
  category: 'news' | 'review' | 'promotion' | 'event';
  title: string;
  excerpt: string;
  relatedCarName?: string;
  confidence: number;
  tags: string[];

  // Event-specific
  eventStartDate?: string;
  eventEndDate?: string;

  // Promotion-specific
  discountAmount?: number;
  discountPercent?: number;
  discountDescription?: string;

  // Content blocks
  contentBlocks: Array<{
    type: 'text' | 'image';
    content?: string;
    url?: string;
    caption?: string;
  }>;
}

/**
 * Phát hiện category dựa trên nội dung
 * - promotion: CẦN có từ khóa mạnh như "khuyến mãi", "giảm giá", "sale"
 * - event: Có ngày cụ thể + từ khóa sự kiện
 * - review: Đánh giá, so sánh, trải nghiệm
 * - news: Mặc định
 */
function detectCategory(content: string): 'news' | 'review' | 'promotion' | 'event' {
  const lowerContent = content.toLowerCase();

  // Đếm số lượng từ khóa promotion
  const promotionKeywords = [
    'khuyến mãi',
    'khuyến mại',
    'giảm giá',
    'sale',
    'giảm ngay',
    'ưu đãi đặc biệt',
    'ưu đãi lớn',
    'tặng quà',
    'quà tặng',
    'giá sốc',
    'giá tốt nhất',
    'tiết kiệm',
    'miễn phí 100%',
  ];
  const promotionCount = promotionKeywords.filter((kw) => lowerContent.includes(kw)).length;

  // Đếm từ khóa event
  const eventKeywords = ['sự kiện', 'lái thử', 'triển lãm', 'khai trương', 'ra mắt'];
  const hasEventKeyword = eventKeywords.some((kw) => lowerContent.includes(kw));
  // Event thường có ngày tháng cụ thể
  const hasDate = /\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s*(tháng|\/)\s*\d{1,2}/i.test(content);

  // Đếm từ khóa review
  const reviewKeywords = ['đánh giá', 'review', 'trải nghiệm', 'so sánh', 'thử nghiệm', 'cảm nhận'];
  const hasReviewKeyword = reviewKeywords.some((kw) => lowerContent.includes(kw));

  // Logic phân loại
  // 1. Event: có từ khóa event + có ngày
  if (hasEventKeyword && hasDate) {
    return 'event';
  }

  // 2. Promotion: CẦN ít nhất 2 từ khóa promotion HOẶC 1 từ khóa rất mạnh
  const strongPromotionKeywords = ['khuyến mãi', 'giảm giá', 'sale'];
  const hasStrongPromotion = strongPromotionKeywords.some((kw) => lowerContent.includes(kw));
  if (hasStrongPromotion || promotionCount >= 2) {
    return 'promotion';
  }

  // 3. Review
  if (hasReviewKeyword) {
    return 'review';
  }

  // 4. Default: news
  return 'news';
}

/**
 * Phân loại nội dung bài đăng Facebook sử dụng Gemini AI
 */
export async function classifyContent(
  content: string,
  images?: string[],
): Promise<ClassificationResult> {
  try {
    const model = getGeminiModel();

    const prompt = `Bạn là trợ lý AI cho website showroom xe hơi. Phân tích bài đăng Facebook sau và trả về JSON.

=== NỘI DUNG BÀI ĐĂNG ===
${content}
=== HẾT NỘI DUNG ===

${images && images.length > 0 ? `Có ${images.length} ảnh: ${images.join(', ')}` : 'Không có ảnh'}

=== HƯỚNG DẪN PHÂN LOẠI ===

CATEGORY (chọn 1):
- "promotion" = Khuyến mãi, giảm giá, ưu đãi, quà tặng, hỗ trợ trả góp
- "event" = Sự kiện có ngày cụ thể, lái thử, triển lãm  
- "review" = Đánh giá xe, so sánh, trải nghiệm sử dụng
- "news" = Tin tức chung về thị trường, ra mắt xe mới

QUAN TRỌNG: Nếu có từ khóa "khuyến mãi", "giảm giá", "ưu đãi", "quà tặng", "trả góp" → category = "promotion"

=== YÊU CẦU ===

1. title: Tiêu đề ngắn gọn (max 80 ký tự, không emoji)
2. excerpt: Mô tả (max 200 ký tự)
3. category: Một trong 4 loại trên
4. confidence: 0.7-1.0 (độ tin cậy)
5. tags: Mảng 3-5 từ khóa (không có #)
6. relatedCarName: Tên xe nếu có (VD: "VinFast VF5", "Toyota Camry")

NẾU category = "promotion":
- discountAmount: Số tiền giảm (VD: 100000000 cho 100 triệu), null nếu không có
- discountPercent: Phần trăm giảm (VD: 15), null nếu không có
- discountDescription: Mô tả ngắn về khuyến mãi

NẾU category = "event":
- eventStartDate: Ngày bắt đầu (YYYY-MM-DD), null nếu không rõ
- eventEndDate: Ngày kết thúc (YYYY-MM-DD), null nếu không rõ

contentBlocks: Chia nội dung thành các đoạn văn, mỗi đoạn là 1 object {type: "text", content: "..."}

=== TRẢ VỀ JSON (CHỈ JSON, KHÔNG TEXT KHÁC) ===
{
  "category": "promotion",
  "title": "...",
  "excerpt": "...",
  "confidence": 0.85,
  "tags": ["tag1", "tag2", "tag3"],
  "relatedCarName": "VinFast VF5",
  "discountAmount": null,
  "discountPercent": null,
  "discountDescription": "Hỗ trợ trả góp 90 triệu",
  "eventStartDate": null,
  "eventEndDate": null,
  "contentBlocks": [
    {"type": "text", "content": "Đoạn 1..."},
    {"type": "text", "content": "Đoạn 2..."}
  ]
}`;

    console.log('🤖 Calling Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('📝 Gemini response length:', text.length);

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response:', text.substring(0, 200));
      throw new Error('Invalid AI response - no JSON found');
    }

    let parsed: ClassificationResult;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid JSON format from AI');
    }

    // Validate và fix category
    const validCategories = ['news', 'review', 'promotion', 'event'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = detectCategory(content);
    }

    // Ensure confidence > 0
    if (!parsed.confidence || parsed.confidence <= 0) {
      parsed.confidence = 0.75;
    }

    // Extract hashtags from original content (e.g. #VinFast #VF5)
    const hashtagMatches = content.match(/#[\wÀ-ỹ]+/g);
    const extractedTags = hashtagMatches ? hashtagMatches.map((tag) => tag.replace('#', '')) : [];

    // Merge AI tags with extracted hashtags, remove duplicates
    if (!Array.isArray(parsed.tags)) {
      parsed.tags = [];
    }
    parsed.tags = [...new Set([...parsed.tags, ...extractedTags])];

    // Remove hashtag lines from content for contentBlocks
    const cleanContent = content
      .split('\n')
      .filter((line) => !line.trim().match(/^#[\wÀ-ỹ\s#]+$/)) // Remove lines that are only hashtags
      .join('\n')
      .replace(/#[\wÀ-ỹ]+/g, '') // Remove inline hashtags
      .replace(/\s{2,}/g, ' ') // Clean up extra spaces
      .trim();

    // Ensure contentBlocks exists and has content (without hashtags)
    if (!parsed.contentBlocks || parsed.contentBlocks.length === 0) {
      const paragraphs = cleanContent.split(/\n\n+/).filter((p) => p.trim().length > 0);
      parsed.contentBlocks = paragraphs.map((p) => ({
        type: 'text' as const,
        content: p.trim(),
      }));
    } else {
      // Clean hashtags from existing contentBlocks
      parsed.contentBlocks = parsed.contentBlocks
        .map((block) => {
          if (block.type === 'text' && block.content) {
            return {
              ...block,
              content: block.content
                .replace(/#[\wÀ-ỹ]+/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim(),
            };
          }
          return block;
        })
        .filter((block) => block.type !== 'text' || (block.content && block.content.length > 0));
    }

    // Add images to contentBlocks if provided
    if (images && images.length > 0) {
      for (const img of images) {
        parsed.contentBlocks.push({
          type: 'image',
          url: img,
          caption: 'Ảnh từ Facebook',
        });
      }
    }

    console.log(`✅ Classification: ${parsed.category} (${Math.round(parsed.confidence * 100)}%)`);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini classification error:', error);

    // Fallback với smart detection
    const category = detectCategory(content);

    // Extract car name
    const carMatch = content.match(
      /VinFast\s+\w+|Toyota\s+\w+|Honda\s+\w+|Hyundai\s+\w+|Mazda\s+\w+/i,
    );

    // Extract ALL hashtags from content (no limit)
    const hashtagMatches = content.match(/#[\wÀ-ỹ]+/g);
    const extractedTags = hashtagMatches ? hashtagMatches.map((tag) => tag.replace('#', '')) : [];

    // Clean content: remove hashtag-only lines and inline hashtags
    const cleanContent = content
      .split('\n')
      .filter((line) => !line.trim().match(/^#[\wÀ-ỹ\s#]+$/))
      .join('\n')
      .replace(/#[\wÀ-ỹ]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Split cleaned content into paragraphs
    const paragraphs = cleanContent.split(/\n\n+/).filter((p) => p.trim().length > 0);

    return {
      category,
      title: cleanContent
        .replace(/[🎁📅✅💰🎉]/g, '')
        .substring(0, 80)
        .trim(),
      excerpt: cleanContent
        .replace(/[🎁📅✅💰🎉]/g, '')
        .substring(0, 200)
        .trim(),
      relatedCarName: carMatch ? carMatch[0] : undefined,
      confidence: 0.5,
      tags: extractedTags,
      contentBlocks: paragraphs.map((p) => ({
        type: 'text' as const,
        content: p.trim(),
      })),
    };
  }
}

/**
 * Tạo nội dung bài viết từ text Facebook (format lại)
 */
export async function generatePostContent(originalContent: string): Promise<string> {
  // Just return cleaned content, don't call AI again
  return originalContent
    .replace(/\n{3,}/g, '\n\n') // Remove extra blank lines
    .trim();
}
