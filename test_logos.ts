import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function generateLogos() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');

            body {
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: transparent;
            }

            .logo-container {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .text-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }

            /* 512x512 inline version */
            .logo-512 .text-container {
                flex-direction: row;
                gap: 20px;
            }

            /* 192x192 stacked version */
            .logo-192 .text-container {
                flex-direction: column;
                gap: 5px;
                /* Move down slightly as requested */
                transform: translateY(15px);
            }

            .moment, .stash {
                font-family: 'Playfair Display', serif;
                font-style: italic;
                font-weight: 600;
                margin: 0;
                padding: 0;
            }

            /* Colors for Light Theme */
            .light .moment { color: #2C1810; } /* text-foreground */
            .light .stash { color: #E86B4C; } /* accent color */

            /* Colors for Dark Theme */
            .dark .moment { color: #F6F5F3; } /* text-foreground */
            .dark .stash { color: #FF8F73; } /* accent color */

            /* Backgrounds for Splash Screen (512x512) */
            .light.bg { background-color: #F6F5F3; } /* paper color */
            .dark.bg { background-color: #141414; } /* paper color */

        </style>
    </head>
    <body>
        <div id="target" class="logo-container">
            <div class="text-container">
                <span class="moment">Moment</span>
                <span class="stash">Stash</span>
            </div>
        </div>
    </body>
    </html>
    `;

    const htmlPath = path.resolve('temp_logo.html');
    fs.writeFileSync(htmlPath, htmlContent);

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`);

    // Wait for font to load
    await page.evaluate(() => document.fonts.ready);

    const target = page.locator('#target');

    async function capture(filename, width, height, theme, isSplash) {
        await page.setViewportSize({ width, height });

        // Reset classes
        await page.evaluate(() => {
            const el = document.getElementById('target');
            el.className = 'logo-container';
        });

        const fontScale = width === 512 ? 3 : 1;
        const fontSize = width === 512 ? 100 : 40;

        await page.evaluate(({ theme, width, isSplash, fontSize }) => {
            const el = document.getElementById('target');
            el.classList.add(theme);
            if (isSplash) el.classList.add('bg');
            if (width === 512) el.classList.add('logo-512');
            if (width === 192) el.classList.add('logo-192');

            el.style.width = `${width}px`;
            el.style.height = `${width}px`;

            const momentEl = document.querySelector('.moment');
            const stashEl = document.querySelector('.stash');
            momentEl.style.fontSize = `${fontSize}px`;
            stashEl.style.fontSize = `${fontSize}px`;

        }, { theme, width, isSplash, fontSize });

        const clip = await target.boundingBox();

        await page.screenshot({
            path: `public/${filename}`,
            clip: clip,
            omitBackground: !isSplash // Important for transparency on app icons
        });
        console.log(`Generated ${filename}`);
    }

    // Generate App Icons (192x192, stacked, transparent background)
    await capture('logo-192.png', 192, 192, 'light', false);
    await capture('logo-dark-192.png', 192, 192, 'dark', false);

    // Generate Splash Screens (512x512, inline, solid background)
    await capture('logo-512.png', 512, 512, 'light', true);
    await capture('logo-dark-512.png', 512, 512, 'dark', true);

    await browser.close();
    fs.unlinkSync(htmlPath);
}

generateLogos().catch(console.error);
