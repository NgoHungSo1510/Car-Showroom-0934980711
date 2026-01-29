import { Request, Response } from 'express';
import Post from '../models/Post.js';
import Car from '../models/Car.js';
import Admin from '../models/Admin.js';
import { classifyContent } from '../services/geminiService.js';

// Verify token for Facebook webhook verification
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'my_verify_token_123';

/**
 * GET /api/webhook/facebook
 * Facebook webhook verification endpoint
 */
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
    console.log('✅ Facebook webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Facebook webhook verification failed');
    res.sendStatus(403);
  }
};

/**
 * POST /api/webhook/facebook
 * Receive new posts from Facebook Page
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object !== 'page') {
      return res.sendStatus(404);
    }

    for (const entry of body.entry) {
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'feed' && change.value.item === 'post') {
            await processNewPost(change.value);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Facebook webhook error:', error);
    res.sendStatus(500);
  }
};

/**
 * Process a new Facebook post with full AI classification
 */
async function processNewPost(postData: { post_id?: string; message?: string; photos?: string[] }) {
  try {
    const { message, photos, post_id } = postData;

    if (!message) {
      console.log('⏭️ Skipping post without message');
      return;
    }

    console.log(`📥 Processing FB post: ${post_id}`);

    // Classify with AI
    const classification = await classifyContent(message, photos);
    console.log(
      `🤖 AI: ${classification.category} (${Math.round(classification.confidence * 100)}%)`,
    );

    // Find related car
    let relatedCarId = null;
    if (classification.relatedCarName) {
      const car = await Car.findOne({
        name: { $regex: classification.relatedCarName, $options: 'i' },
        status: 'published',
      });
      if (car) {
        relatedCarId = car._id;
        console.log(`🚗 Found car: ${car.name}`);
      }
    }

    // Get first admin for createdBy
    const admin = await Admin.findOne({ isActive: true });

    // Build post data with all classification fields
    const postPayload: Record<string, unknown> = {
      title: classification.title,
      excerpt: classification.excerpt,
      content: classification.contentBlocks
        .filter((b) => b.type === 'text')
        .map((b) => b.content)
        .join('\n\n'),
      contentBlocks: classification.contentBlocks,
      coverImage: photos && photos.length > 0 ? photos[0] : undefined,
      category: classification.category,
      tags: classification.tags,
      relatedCar: relatedCarId,
      status: 'draft',
      viewCount: 0,
      createdBy: admin?._id,
    };

    // Add event-specific fields
    if (classification.category === 'event') {
      if (classification.eventStartDate) {
        postPayload.eventStartDate = new Date(classification.eventStartDate);
      }
      if (classification.eventEndDate) {
        postPayload.eventEndDate = new Date(classification.eventEndDate);
      }
    }

    // Add promotion-specific fields
    if (classification.category === 'promotion') {
      if (classification.discountAmount) {
        postPayload.discountAmount = classification.discountAmount;
      }
      if (classification.discountPercent) {
        postPayload.discountPercent = classification.discountPercent;
      }
      if (classification.discountDescription) {
        postPayload.discountDescription = classification.discountDescription;
      }
    }

    const newPost = await Post.create(postPayload);
    console.log(`✅ Created: ${newPost.title}`);

    return newPost;
  } catch (error) {
    console.error('Error processing FB post:', error);
    throw error;
  }
}

/**
 * Manual import endpoint - for testing
 * POST /api/webhook/facebook/import
 */
