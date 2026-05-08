'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Copy, Share2, BookOpen, Download, Printer, ImageDown, Loader2, RefreshCw, Heart, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { regenerarImagem } from '@/app/actions/acolhimento';

interface AcolhimentoDisplayProps {
  acolhimento: string;
  imageUrl?: string | null;
  sentimentoId: string | null;
  nome: string;
  onNovoAcolhimento: () => void;
}

interface Secao {
  titulo: string;
  icone: React.ReactNode;
  cor: string;
  corBg: string;
  corBorda: string;
  conteudo: string;
}

function parseSections(text: string, acolhimento: string): Secao[] {
  const sections: Secao[] = [];
  const lines = acolhimento.split('\n');
  let currentSection: string[] = [];
  let currentTitle = '';
  let found = false;

  for (const line of lines) {
    const headerMatch = line.match(/^##?\s*(.+)/);
    if (headerMatch) {
      const header = headerMatch[1].toLowerCase();
      if (header.includes('versiculo') || header.includes('palavra') || header.includes('📖')) {
        if (found && currentTitle) {
          sections.push(buildSecao(currentTitle, currentSection.join('\n').trim()));
        }
        currentTitle = 'Versículo para o Coração';
        currentSection = [];
        found = true;
      } else if (header.includes('acolhimento') || header.includes('conforto') || header.includes('💛')) {
        if (found && currentTitle) {
          sections.push(buildSecao(currentTitle, currentSection.join('\n').trim()));
        }
        currentTitle = 'Palavra de Acolhimento';
        currentSection = [];
        found = true;
      } else if (header.includes('oracao') || header.includes('pratica') || header.includes('🙏')) {
        if (found && currentTitle) {
          sections.push(buildSecao(currentTitle, currentSection.join('\n').trim()));
        }
        currentTitle = 'Oração para o Dia';
        currentSection = [];
        found = true;
      } else if (found) {
        currentSection.push(line);
      }
    } else if (found) {
      currentSection.push(line);
    }
  }

  if (currentTitle && currentSection.length > 0) {
    sections.push(buildSecao(currentTitle, currentSection.join('\n').trim()));
  }

  if (sections.length === 0) {
    return [{
      titulo: 'Acolhimento',
      icone: <Heart className="w-5 h-5" />,
      cor: 'text-teal-600',
      corBg: 'bg-teal-50',
      corBorda: 'border-teal-200/50',
      conteudo: cleanConteudo(acolhimento),
    }];
  }

  return sections;
}

function buildSecao(title: string, rawContent: string): Secao {
  const lower = title.toLowerCase();
  if (lower.includes('versiculo')) {
    return {
      titulo: title,
      icone: <BookOpen className="w-5 h-5" />,
      cor: 'text-teal-600',
      corBg: 'bg-teal-50',
      corBorda: 'border-teal-200/50',
      conteudo: cleanConteudo(rawContent),
    };
  }
  if (lower.includes('acolhimento') || lower.includes('conforto')) {
    return {
      titulo: title,
      icone: <Heart className="w-5 h-5" />,
      cor: 'text-sage-600',
      corBg: 'bg-sage-50',
      corBorda: 'border-sage-200/50',
      conteudo: cleanConteudo(rawContent),
    };
  }
  if (lower.includes('oracao')) {
    return {
      titulo: title,
      icone: <Sparkles className="w-5 h-5" />,
      cor: 'text-amber-600',
      corBg: 'bg-amber-50',
      corBorda: 'border-amber-200/50',
      conteudo: cleanConteudo(rawContent),
    };
  }
  return {
    titulo: title,
    icone: <Heart className="w-5 h-5" />,
    cor: 'text-teal-600',
    corBg: 'bg-teal-50',
    corBorda: 'border-teal-200/50',
    conteudo: cleanConteudo(rawContent),
  };
}

function cleanConteudo(text: string): string {
  return text
    .replace(/^##?\s*[^]*?\n/, '')
    .replace(/^---+\s*/gm, '')
    .trim();
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
  const [regenerating, setRegenerating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(imageUrl ?? null);

  const sections = parseSections(acolhimento, acolhimento);

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
    if (!currentImageUrl) return;
    try {
      const response = await fetch(currentImageUrl);
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
      window.open(currentImageUrl, '_blank');
    }
  };

  const handleRegenerarImagem = async () => {
    if (!sentimentoId) return;
    setRegenerating(true);
    setImageLoaded(false);
    setImageError(false);
    try {
      const result = await regenerarImagem(sentimentoId);
      if (result.success && result.imageUrl) {
        setCurrentImageUrl(result.imageUrl);
      }
    } catch {
      setImageError(true);
    } finally {
      setRegenerating(false);
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

    const drawSectionCard = (y: number, title: string, color: number[], bgColor: number[]) => {
      const cardHeight = 10;
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, margin + 6, y + 7);
      return y + cardHeight + 4;
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

    if (currentImageUrl) {
      try {
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        const imgWidth = contentWidth;
        const imgHeight = imgWidth * (900 / 720);
        const maxImgHeight = pageHeight * 0.4;
        const finalImgHeight = Math.min(imgHeight, maxImgHeight);

        if (y + finalImgHeight > pageHeight - margin) {
          doc.addPage();
          drawBackground();
          y = margin + 5;
        }

        doc.setDrawColor(45, 90, 97);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, imgWidth, finalImgHeight, 3, 3, 'S');
        doc.addImage(imgData, 'JPEG', margin + 0.5, y + 0.5, imgWidth - 1, finalImgHeight - 1);
        y += finalImgHeight + 8;
      } catch {
        console.warn('Failed to add image to PDF');
      }
    }

    const cleanText = cleanMarkdown(acolhimento);

    for (const secao of sections) {
      if (y > pageHeight - 40) {
        doc.addPage();
        drawBackground();
        y = margin + 10;
      }

      const colors: Record<string, number[][]> = {
        'text-teal-600': [[45, 90, 97], [234, 242, 241]],
        'text-sage-600': [[178, 194, 177], [240, 245, 239]],
        'text-amber-600': [[184, 153, 30], [251, 245, 230]],
      };
      const colorKey = secao.cor;
      const [textColor, bgColor] = colors[colorKey] || [[45, 90, 97], [234, 242, 241]];

      y = drawSectionCard(y, secao.titulo, textColor, bgColor);
      y += 2;
      y = addWrappedText(secao.conteudo, y, 10, [90, 112, 117], 'normal', 5.5);
      y += 4;
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
          ${currentImageUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${currentImageUrl}" style="max-width: 100%; height: auto; border-radius: 16px; max-height: 400px;" /></div>` : ''}
          <div class="content">${acolhimento.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
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
          <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary" title="Copiar">
            {copied ? <span className="text-teal-600 text-xs">Copiado!</span> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleDownloadPDF} className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary" title="Baixar PDF">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary" title="Imprimir">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={handleShare} className="p-2 rounded-lg hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary" title="Compartilhar">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Imagem gerada pela IA */}
      {currentImageUrl && (
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-teal-50 to-bg-primary">
          {regenerating || (!imageLoaded && !imageError && (
            <div className="w-full aspect-[4/5] flex flex-col items-center justify-center gap-3 animate-pulse">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <span className="text-text-secondary text-sm">{regenerating ? 'Regenerando arte...' : 'Gerando arte sacra...'}</span>
            </div>
          ))}
          {imageError && (
            <div className="w-full aspect-[4/5] flex flex-col items-center justify-center gap-3 bg-black/5">
              <span className="text-3xl">🎨</span>
              <span className="text-text-secondary text-sm">Arte indisponível</span>
            </div>
          )}
          <img
            src={currentImageUrl}
            alt="Arte Sacra — Acolhimento Maná AI"
            className={`w-full object-cover transition-opacity duration-700 ${imageLoaded && !regenerating ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            style={{ aspectRatio: '4/5', maxHeight: '480px' }}
            onLoad={() => { setImageLoaded(true); setImageError(false); }}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {imageLoaded && !regenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex gap-2"
            >
              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"
                title="Baixar Arte"
              >
                <ImageDown className="w-3.5 h-3.5" />
                Baixar
              </button>
              <button
                onClick={handleRegenerarImagem}
                disabled={regenerating}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors disabled:opacity-50"
                title="Nova Arte"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                Nova Arte
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Seções do acolhimento em cards separados */}
      <div className="p-4 md:p-6 space-y-4">
        {sections.map((secao, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${secao.corBg} ${secao.corBorda} border rounded-xl overflow-hidden`}
          >
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${secao.corBorda}`}>
              <span className={secao.cor}>{secao.icone}</span>
              <h4 className={`font-semibold text-sm ${secao.cor}`}>{secao.titulo}</h4>
            </div>
            <div className="px-4 py-3 text-sm text-text-secondary leading-relaxed">
              <ReactMarkdown>{secao.conteudo}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
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
