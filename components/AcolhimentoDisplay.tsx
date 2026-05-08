'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Share2, BookOpen, Download, Printer, ImageDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AcolhimentoDisplayProps {
  acolhimento: string;
  imageUrl?: string | null;
  sentimentoId: string | null;
  nome: string;
  onNovoAcolhimento: () => void;
}

export default function AcolhimentoDisplay({
  acolhimento,
  imageUrl,
  sentimentoId,
  nome,
  onNovoAcolhimento,
}: AcolhimentoDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(acolhimento);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^[-*]\s/gm, '\u2022 ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mana-ai-${nome.split(' ')[0].toLowerCase()}-${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const drawBackground = () => {
      doc.setFillColor(249, 247, 242);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    const drawHeader = (y: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.setTextColor(45, 90, 97);
      doc.text('✦ Mana AI', pageWidth / 2, y, { align: 'center' });
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(90, 112, 117);
      doc.text('Acolhimento Espiritual Diario', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.setDrawColor(45, 90, 97);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      return y;
    };

    const drawMeta = (y: number) => {
      const boxWidth = (contentWidth - 10) / 2;
      const items = [
        { label: 'Nome', value: nome },
        { label: 'Data', value: new Date().toLocaleDateString('pt-BR') },
      ];

      items.forEach((item, i) => {
        const x = margin + i * (boxWidth + 5);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(45, 90, 97);
        doc.roundedRect(x, y, boxWidth, 14, 2, 2, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(90, 112, 117);
        doc.text(item.label, x + 3, y + 5);
        doc.setFontSize(10);
        doc.setTextColor(26, 46, 51);
        doc.text(item.value, x + 3, y + 10);
      });

      return y + 20;
    };

    const drawSectionTitle = (y: number, title: string, color: number[]) => {
      doc.setDrawColor(45, 90, 97);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 8, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, margin + 12, y);
      return y + 7;
    };

    const addWrappedText = (text: string, y: number, fontSize: number, color: number[], font: string, lineHeight: number): number => {
      doc.setFont('helvetica', font as 'normal' | 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, contentWidth);
      let currentY = y;

      for (const line of lines) {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          drawBackground();
          currentY = margin + 10;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      }

      return currentY;
    };

    drawBackground();

    let y = 20;
    y = drawHeader(y);
    y += 4;
    y = drawMeta(y);
    y += 6;

    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        const imgWidth = contentWidth;
        const imgHeight = imgWidth * (900 / 720);
        const maxImgHeight = pageHeight * 0.4;

        let finalImgHeight = Math.min(imgHeight, maxImgHeight);
        let finalImgWidth = imgWidth;

        if (y + finalImgHeight > pageHeight - margin) {
          doc.addPage();
          drawBackground();
          y = margin + 5;
        }

        doc.setDrawColor(45, 90, 97);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, finalImgWidth, finalImgHeight, 3, 3, 'S');
        doc.addImage(imgData, 'JPEG', margin + 0.5, y + 0.5, finalImgWidth - 1, finalImgHeight - 1);
        y += finalImgHeight + 8;
      } catch {
        console.warn('Failed to add image to PDF');
      }
    }

    const cleanText = cleanMarkdown(acolhimento);
    const sections = cleanText.split(/\n\s*\n/);
    let isFirst = true;

    for (const section of sections) {
      const lines = section.split('\n');
      let title: string | null = null;
      let body: string[] = [];

      for (const line of lines) {
        if (line.includes('Versiculo') || line.includes('Palavra')) {
          title = 'Palavra do Senhor';
        } else if (line.includes('Acolhimento') || line.includes('Conforto')) {
          title = 'Acolhimento';
        } else if (line.includes('Oracao') || line.includes('Oracão') || line.includes('Pratica')) {
          title = 'Oração para o Dia';
        } else if (line.startsWith('\u2022 ') || line.length > 5) {
          body.push(line.replace(/^\u2022 /, ''));
        }
      }

      if (!title) {
        title = 'Acolhimento';
        body = lines.filter(l => l.length > 5);
      }

      if (y > pageHeight - 40) {
        doc.addPage();
        drawBackground();
        y = margin + 10;
      }

      if (!isFirst) y += 3;
      y = drawSectionTitle(y, title, isFirst ? [184, 153, 30] : [45, 90, 97]);
      isFirst = false;

      if (body.length > 0) {
        const bodyText = body.join('\n\n');
        y = addWrappedText(bodyText, y, 10, [90, 112, 117], 'normal', 5.5);
      }

      y += 2;
    }

    if (y > pageHeight - 25) {
      doc.addPage();
      drawBackground();
      y = margin + 10;
    }

    doc.setDrawColor(45, 90, 97);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 112, 117);
    doc.text(`Gerado por Mana AI • ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, y, { align: 'center' });

    doc.save(`acolhimento-${nome.split(' ')[0].toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Meu Acolhimento - Maná AI',
        text: acolhimento,
      });
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Acolhimento - Mana AI</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #F9F7F2; color: #1a2e33; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid rgba(45,90,97,0.2); margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 700; color: #2D5A61; }
            .meta { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
            .meta-item { background: rgba(255,255,255,0.6); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(45,90,97,0.1); }
            .meta-label { font-size: 12px; color: #5a7075; }
            .meta-value { font-size: 16px; font-weight: 600; }
            .content { color: #5a7075; line-height: 1.8; white-space: pre-wrap; }
            h3 { color: #2D5A61; margin: 24px 0 12px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">✦ Mana AI</div>
            <div class="subtitle" style="color: #5a7075; font-size: 14px; margin-top: 8px;">Acolhimento Espiritual Diario</div>
          </div>
          <div class="meta">
            <div class="meta-item"><div class="meta-label">Nome</div><div class="meta-value">${nome}</div></div>
            <div class="meta-item"><div class="meta-label">Data</div><div class="meta-value">${new Date().toLocaleDateString('pt-BR')}</div></div>
          </div>
          ${imageUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${imageUrl}" style="max-width: 100%; height: auto; border-radius: 16px; max-height: 400px;" /></div>` : ''}
          <div class="content">${acolhimento.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card backdrop-blur-sm border border-border-soft rounded-2xl overflow-hidden"
    >
      <div className="bg-teal-50 px-4 md:px-6 py-3 md:py-4 border-b border-border-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-teal-500" />
          <h3 className="text-base md:text-lg font-semibold text-text-primary">
            Acolhimento para {nome.split(' ')[0]}
          </h3>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
            title="Copiar"
          >
            {copied ? (
              <span className="text-teal-600 text-xs">Copiado!</span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
            title="Baixar PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Imagem gerada pela IA */}
      {imageUrl && (
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-teal-50 to-bg-primary">
          {!imageLoaded && !imageError && (
            <div className="w-full aspect-[4/5] flex flex-col items-center justify-center gap-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <span className="text-text-secondary text-sm">Gerando arte sacra...</span>
            </div>
          )}
          {imageError && (
            <div className="w-full aspect-[4/5] flex flex-col items-center justify-center gap-3 bg-black/5">
              <span className="text-3xl">🎨</span>
              <span className="text-text-secondary text-sm">Arte indisponível</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt="Arte Sacra — Acolhimento Maná AI"
            className={`w-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            style={{ aspectRatio: '4/5', maxHeight: '480px' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {imageLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 right-3 md:bottom-4 md:right-4"
            >
              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
                title="Baixar Arte"
              >
                <ImageDown className="w-3.5 h-3.5" />
                Baixar Arte
              </button>
            </motion.div>
          )}
        </div>
      )}

      <div className="p-4 md:p-6 max-h-[500px] overflow-y-auto">
        <div className="markdown-content">
          <ReactMarkdown>{acolhimento}</ReactMarkdown>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 border-t border-border-soft">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNovoAcolhimento}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 rounded-xl glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Novo Acolhimento
        </motion.button>
      </div>
    </motion.div>
  );
}
