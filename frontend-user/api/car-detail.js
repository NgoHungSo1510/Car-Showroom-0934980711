

export default async function handler(req, res) {
    const { slug } = req.query;
    const userAgent = req.headers['user-agent'] || '';

    // Check if request is from a bot/crawler (Facebook, Zalo, etc.)
    const isBot = /facebookexternalhit|Facebot|Zalo|Twitterbot|Pinterest|Googlebot|WhatsApp|Telegram/i.test(userAgent);

    // If not a bot and not requesting the raw data, just serve index.html (client-side routing)
    // But wait, Vercel rewrites usually supersede this. 
    // If we rewrite /cars/:slug to this API, ALL traffic goes here.
    // We should serve the HTML with injected tags for EVERYONE, or at least for bots.
    // Serving for everyone is safer for consistency.

    try {
        // 1. Get the original index.html
        // In Vercel serverless environment, static files are usually in process.cwd() or similar.
        // For Vercel, simpler approach is fetching the live URL or reading file if bundled.
        // Let's try reading from the build output location.
        // Note: 'process.cwd()' in Vercel function might not point to dist directly.
        // Improved strategy: Fetch the static HTML from the deployment URL (or assume structure).
        // Safest strategy for Vercel + Vite:
        // We will respond with the index.html content but replaced with our tags.

        // However, reading local file in Vercel function can be tricky depending on config.
        // Let's try to fetch the index.html from the headers host or hardcoded relative path if possible.
        // Actually, simpler: define the minimal HTML structure or read from a known path.
        // But we need the built JS bundles script tags to work for the user.

        // LET'S USE A DIFFERENT APPROACH:
        // Fetch the index.html from the current deployment
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['host'];
        const baseUrl = `${protocol}://${host}`;

        const indexResponse = await fetch(`${baseUrl}/index.html`);
        let html = await indexResponse.text();

        // 2. Fetch Car Data
        const API_URL = process.env.VITE_API_URL || 'https://car-showroom-backend.onrender.com/api'; // Fallback to assumed prod URL or env
        const carResponse = await fetch(`${API_URL}/cars/${slug}`);

        if (carResponse.ok) {
            const responseData = await carResponse.json();
            const car = responseData.data;

            if (car) {
                // 3. Inject OG Tags
                const title = `${car.name} - VinFast Miền Trung`;
                const description = car.description?.substring(0, 200) || `Chi tiết xe ${car.name} giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price)}`;
                const image = car.thumbnail || car.gallery?.[0] || 'https://car-showroom-0934980711.vercel.app/vinfast-logo.svg';

                // Replace title
                html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

                // Replace or Add Meta Tags
                const metaTags = `
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${image}" />
          <meta property="og:url" content="${baseUrl}/cars/${slug}" />
          <meta property="og:type" content="article" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title}" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${image}" />
        `;

                // Insert before </head>
                html = html.replace('</head>', `${metaTags}</head>`);
            }
        }

        // 4. Return HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        console.error('SSR Error:', error);
        // Fallback to basic redirect or showing index.html without dynamic tags
        try {
            const protocol = req.headers['x-forwarded-proto'] || 'https';
            const host = req.headers['host'];
            const indexResponse = await fetch(`${protocol}://${host}/index.html`);
            const html = await indexResponse.text();
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        } catch (e) {
            res.status(500).send('Internal Server Error');
        }
    }
}