export const manualImport = async (req: Request, res: Response) => {
  try {
    const { content, images, autoPublish } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Classify with AI
    const classification = await classifyContent(content, images);

    // Find related car
    let relatedCarId = null;
    if (classification.relatedCarName) {
      const car = await Car.findOne({
        name: { $regex: classification.relatedCarName, $options: 'i' },
        status: 'published',
      });
      if (car) {
        relatedCarId = car._id;
      }
    }

    // Get admin from request or find first admin
    const adminId = req.admin?._id || (await Admin.findOne({ isActive: true }))?._id;

    // Build post data
    const postPayload: Record<string, unknown> = {
      title: classification.title,
      excerpt: classification.excerpt,
      content: classification.contentBlocks
        .filter((b) => b.type === 'text')
        .map((b) => b.content)
        .join('\n\n'),
      contentBlocks: classification.contentBlocks,
      coverImage: images && images.length > 0 ? images[0] : undefined,
      category: classification.category,
      tags: classification.tags,
      relatedCar: relatedCarId,
      status: autoPublish ? 'published' : 'draft',
      viewCount: 0,
      createdBy: adminId,
    };

    // Add event fields
    if (classification.category === 'event') {
      if (classification.eventStartDate) {
        postPayload.eventStartDate = new Date(classification.eventStartDate);
      }
      if (classification.eventEndDate) {
        postPayload.eventEndDate = new Date(classification.eventEndDate);
      }
    }

    // Add promotion fields
    if (classification.category === 'promotion') {
      if (classification.discountAmount) {
        postPayload.discountAmount = classification.discountAmount;
      }
      if (classification.discountPercent) {
        postPayload.discountPercent = classification.discountPercent;
      }
      if (classification.discountDescription) {
        postPayload.discountDescription = classification.discountDescription;
      }
    }

    const newPost = await Post.create(postPayload);

    res.json({
      success: true,
      data: {
        post: newPost,
        classification,
      },
    });
  } catch (error) {
    console.error('Manual import error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Import failed',
    });
  }
};

/**
 * Test AI classification endpoint
 * POST /api/webhook/facebook/test-ai
 */
export const testAI = async (req: Request, res: Response) => {
  try {
    const { content, images } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    const classification = await classifyContent(content, images);

    res.json({
      success: true,
      data: classification,
    });
  } catch (error) {
    console.error('Test AI error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'AI test failed',
    });
  }
};

// Facebook Graph API configuration
const FB_GRAPH_API_VERSION = 'v18.0';

// Helper to get FB configuration
async function getFbConfig() {
  const [tokenSetting, pageIdSetting] = await Promise.all([
    import('../models/Setting.js').then((m) => m.default.findOne({ key: 'facebook_access_token' })),
    import('../models/Setting.js').then((m) => m.default.findOne({ key: 'facebook_page_id' })),
  ]);

  const token = tokenSetting?.value || process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = pageIdSetting?.value || process.env.FB_PAGE_ID || 'me';

  return { token, pageId };
}

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  attachments?: {
    data: Array<{
      media?: {
        image?: { src: string };
      };
      subattachments?: {
        data: Array<{
          media?: {
            image?: { src: string };
          };
        }>;
      };
    }>;
  };
}

interface FacebookAPIResponse {
  data: FacebookPost[];
  paging?: {
    cursors: {
      before: string;
      after: string;
      previous?: string;
      next?: string;
    };
    next?: string;
  };
}

/**
 * Fetch posts from Facebook Page using Graph API
 */
async function fetchFacebookPosts(limit: number = 10): Promise<FacebookPost[]> {
  const { token, pageId } = await getFbConfig();

  if (!token) {
    throw new Error('FB_PAGE_ACCESS_TOKEN is not configured');
  }

  const fields = 'id,message,created_time,full_picture,attachments{media,subattachments}';
  const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}/posts?fields=${fields}&limit=${limit}&access_token=${token}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error.error?.message || 'Failed to fetch Facebook posts');
  }

  const data = (await response.json()) as FacebookAPIResponse;
  return data.data;
}

/**
 * Extract all images from a Facebook post
 */
function extractImages(post: FacebookPost): string[] {
  const images: string[] = [];

  // Main image
  if (post.full_picture) {
    images.push(post.full_picture);
  }

  // Attachments
  if (post.attachments?.data) {
    for (const attachment of post.attachments.data) {
      if (attachment.media?.image?.src) {
        images.push(attachment.media.image.src);
      }
      if (attachment.subattachments?.data) {
        for (const sub of attachment.subattachments.data) {
          if (sub.media?.image?.src) {
            images.push(sub.media.image.src);
          }
        }
      }
    }
  }

  return [...new Set(images)]; // Remove duplicates
}

