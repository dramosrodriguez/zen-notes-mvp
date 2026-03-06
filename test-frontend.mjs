import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`[BROWSER ERROR] ${error.message}`);
    });

    console.log("Navegando a localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Buscar el botón 'Nueva Nota' y hacer click
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text === 'Nueva Nota') {
            console.log("Haciendo click en Nueva Nota...");
            await btn.click();
            break;
        }
    }

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
