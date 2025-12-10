import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import currency from 'currency.js';
import { CotizacionInput } from '@/shared/schemas';
import { CotizacionData, ProcessedSeccion, ProcessedItem } from '@/shared/types';

const formatCurrency = (value: number) => currency(value, { symbol: '$', separator: ',', decimal: '.' }).format();

export async function generateHTML(input: CotizacionInput): Promise<string> {
    // 1. Calculate Totals
    let subtotalVal = 0;
    const processedSecciones: ProcessedSeccion[] = input.secciones.map(seccion => {
        const items: ProcessedItem[] = seccion.items.map(item => {
            const importeVal = item.cantidad * item.precioUnitario;
            subtotalVal += importeVal;
            return {
                ...item,
                precioUnitario: formatCurrency(item.precioUnitario),
                importe: formatCurrency(importeVal),
            };
        });
        return { ...seccion, items };
    });

    const ivaVal = subtotalVal * 0.16;
    const totalVal = subtotalVal + ivaVal;

    const defaultNotas = [
        '60% anticipo, 40% contra aviso de entrega.'
    ];

    const data: CotizacionData = {
        cliente: input.cliente,
        fecha: input.fecha,
        folio: input.folio,
        secciones: processedSecciones,
        subtotal: formatCurrency(subtotalVal),
        iva: formatCurrency(ivaVal),
        total: formatCurrency(totalVal),
        notas: (input.notas && input.notas.length > 0) ? input.notas : defaultNotas,
    };

    // 2. Compile Template
    const templatePath = path.join(process.cwd(), 'templates/quotation.hbs');
    const templateHtml = await fs.readFile(templatePath, 'utf-8');

    // Read logo and convert to base64
    const logoPath = path.join(process.cwd(), 'public/logo.png');
    let logoBase64 = '';
    try {
        const logoBuffer = await fs.readFile(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
        console.warn('Logo not found or could not be read:', error);
    }

    const template = handlebars.compile(templateHtml);

    handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

    return template({ ...data, logo: logoBase64, rawData: input });
}

export async function generatePDFBuffer(input: CotizacionInput): Promise<Uint8Array> {
    const html = await generateHTML(input);

    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

    let browser;
    if (isProduction) {
      // Configuration for Vercel/Production - use @sparticuz/chromium
      const executablePath = await chromium.executablePath();
      if (!executablePath) {
        throw new Error('Chromium executable path not found');
      }

      browser = await puppeteer.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
      });
    } else {
      // Configuration for Local Development
      // puppeteer-core doesn't include Chrome, so we need to specify the path
      const executablePath = process.env.CHROME_EXECUTABLE_PATH ||
        process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';

      browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: {
            top: '0.5in',
            bottom: '0.5in',
            left: '0.75in',
            right: '0.75in',
        },
    });

    await browser.close();
    return pdfBuffer;
}