// Store for sync history
interface SyncRecord {
  syncedAt: Date;
  postsFound: number;
  postsCreated: number;
  postsSkipped: number;
  errors: string[];
}

const syncHistory: SyncRecord[] = [];

/**
 * POST /api/webhook/facebook/sync
 * Manually sync posts from Facebook Page
 */
export const syncFromFacebookPage = async (req: Request, res: Response) => {
  try {
    const { limit = 10, autoPublish = false } = req.body;
    const { token } = await getFbConfig();

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          'Facebook Page Access Token chưa được cấu hình. Vui lòng thêm vào Cài đặt hoặc file .env',
      });
    }

    console.log(`🔄 Starting Facebook sync (limit: ${limit})...`);

    // Fetch posts from Facebook
    const fbPosts = await fetchFacebookPosts(limit);
    console.log(`📥 Fetched ${fbPosts.length} posts from Facebook`);

    // Get admin for createdBy
    const admin = req.admin?._id || (await Admin.findOne({ isActive: true }))?._id;

    const results = {
      total: fbPosts.length,
      created: 0,
      skipped: 0,
      errors: [] as string[],
      posts: [] as any[],
    };

    for (const fbPost of fbPosts) {
      try {
        // Skip posts without message
        if (!fbPost.message) {
          results.skipped++;
          continue;
        }

        // Check if post already synced (by checking if similar title exists)
        const existingPost = await Post.findOne({
          content: { $regex: fbPost.message.substring(0, 50), $options: 'i' },
          createdAt: {
            $gte: new Date(new Date(fbPost.created_time).getTime() - 86400000), // within 1 day
            $lte: new Date(new Date(fbPost.created_time).getTime() + 86400000),
          },
        });

        if (existingPost) {
          console.log(`⏭️ Skipping duplicate: ${fbPost.id}`);
          results.skipped++;
          continue;
        }

        // Extract images
        const images = extractImages(fbPost);

        // Classify with AI
        const classification = await classifyContent(fbPost.message, images);
        console.log(`🤖 AI classified as: ${classification.category}`);

        // Find related car
        let relatedCarId = null;
        if (classification.relatedCarName) {
          const car = await Car.findOne({
            name: { $regex: classification.relatedCarName, $options: 'i' },
            status: 'published',
          });
          if (car) {
            relatedCarId = car._id;
          }
        }

        // Build post data
        const postPayload: Record<string, unknown> = {
          title: classification.title,
          excerpt: classification.excerpt,
          content: classification.contentBlocks
            .filter((b) => b.type === 'text')
            .map((b) => b.content)
            .join('\n\n'),
          contentBlocks: classification.contentBlocks,
          coverImage: images.length > 0 ? images[0] : undefined,
          category: classification.category,
          tags: [...classification.tags, 'facebook-sync'],
          relatedCar: relatedCarId,
          status: autoPublish ? 'published' : 'draft',
          viewCount: 0,
          createdBy: admin,
          publishedAt: autoPublish ? new Date(fbPost.created_time) : undefined,
        };

        // Add event fields
        if (classification.category === 'event') {
          if (classification.eventStartDate) {
            postPayload.eventStartDate = new Date(classification.eventStartDate);
          }
          if (classification.eventEndDate) {
            postPayload.eventEndDate = new Date(classification.eventEndDate);
          }
        }

        // Add promotion fields
        if (classification.category === 'promotion') {
          if (classification.discountAmount)
            postPayload.discountAmount = classification.discountAmount;
          if (classification.discountPercent)
            postPayload.discountPercent = classification.discountPercent;
          if (classification.discountDescription)
            postPayload.discountDescription = classification.discountDescription;
        }

        const newPost = await Post.create(postPayload);
        console.log(`✅ Created post: ${newPost.title}`);

        results.created++;
        results.posts.push({
          id: newPost._id,
          title: newPost.title,
          category: newPost.category,
          status: newPost.status,
          fbPostId: fbPost.id,
        });
      } catch (postError) {
        const errorMsg = postError instanceof Error ? postError.message : 'Unknown error';
        console.error(`❌ Error processing post ${fbPost.id}:`, errorMsg);
        results.errors.push(`Post ${fbPost.id}: ${errorMsg}`);
      }
    }

    // Save sync record
    syncHistory.unshift({
      syncedAt: new Date(),
      postsFound: results.total,
      postsCreated: results.created,
      postsSkipped: results.skipped,
      errors: results.errors,
    });

    // Keep only last 20 records
    if (syncHistory.length > 20) {
      syncHistory.pop();
    }

    console.log(`✅ Sync completed: ${results.created} created, ${results.skipped} skipped`);

    res.json({
      success: true,
      message: `Đồng bộ thành công! Tạo ${results.created} bài viết mới, bỏ qua ${results.skipped} bài.`,
      data: results,
    });
  } catch (error) {
    console.error('Facebook sync error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
    });
  }
};

