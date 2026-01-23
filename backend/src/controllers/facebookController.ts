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
async function processNewPost(postData: {
    post_id?: string;
    message?: string;
    photos?: string[];
}) {
    try {
        const { message, photos, post_id } = postData;

        if (!message) {
            console.log('⏭️ Skipping post without message');
            return;
        }

        console.log(`📥 Processing FB post: ${post_id}`);

        // Classify with AI
        const classification = await classifyContent(message, photos);
        console.log(`🤖 AI: ${classification.category} (${Math.round(classification.confidence * 100)}%)`);

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
                .filter(b => b.type === 'text')
                .map(b => b.content)
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
                .filter(b => b.type === 'text')
                .map(b => b.content)
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
