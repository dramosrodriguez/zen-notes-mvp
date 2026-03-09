import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    console.log("-> 1. Navegando a localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Crear nota
    console.log("-> 2. Creando nueva nota...");
    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text === 'Nueva Nota') {
            await btn.click();
            break;
        }
    }

    // Esperar a que cargue el editor y cambiar título
    await page.waitForSelector('input[placeholder="Título de la nota"]', { timeout: 5000 });

    // Limpiar título inicial y escribir el nuevo
    await page.click('input[placeholder="Título de la nota"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[placeholder="Título de la nota"]', 'Mágia de Supabase Backend');

    // Escribir en editor Markdown
    await page.click('.ProseMirror'); // Editor container class defined in tiptap
    await page.keyboard.type(' Este texto se guarda en la nube automáticamente.');

    console.log("-> 3. Esperando al autoguardado (2.5s)...");
    await new Promise(r => setTimeout(r, 2500));

    // Borrar datos locales
    console.log("-> 4. Borrando datos de almacenamiento local (IndexedDB, LocalStorage)...");
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name); });
    });

    // Recargar página
    console.log("-> 5. Recargando la página con los datos locales en blanco...");
    await page.reload({ waitUntil: 'networkidle0' });

    // Comprobar estado en la lista
    const sidebarContent = await page.$eval('.flex-1', el => el.textContent);
    if (sidebarContent.includes('Mágia de Supabase Backend')) {
        console.log("✅ ÉXITO: La nota sobrevivió a la limpieza de caché local (Se descargó de Supabase)");
    } else {
        console.error("❌ FALLO: La nota NO sobrevivió a la recarga.");
    }

    // Borrar la nota
    console.log("-> 6. Eliminando la nota de prueba...");

    // Accept the upcoming conform dialog automatically
    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    // Encontrar el botón de borrar al lado de nuestra nota
    const deleteBtn = await page.$('button[title="Eliminar nota"]');
    if (deleteBtn) {
        // Para forzar la visibilidad del botón en hover usamos evaluate o hover directamente
        await page.evaluate((el) => {
            // @ts-ignore
            el.click();
        }, deleteBtn);

        await new Promise(r => setTimeout(r, 2000));

        const sidebarFinal = await page.$eval('.flex-1', el => el.textContent);
        if (!sidebarFinal.includes('Mágia de Supabase Backend')) {
            console.log("✅ ÉXITO: La nota se eliminó correctamente de la nube.");
        } else {
            console.error("❌ FALLO: Error al eliminar la nota.");
        }
    } else {
        console.log("❌ No se encontró la nota para borrarla.");
    }

    await browser.close();
})();
