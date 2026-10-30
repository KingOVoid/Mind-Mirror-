// Polyfill Stage 3 / 4 methods required by pdfjs-dist v6 in browser / Node runtimes
if (typeof Uint8Array !== 'undefined' && !(Uint8Array.prototype as any).toHex) {
  (Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map((b: any) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

if (typeof Math !== 'undefined' && !(Math as any).sumPrecise) {
  (Math as any).sumPrecise = function (items: Iterable<number>) {
    let sum = 0;
    for (const n of items) {
      sum += Number(n) || 0;
    }
    return sum;
  };
}

import JSZip from 'jszip';

export interface ParsedDocument {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' | 'unknown';
  wordCount: number;
}

/**
 * Extracts raw textual content from DOCX files by parsing word/document.xml
 */
async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid DOCX file: word/document.xml missing');
  }

  const xmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  // Extract all paragraphs
  const paragraphs = xmlDoc.getElementsByTagName('w:p');
  const extractedLines: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const texts = p.getElementsByTagName('w:t');
    let line = '';
    for (let j = 0; j < texts.length; j++) {
      line += texts[j].textContent || '';
    }
    if (line.trim()) {
      extractedLines.push(line.trim());
    }
  }

  return extractedLines.join('\n\n');
}

/**
 * Extracts text from PPTX files by parsing ppt/slides/slide*.xml
 */
async function parsePptx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find all slide XML files
  const slidePaths = Object.keys(zip.files)
    .filter((path) => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

  if (slidePaths.length === 0) {
    throw new Error('Invalid PPTX file: No slides found');
  }

  const extractedSlides: string[] = [];
  const parser = new DOMParser();

  for (let i = 0; i < slidePaths.length; i++) {
    const slideFile = zip.file(slidePaths[i]);
    if (!slideFile) continue;

    const xmlText = await slideFile.async('text');
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const paragraphs = xmlDoc.getElementsByTagName('a:p');
    const slideLines: string[] = [];

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const p = paragraphs[pIdx];
      const texts = p.getElementsByTagName('a:t');
      let pText = '';
      for (let tIdx = 0; tIdx < texts.length; tIdx++) {
        pText += texts[tIdx].textContent || '';
      }
      if (pText.trim()) {
        slideLines.push(pText.trim());
      }
    }

    if (slideLines.length > 0) {
      extractedSlides.push(`[Slide ${i + 1}]\n${slideLines.join('\n')}`);
    }
  }

  return extractedSlides.join('\n\n---\n\n');
}

/**
 * Parses PDF using pdfjs-dist with fallback text extraction
 */
async function parsePdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker source gracefully
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '6.4.299'}/pdf.worker.min.mjs`;
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const pageTexts: string[] = [];

    const maxPages = Math.min(pdf.numPages, 60);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      if (strings.length > 0) {
        pageTexts.push(`[Page ${pageNum}]\n${strings.join(' ')}`);
      }
    }

    if (pageTexts.length > 0) {
      return pageTexts.join('\n\n');
    }
  } catch (err: any) {
    console.warn('[DocumentParser] pdfjs-dist extraction warning:', err?.message || err);
  }

  // Fallback: extract ASCII / readable strings directly from PDF binary buffer
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let raw = '';
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    // Printable ASCII or newline/tab
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9) {
      raw += String.fromCharCode(byte);
    } else {
      raw += ' ';
    }
  }

  // Regex extract text inside PDF parentheses (text objects)
  const matches = raw.match(/\(([^()]{3,})\)/g);
  if (matches && matches.length > 0) {
    const cleaned = matches
      .map((m) => m.slice(1, -1).trim())
      .filter((s) => s.length > 2 && !/^[0-9\s.]+$/.test(s) && !s.includes('/Filter') && !s.includes('/Type'));
    if (cleaned.length > 0) {
      return cleaned.join(' ');
    }
  }

  return raw.replace(/<<[^>]+>>/g, ' ').replace(/\/[\w]+/g, ' ').replace(/\s+/g, ' ').slice(0, 5000);
}

/**
 * Universal document text extractor supporting PDF, DOCX, PPTX, TXT, MD
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocument> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  let text = '';
  let fileType: ParsedDocument['fileType'] = 'unknown';

  if (extension === 'docx') {
    fileType = 'docx';
    text = await parseDocx(file);
  } else if (extension === 'pptx') {
    fileType = 'pptx';
    text = await parsePptx(file);
  } else if (extension === 'pdf') {
    fileType = 'pdf';
    text = await parsePdf(file);
  } else if (extension === 'txt' || extension === 'md') {
    fileType = extension === 'md' ? 'md' : 'txt';
    text = await file.text();
  } else {
    // Attempt text read as fallback
    try {
      text = await file.text();
      fileType = 'txt';
    } catch {
      throw new Error(`Unsupported document format .${extension}. Please upload a PDF, DOCX, or PPTX file.`);
    }
  }

  const cleanText = text.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  return {
    text: cleanText,
    fileName,
    fileType,
    wordCount,
  };
}