/**
 * GET /api/webhook/facebook/status
 * Get sync status and history
 */
export const getSyncStatus = async (req: Request, res: Response) => {
  try {
    const { token, pageId } = await getFbConfig();
    const isConfigured = !!token;

    // Test connection if configured
    let connectionStatus = 'not_configured';
    let pageInfo = null;

    if (isConfigured) {
      try {
        const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}?fields=id,name,fan_count,picture&access_token=${token}`;
        const response = await fetch(url);

        if (response.ok) {
          pageInfo = await response.json();
          connectionStatus = 'connected';
        } else {
          const error = await response.json();
          connectionStatus = 'error';
          console.error('FB connection error:', error);
        }
      } catch (err) {
        connectionStatus = 'error';
      }
    }

    // Get synced posts count
    const syncedPostsCount = await Post.countDocuments({
      tags: 'facebook-sync',
    });

    res.json({
      success: true,
      data: {
        isConfigured,
        connectionStatus,
        pageInfo,
        syncedPostsCount,
        history: syncHistory.slice(0, 10),
        autoSync: autoSyncConfig,
      },
    });
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get status',
    });
  }
};

// Store synced FB post IDs to track duplicates
const syncedFbPostIds: Set<string> = new Set();

// Auto sync configuration
interface AutoSyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  autoPublish: boolean;
  lastSync?: Date;
}

let autoSyncConfig: AutoSyncConfig = {
  enabled: false,
  intervalMinutes: 30,
  autoPublish: false,
};

let autoSyncInterval: NodeJS.Timeout | null = null;

/**
 * GET /api/webhook/facebook/posts
 * Get list of Facebook posts with sync status
 */
export const getFacebookPosts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const { token } = await getFbConfig();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Facebook Page Access Token chưa được cấu hình',
      });
    }

    // Fetch posts from Facebook
    const fbPosts = await fetchFacebookPosts(limit);

    // Get synced post IDs from database
    const syncedPosts = await Post.find(
      { tags: 'facebook-sync' },
      { content: 1, createdAt: 1 },
    ).lean();

    // Create a map for quick lookup
    const syncedContentMap = new Map<string, boolean>();
    syncedPosts.forEach((post) => {
      if (post.content) {
        // Store first 50 chars of content for matching
        syncedContentMap.set(post.content.substring(0, 50), true);
      }
    });

    // Add sync status to each FB post
    const postsWithStatus = fbPosts.map((post) => {
      const contentKey = post.message?.substring(0, 50) || '';
      const isSynced = syncedContentMap.has(contentKey) || syncedFbPostIds.has(post.id);

      return {
        id: post.id,
        message: post.message,
        created_time: post.created_time,
        full_picture: post.full_picture,
        images: extractImages(post),
        synced: isSynced,
      };
    });

    res.json({
      success: true,
      data: {
        posts: postsWithStatus,
        total: postsWithStatus.length,
        synced: postsWithStatus.filter((p) => p.synced).length,
        unsynced: postsWithStatus.filter((p) => !p.synced).length,
      },
    });
  } catch (error) {
    console.error('Get Facebook posts error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch posts',
    });
  }
};

/**
 * POST /api/webhook/facebook/sync-single
 * Sync a single Facebook post by ID
 */
export const syncSinglePost = async (req: Request, res: Response) => {
  try {
    const { fbPostId, message, images, autoPublish = false } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bài viết không được để trống',
      });
    }

    // Get admin for createdBy
    const admin = req.admin?._id || (await Admin.findOne({ isActive: true }))?._id;

    // Classify with AI
    const classification = await classifyContent(message, images);
    console.log(`🤖 AI classified as: ${classification.category}`);

    // Find related car
    let relatedCarId = null;
    if (classification.relatedCarName) {
      const car = await Car.findOne({
        name: { $regex: classification.relatedCarName, $options: 'i' },
        status: 'published',
      });
      if (car) {
        relatedCarId = car._id;
      }
    }

    // Build post data
    const postPayload: Record<string, unknown> = {
      title: classification.title,
      excerpt: classification.excerpt,
      content: classification.contentBlocks
        .filter((b) => b.type === 'text')
        .map((b) => b.content)
        .join('\n\n'),
      contentBlocks: classification.contentBlocks,
      coverImage: images && images.length > 0 ? images[0] : undefined,
      category: classification.category,
      tags: [...classification.tags, 'facebook-sync'],
      relatedCar: relatedCarId,
      status: autoPublish ? 'published' : 'draft',
      viewCount: 0,
      createdBy: admin,
      publishedAt: autoPublish ? new Date() : undefined,
    };

    // Add event fields
    if (classification.category === 'event') {
      if (classification.eventStartDate) {
        postPayload.eventStartDate = new Date(classification.eventStartDate);
      }
      if (classification.eventEndDate) {
        postPayload.eventEndDate = new Date(classification.eventEndDate);
      }
    }

    // Add promotion fields
    if (classification.category === 'promotion') {
      if (classification.discountAmount) postPayload.discountAmount = classification.discountAmount;
      if (classification.discountPercent)
        postPayload.discountPercent = classification.discountPercent;
      if (classification.discountDescription)
        postPayload.discountDescription = classification.discountDescription;
    }

    const newPost = await Post.create(postPayload);

    // Track synced FB post ID
    if (fbPostId) {
      syncedFbPostIds.add(fbPostId);
    }

    console.log(`✅ Created post: ${newPost.title}`);

    res.json({
      success: true,
      message: `Đã đồng bộ thành công: ${newPost.title}`,
      data: {
        post: newPost,
        classification,
      },
    });
  } catch (error) {
    console.error('Sync single post error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
    });
  }
};

/**
 * POST /api/webhook/facebook/sync-multiple
 * Sync multiple Facebook posts
 */
export const syncMultiplePosts = async (req: Request, res: Response) => {
  try {
    const { posts, autoPublish = false } = req.body;

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một bài để đồng bộ',
      });
    }

    const admin = req.admin?._id || (await Admin.findOne({ isActive: true }))?._id;

    const results = {
      total: posts.length,
      created: 0,
      errors: [] as string[],
      createdPosts: [] as any[],
    };

    for (const post of posts) {
      try {
        if (!post.message) {
          results.errors.push(`Bài ${post.id}: Không có nội dung`);
          continue;
        }

        // Classify with AI
        const classification = await classifyContent(post.message, post.images);

        // Find related car
        let relatedCarId = null;
        if (classification.relatedCarName) {
          const car = await Car.findOne({
            name: { $regex: classification.relatedCarName, $options: 'i' },
            status: 'published',
          });
          if (car) relatedCarId = car._id;
        }

        // Build post data
        const postPayload: Record<string, unknown> = {
          title: classification.title,
          excerpt: classification.excerpt,
          content: classification.contentBlocks
            .filter((b) => b.type === 'text')
            .map((b) => b.content)
            .join('\n\n'),
          contentBlocks: classification.contentBlocks,
          coverImage: post.images?.[0] || post.full_picture,
          category: classification.category,
          tags: [...classification.tags, 'facebook-sync'],
          relatedCar: relatedCarId,
          status: autoPublish ? 'published' : 'draft',
          viewCount: 0,
          createdBy: admin,
        };

        // Add event/promotion fields
        if (classification.category === 'event') {
          if (classification.eventStartDate)
            postPayload.eventStartDate = new Date(classification.eventStartDate);
          if (classification.eventEndDate)
            postPayload.eventEndDate = new Date(classification.eventEndDate);
        }
        if (classification.category === 'promotion') {
          if (classification.discountAmount)
            postPayload.discountAmount = classification.discountAmount;
          if (classification.discountPercent)
            postPayload.discountPercent = classification.discountPercent;
          if (classification.discountDescription)
            postPayload.discountDescription = classification.discountDescription;
        }

        const newPost = await Post.create(postPayload);
        syncedFbPostIds.add(post.id);

        results.created++;
        results.createdPosts.push({
          id: newPost._id,
          title: newPost.title,
          category: newPost.category,
          fbPostId: post.id,
        });
      } catch (err) {
        results.errors.push(
          `Bài ${post.id}: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`,
        );
      }
    }

    res.json({
      success: true,
      message: `Đã đồng bộ ${results.created}/${results.total} bài viết`,
      data: results,
    });
  } catch (error) {
    console.error('Sync multiple posts error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed',
    });
  }
};

/**
 * GET /api/webhook/facebook/synced-posts
 * Get list of already synced posts
 */
export const getSyncedPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ tags: 'facebook-sync' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt coverImage category status createdAt publishedAt')
        .lean(),
      Post.countDocuments({ tags: 'facebook-sync' }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get synced posts error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get synced posts',
    });
  }
};

/**
 * POST /api/webhook/facebook/auto-sync
 * Configure auto sync settings
 */
export const setAutoSync = async (req: Request, res: Response) => {
  try {
    const { enabled, intervalMinutes = 30, autoPublish = false } = req.body;

    // Clear existing interval
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      autoSyncInterval = null;
    }

    autoSyncConfig = {
      enabled: !!enabled,
      intervalMinutes,
      autoPublish,
      lastSync: autoSyncConfig.lastSync,
    };

    // Set up new interval if enabled
    if (enabled && intervalMinutes > 0) {
      const intervalMs = intervalMinutes * 60 * 1000;

      autoSyncInterval = setInterval(async () => {
        console.log('🔄 Auto-sync triggered...');
        try {
          const fbPosts = await fetchFacebookPosts(20);
          let synced = 0;

          for (const post of fbPosts) {
            if (!post.message || syncedFbPostIds.has(post.id)) continue;

            // Check if already synced
            const existing = await Post.findOne({
              content: { $regex: post.message.substring(0, 50), $options: 'i' },
            });
            if (existing) continue;

            try {
              const classification = await classifyContent(post.message, extractImages(post));
              const admin = await Admin.findOne({ isActive: true });

              await Post.create({
                title: classification.title,
                excerpt: classification.excerpt,
                content: classification.contentBlocks
                  .filter((b) => b.type === 'text')
                  .map((b) => b.content)
                  .join('\n\n'),
                contentBlocks: classification.contentBlocks,
                coverImage: post.full_picture,
                category: classification.category,
                tags: [...classification.tags, 'facebook-sync', 'auto-sync'],
                status: autoSyncConfig.autoPublish ? 'published' : 'draft',
                createdBy: admin?._id,
              });

              syncedFbPostIds.add(post.id);
              synced++;
            } catch (err) {
              console.error(`Auto-sync error for post ${post.id}:`, err);
            }
          }

          autoSyncConfig.lastSync = new Date();
          console.log(`✅ Auto-sync completed: ${synced} new posts`);
        } catch (err) {
          console.error('Auto-sync error:', err);
        }
      }, intervalMs);

      console.log(`✅ Auto-sync enabled: every ${intervalMinutes} minutes`);
    }

    res.json({
      success: true,
      message: enabled
        ? `Đã bật tự động đồng bộ mỗi ${intervalMinutes} phút`
        : 'Đã tắt tự động đồng bộ',
      data: autoSyncConfig,
    });
  } catch (error) {
    console.error('Set auto sync error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to set auto sync',
    });
  }
};

// Get client URL from env
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * POST /api/webhook/facebook/publish
 * Publish a post from website to Facebook Page
 */
export const publishToFacebook = async (req: Request, res: Response) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId là bắt buộc',
      });
    }

    if (!process.env.FB_PAGE_ACCESS_TOKEN) {
      return res.status(400).json({
        success: false,
        message: 'Facebook Page Access Token chưa được cấu hình',
      });
    }

    // Find the post
    const post = await Post.findById(postId).populate('relatedCar', 'name slug');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // Check if already published to Facebook
    if (post.facebookPostId) {
      return res.status(400).json({
        success: false,
        message: 'Bài viết này đã được đăng lên Facebook',
        facebookPostId: post.facebookPostId,
      });
    }

    // Build Facebook post message
    let message = '';

    // Add category emoji
    const categoryEmoji =
      post.category === 'news'
        ? '📰'
        : post.category === 'promotion'
          ? '🎉'
          : post.category === 'event'
            ? '📅'
            : post.category === 'review'
              ? '⭐'
              : '📣';

    message += `${categoryEmoji} ${post.title}\n\n`;

    // Add excerpt or first part of content
    if (post.excerpt) {
      message += `${post.excerpt}\n\n`;
    } else if (post.content) {
      const shortContent = post.content.substring(0, 200);
      message += `${shortContent}${post.content.length > 200 ? '...' : ''}\n\n`;
    }

    // Add promotion details if applicable
    if (post.category === 'promotion') {
      if (post.discountPercent) {
        message += `💰 Giảm ${post.discountPercent}%\n`;
      }
      if (post.discountAmount) {
        message += `💰 Giảm ${post.discountAmount.toLocaleString()}đ\n`;
      }
      if (post.discountDescription) {
        message += `📋 ${post.discountDescription}\n`;
      }
      message += '\n';
    }

    // Add event details if applicable
    if (post.category === 'event') {
      if (post.eventStartDate) {
        const startDate = new Date(post.eventStartDate).toLocaleDateString('vi-VN');
        message += `📅 Bắt đầu: ${startDate}\n`;
      }
      if (post.eventEndDate) {
        const endDate = new Date(post.eventEndDate).toLocaleDateString('vi-VN');
        message += `📅 Kết thúc: ${endDate}\n`;
      }
      message += '\n';
    }

    // Add link to post
    const postUrl = `${CLIENT_URL}/posts/${post.slug}`;
    message += `👉 Xem chi tiết: ${postUrl}\n`;

    // Add related car link if exists
    if (post.relatedCar && typeof post.relatedCar === 'object' && 'slug' in post.relatedCar) {
      const car = post.relatedCar as unknown as { name: string; slug: string };
      const carUrl = `${CLIENT_URL}/cars/${car.slug}`;
      message += `🚗 Xem xe ${car.name}: ${carUrl}\n`;
    }

    // Add hashtags
    message += '\n';
    if (post.tags && post.tags.length > 0) {
      const hashtags = post.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ');
      message += hashtags;
    }

    // Publish to Facebook
    const pageId = process.env.FB_PAGE_ID || 'me';
    let fbResponse: { id?: string };

    if (post.coverImage) {
      // Post with image
      const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}/photos`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: post.coverImage,
          message: message,
          access_token: process.env.FB_PAGE_ACCESS_TOKEN,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: { message?: string } };
        throw new Error(error.error?.message || 'Failed to publish to Facebook');
      }

      fbResponse = (await response.json()) as { id?: string };
    } else {
      // Post without image (text only)
      const url = `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}/feed`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          link: postUrl,
          access_token: process.env.FB_PAGE_ACCESS_TOKEN,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: { message?: string } };
        throw new Error(error.error?.message || 'Failed to publish to Facebook');
      }

      fbResponse = (await response.json()) as { id?: string };
    }

    // Update post with Facebook post ID
    post.facebookPostId = fbResponse.id;
    post.facebookSyncedAt = new Date();

    // Add facebook-sync tag if not already exists
    if (!post.tags.includes('facebook-sync')) {
      post.tags.push('facebook-sync');
    }

    await post.save();

    console.log(`✅ Published to Facebook: ${post.title} (FB ID: ${fbResponse.id})`);

    res.json({
      success: true,
      message: 'Đã đăng bài lên Facebook thành công!',
      data: {
        postId: post._id,
        facebookPostId: fbResponse.id,
        facebookUrl: `https://facebook.com/${fbResponse.id}`,
      },
    });
  } catch (error) {
    console.error('Publish to Facebook error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to publish to Facebook',
    });
  }
};

