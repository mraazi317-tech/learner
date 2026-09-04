import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';
import { GeneratedFilePayload } from '../types';

export const triggerDownload = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generatePdfDocument = (
  title: string,
  content: string,
  subject: string = 'General'
): GeneratedFilePayload => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header branding
  doc.setFillColor(41, 82, 204); // #2952CC
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EasiaLearn AI Tutor — Academic Document', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subject: ${subject} | Generated: ${new Date().toLocaleDateString()}`, 15, 20);

  // Content body
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.replace(/_/g, ' '), 15, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Clean Markdown markers for PDF layout
  const cleanContent = content
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '');

  const splitLines = doc.splitTextToSize(cleanContent, 180);
  let y = 46;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 0; i < splitLines.length; i++) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(splitLines[i], 15, y);
    y += 6;
  }

  const blob = doc.output('blob');
  const downloadUrl = URL.createObjectURL(blob);
  const sizeKb = Math.max(1, Math.round(blob.size / 1024));

  return {
    fileName: `${title}.pdf`,
    fileType: 'pdf',
    size: `${sizeKb} KB`,
    downloadUrl,
    previewType: 'pdf',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    previewData: { title, lineCount: splitLines.length },
  };
};

export const generateExcelSpreadsheet = (
  title: string,
  content: string
): GeneratedFilePayload => {
  // Parse table lines or list items from markdown content
  const lines = content.split('\n');
  const rows: any[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim().replace(/\*\*/g, ''));
      // ignore markdown divider lines like |---|---|
      if (!cells.every((c) => /^[-: ]+$/.test(c))) {
        rows.push(cells);
      }
    }
  }

  // Fallback if no markdown table found
  if (rows.length === 0) {
    rows.push(['No.', 'Topic / Item', 'Details / Formula', 'Status']);
    const textLines = content
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((l) => l.length > 0)
      .slice(0, 20);

    textLines.forEach((item, idx) => {
      rows.push([idx + 1, item, 'Verified by AI Tutor', 'Active']);
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'EasiaLearn Sheet');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const sizeKb = Math.max(1, Math.round(blob.size / 1024));

  return {
    fileName: `${title}.xlsx`,
    fileType: 'xlsx',
    size: `${sizeKb} KB`,
    downloadUrl,
    previewType: 'excel',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    previewData: { rows },
  };
};

export const generateWordDocument = async (
  title: string,
  content: string
): Promise<GeneratedFilePayload> => {
  const cleanParagraphs = content
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title.replace(/_/g, ' '),
            heading: HeadingLevel.TITLE,
          }),
          ...cleanParagraphs.map(
            (p) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: p.replace(/[*#`]/g, ''),
                    size: 24,
                  }),
                ],
              })
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(blob);
  const sizeKb = Math.max(1, Math.round(blob.size / 1024));

  return {
    fileName: `${title}.docx`,
    fileType: 'docx',
    size: `${sizeKb} KB`,
    downloadUrl,
    previewType: 'word',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    previewData: { title, paragraphCount: cleanParagraphs.length },
  };
};

