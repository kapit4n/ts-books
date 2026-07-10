import * as pdfjsLib from 'pdfjs-dist';
import { ImportedBook, BookOutline } from '../types/library';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function estimateReadingTime(pages: number): string {
  const minutes = Math.ceil(pages * 1.5);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export async function processPDF(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Omit<ImportedBook, 'id' | 'importedAt' | 'lastOpened'>> {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(10);

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  onProgress?.(30);

  const metadata = await pdf.getMetadata();
  const info = metadata.info as Record<string, unknown> || {};

  let title = (info.Title as string) || file.name.replace('.pdf', '');
  let author = (info.Author as string) || 'Unknown';

  onProgress?.(50);

  let outline: BookOutline[] = [];
  try {
    const pdfOutline = await pdf.getOutline();
    if (pdfOutline) {
      outline = pdfOutline.map((item) => ({
        title: item.title,
        pageNumber: 1,
        children: item.items?.map((child) => ({
          title: child.title,
          pageNumber: 1,
        })),
      }));
    }
  } catch {
    // Outline not available
  }

  onProgress?.(60);

  let thumbnail: string | null = null;
  try {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      await firstPage.render({ canvasContext: ctx, viewport }).promise;
      thumbnail = canvas.toDataURL('image/jpeg', 0.7);
    }
  } catch {
    // Thumbnail generation failed
  }

  onProgress?.(80);

  return {
    title,
    author,
    fileName: file.name,
    pageCount: pdf.numPages,
    pdfData: arrayBuffer,
    thumbnail,
    metadata: info,
    outline,
    category: 'PDF Import',
    tags: [],
    readingTimeEstimate: estimateReadingTime(pdf.numPages),
  };
}