/**
 * POST /api/webhook/facebook/publish-batch
 * Publish multiple posts to Facebook
 */
export const publishBatchToFacebook = async (req: Request, res: Response) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một bài để đăng',
      });
    }

    if (!process.env.FB_PAGE_ACCESS_TOKEN) {
      return res.status(400).json({
        success: false,
        message: 'Facebook Page Access Token chưa được cấu hình',
      });
    }

    const results = {
      total: postIds.length,
      published: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const postId of postIds) {
      try {
        const post = await Post.findById(postId).populate('relatedCar', 'name slug');

        if (!post) {
          results.errors.push(`Không tìm thấy bài: ${postId}`);
          continue;
        }

        if (post.facebookPostId) {
          results.skipped++;
          continue;
        }

        // Build message (same logic as single publish)
        let message = '';
        const categoryEmoji =
          post.category === 'news'
            ? '📰'
            : post.category === 'promotion'
              ? '🎉'
              : post.category === 'event'
                ? '📅'
                : '⭐';

        message += `${categoryEmoji} ${post.title}\n\n`;

        if (post.excerpt) {
          message += `${post.excerpt}\n\n`;
        }

        const postUrl = `${CLIENT_URL}/posts/${post.slug}`;
        message += `👉 Xem chi tiết: ${postUrl}\n`;

        if (post.relatedCar && typeof post.relatedCar === 'object' && 'slug' in post.relatedCar) {
          const car = post.relatedCar as unknown as { name: string; slug: string };
          message += `🚗 Xem xe ${car.name}: ${CLIENT_URL}/cars/${car.slug}\n`;
        }

        // Publish
        const pageId = process.env.FB_PAGE_ID || 'me';
        const url = post.coverImage
          ? `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}/photos`
          : `https://graph.facebook.com/${FB_GRAPH_API_VERSION}/${pageId}/feed`;

        const body = post.coverImage
          ? { url: post.coverImage, message, access_token: process.env.FB_PAGE_ACCESS_TOKEN }
          : { message, link: postUrl, access_token: process.env.FB_PAGE_ACCESS_TOKEN };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = (await response.json()) as { error?: { message?: string } };
          results.errors.push(`${post.title}: ${error.error?.message || 'Failed'}`);
          continue;
        }

        const fbResponse = (await response.json()) as { id?: string };

        post.facebookPostId = fbResponse.id;
        post.facebookSyncedAt = new Date();
        if (!post.tags.includes('facebook-sync')) {
          post.tags.push('facebook-sync');
        }
        await post.save();

        results.published++;

        // Rate limiting - wait 2 seconds between posts
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        results.errors.push(`Lỗi: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    res.json({
      success: true,
      message: `Đã đăng ${results.published}/${results.total} bài lên Facebook`,
      data: results,
    });
  } catch (error) {
    console.error('Batch publish to Facebook error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to publish',
    });
  }
};
