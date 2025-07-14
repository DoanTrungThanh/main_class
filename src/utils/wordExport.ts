import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { ActivityReport } from '../types';

export const exportToWord = async (report: ActivityReport) => {
  // Tạo document Word
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header - Tiêu đề chính
          new Paragraph({
            children: [
              new TextRun({
                text: "BÁO CÁO HOẠT ĐỘNG Sự KIỆN",
                bold: true,
                size: 32,
                color: "2E74B5",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Đường kẻ ngang
          new Paragraph({
            children: [
              new TextRun({
                text: "═══════════════════════════════════════════════════════════════",
                color: "2E74B5",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 300,
            },
          }),

          // Thông tin báo cáo
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Tiêu đề:",
                            bold: true,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                    ],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: report.title,
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                    width: { size: 75, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Mô tả:",
                            bold: true,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: report.description || "Không có mô tả",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Ngày tạo:",
                            bold: true,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: new Date(report.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }),
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Trạng thái:",
                            bold: true,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: report.status === 'published' ? 'Đã xuất bản' :
                                  report.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ',
                            size: 24,
                            color: report.status === 'published' ? '28A745' : 
                                   report.status === 'draft' ? 'FFC107' : '6C757D',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Khoảng cách
          new Paragraph({
            children: [new TextRun({ text: "" })],
            spacing: { after: 400 },
          }),

          // Tiêu đề nội dung
          new Paragraph({
            children: [
              new TextRun({
                text: "NỘI DUNG BÁO CÁO",
                bold: true,
                size: 28,
                color: "2E74B5",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: 200,
              after: 300,
            },
          }),

          // Đường kẻ ngang nhỏ
          new Paragraph({
            children: [
              new TextRun({
                text: "─────────────────────────────────────────────────────────",
                color: "CCCCCC",
              }),
            ],
            spacing: {
              after: 300,
            },
          }),

          // Nội dung báo cáo
          ...report.content.split('\n').map(line => 
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ", // Thêm space cho dòng trống
                  size: 24,
                }),
              ],
              spacing: {
                after: 120,
              },
            })
          ),

          // Khoảng cách cuối
          new Paragraph({
            children: [new TextRun({ text: "" })],
            spacing: { after: 400 },
          }),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: "─────────────────────────────────────────────────────────",
                color: "CCCCCC",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Báo cáo được tạo bởi Hệ thống Quản lý Trung tâm`,
                italic: true,
                size: 20,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 100,
            },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`,
                italic: true,
                size: 20,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  // Tạo và tải file
  const blob = await Packer.toBlob(doc);
  const fileName = `${report.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
};
