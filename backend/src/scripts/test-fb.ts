
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import Setting from '../models/Setting.js';

// Connect DB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car-showroom';

async function getFbConfig() {
    await mongoose.connect(MONGODB_URI);

    const tokenSetting = await Setting.findOne({ key: 'facebook_access_token' });
    const pageIdSetting = await Setting.findOne({ key: 'facebook_page_id' });

    return {
        FB_PAGE_ACCESS_TOKEN: tokenSetting?.value || process.env.FB_PAGE_ACCESS_TOKEN,
        FB_PAGE_ID: pageIdSetting?.value || process.env.FB_PAGE_ID
    };
}

console.log('--- Testing Facebook Configuration ---');
console.log('--- Testing Facebook Configuration ---');

async function testConnection() {
    try {
        const { FB_PAGE_ACCESS_TOKEN, FB_PAGE_ID } = await getFbConfig();

        console.log('FB_PAGE_ID:', FB_PAGE_ID);
        console.log('Token Length:', FB_PAGE_ACCESS_TOKEN?.length);
        console.log('Token Source:', FB_PAGE_ACCESS_TOKEN === process.env.FB_PAGE_ACCESS_TOKEN ? 'Env' : 'Database');

        if (!FB_PAGE_ACCESS_TOKEN || !FB_PAGE_ID) {
            console.error('❌ Missing configuration!');
            return;
        }

        // 1. Check "Me" (Token owner)
        console.log('\n1. Checking Token Owner (Me)...');
        const meRes = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${FB_PAGE_ACCESS_TOKEN}`);
        const meData = await meRes.json();
        console.log('Status:', meRes.status);
        console.log('Response:', JSON.stringify(meData, null, 2));

        // 2. Check Page
        console.log(`\n2. Checking Page (${FB_PAGE_ID})...`);
        const pageRes = await fetch(`https://graph.facebook.com/v18.0/${FB_PAGE_ID}?access_token=${FB_PAGE_ACCESS_TOKEN}`);
        const pageData = await pageRes.json();
        console.log('Status:', pageRes.status);
        console.log('Response:', JSON.stringify(pageData, null, 2));

        // 3. Check Posts
        console.log('\n3. Checking Posts Permissions...');
        const postsRes = await fetch(`https://graph.facebook.com/v18.0/${FB_PAGE_ID}/posts?limit=1&access_token=${FB_PAGE_ACCESS_TOKEN}`);
        const postsData = await postsRes.json();
        console.log('Status:', postsRes.status);
        if (!postsRes.ok) {
            console.log('❌ Error Response:', JSON.stringify(postsData, null, 2));
        } else {
            const data = (postsData as any).data;
            console.log('✅ Success! Found posts:', data?.length);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testConnection();