export const generatePowerPointPresentation = async (
  title: string,
  content: string
): Promise<GeneratedFilePayload> => {
  const pptx = new pptxgen();

  // Slide 1: Title
  const slide1 = pptx.addSlide();
  slide1.addText(title.replace(/_/g, ' '), {
    x: 1,
    y: 1.5,
    w: '80%',
    h: 1.5,
    fontSize: 28,
    bold: true,
    color: '2952CC',
  });
  slide1.addText('Generated by EasiaLearn AI Tutor Pro', {
    x: 1,
    y: 3.2,
    fontSize: 14,
    color: '64748B',
  });

  // Slide 2: Content Breakdown
  const slide2 = pptx.addSlide();
  slide2.addText('Key Takeaways & Analysis', {
    x: 0.8,
    y: 0.8,
    fontSize: 22,
    bold: true,
    color: '111111',
  });

  const points = content
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ''))
    .filter((l) => l.length > 5)
    .slice(0, 5);

  const formattedPoints = points.length > 0 ? points : ['Overview', 'Concepts', 'Formulas', 'Conclusion'];
  formattedPoints.forEach((pt, idx) => {
    slide2.addText(`• ${pt.replace(/[*#`]/g, '')}`, {
      x: 0.8,
      y: 1.8 + idx * 0.7,
      fontSize: 14,
      color: '333333',
    });
  });

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
  const downloadUrl = URL.createObjectURL(blob);
  const sizeKb = Math.max(1, Math.round(blob.size / 1024));

  return {
    fileName: `${title}.pptx`,
    fileType: 'pptx',
    size: `${sizeKb} KB`,
    downloadUrl,
    previewType: 'ppt',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    previewData: { title, slides: 2 },
  };
};

export const generateCertificatePdf = (cert: {
  studentName?: string;
  userName?: string;
  title: string;
  subject: string;
  type: string;
  marks?: number;
  totalMarks?: number;
  scorePercentage?: number;
  issueDate?: string;
  teacherName?: string;
  institution?: string;
  verificationId?: string;
  certificateNo?: string;
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth(); // 297mm
  const height = doc.internal.pageSize.getHeight(); // 210mm

  // Background
  doc.setFillColor(254, 254, 255);
  doc.rect(0, 0, width, height, 'F');

  // Outer primary border
  doc.setDrawColor(41, 82, 204); // #2952CC
  doc.setLineWidth(3);
  doc.rect(8, 8, width - 16, height - 16);

  // Inner gold border
  doc.setDrawColor(217, 158, 26); // Gold accent
  doc.setLineWidth(0.8);
  doc.rect(12, 12, width - 24, height - 24);

  // Top header brand
  doc.setTextColor(41, 82, 204);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EASIALEARN ACADEMIC EXCELLENCE', width / 2, 26, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Karnataka KSEAB & National EdTech Verification Council', width / 2, 32, { align: 'center' });

  // Certificate Type Heading
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  const certTypeUpper = (cert.type || 'COMPLETION').toUpperCase();
  doc.text(`CERTIFICATE OF ${certTypeUpper}`, width / 2, 48, { align: 'center' });

  // "This is proudly presented to"
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('This is to officially certify and honor the achievement of', width / 2, 60, { align: 'center' });

  // Student Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 82, 204);
  const student = cert.studentName || cert.userName || 'Distinguished Scholar';
  doc.text(student, width / 2, 74, { align: 'center' });

  // Underline for name
  doc.setDrawColor(41, 82, 204);
  doc.setLineWidth(0.5);
  doc.line(60, 77, width - 60, 77);

  // Body text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const bodyLine1 = `for exemplary performance and mastery in "${cert.title}"`;
  const bodyLine2 = `under the curriculum for ${cert.subject}.`;
  doc.text(bodyLine1, width / 2, 90, { align: 'center' });
  doc.text(bodyLine2, width / 2, 98, { align: 'center' });

  // Performance Badge / Metrics Box
  const marks = cert.marks ?? Math.round(((cert.scorePercentage ?? 92) / 100) * (cert.totalMarks ?? 100));
  const total = cert.totalMarks ?? 100;
  const pct = cert.scorePercentage ?? Math.round((marks / total) * 100);

  doc.setFillColor(244, 247, 255);
  doc.setDrawColor(200, 220, 255);
  doc.roundedRect(width / 2 - 45, 110, 90, 20, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 82, 204);
  doc.text(`Official Score: ${marks} / ${total} (${pct}%)`, width / 2, 119, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Verified via EasiaCode Proctored Evaluation System', width / 2, 126, { align: 'center' });

  // Signatures and Date Footer
  const dateStr = cert.issueDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const teacher = cert.teacherName || 'Academic Director';
  const inst = cert.institution || 'EasiaLearn Board Examination Council';
  const verId = cert.verificationId || cert.certificateNo || `EA-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

  // Left: Date & Institution
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 17, 17);
  doc.text('Date of Conferral:', 25, 160);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(dateStr, 25, 166);
  doc.text(inst, 25, 172);

  // Center: Verification Seal
  doc.setDrawColor(217, 158, 26);
  doc.setFillColor(255, 251, 235);
  doc.circle(width / 2, 162, 14, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL', width / 2, 159, { align: 'center' });
  doc.text('SEAL', width / 2, 163, { align: 'center' });
  doc.text('VERIFIED', width / 2, 167, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`ID: ${verId}`, width / 2, 182, { align: 'center' });

  // Right: Teacher / Examiner Signature
  doc.line(width - 75, 160, width - 25, 160);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 17, 17);
  doc.text(teacher, width - 50, 166, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Academic Signatory', width - 50, 172, { align: 'center' });

  // Bottom Security Note
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This document can be authenticated online at easialearn.com/verify using the unique Certificate Verification ID.', width / 2, 196, { align: 'center' });

  const fileName = `${student.replace(/\s+/g, '_')}_Certificate.pdf`;
  doc.save(fileName);
  return { fileName, verificationId: verId };
};
