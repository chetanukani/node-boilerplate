import pdfmake from "pdfmake";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/ApiError.js";

// Initialize fonts using standard PDF fonts (built into PDF readers)
const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

pdfmake.setFonts(fonts);

// Define default policies to prevent warning logs
pdfmake.setUrlAccessPolicy(() => true);
pdfmake.setLocalAccessPolicy(() => true);

/**
 * Generate a sample PDF showing all available document elements.
 * @route GET /api/v1/pdf/generate
 */
export const generatePdf = async (req, res, next) => {
  try {
    // 1x1 pixel solid red PNG as a visible placeholder for images
    const base64Image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    const docDefinition = {
      defaultStyle: {
        font: "Helvetica",
        fontSize: 10,
        color: "#333333",
      },
      pageMargins: [40, 60, 40, 60], // [left, top, right, bottom]

      // Dynamic Header (Header is called on each page)
      header: (currentPage, _pageCount) => {
        return {
          columns: [
            {
              text: "Antigravity PDF Service",
              alignment: "left",
              fontSize: 8,
              color: "#888888",
            },
            {
              text: `Confidential Document - Page ${currentPage}`,
              alignment: "right",
              fontSize: 8,
              color: "#888888",
            },
          ],
          margin: [40, 20, 40, 0],
        };
      },

      // Dynamic Footer (Footer is called on each page)
      footer: (currentPage, pageCount) => {
        return {
          stack: [
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  lineWidth: 0.5,
                  strokeColor: "#E2E8F0",
                },
              ],
            },
            {
              columns: [
                {
                  text: "Generated on demand by Node.js 24 + pdfmake",
                  fontSize: 8,
                  color: "#A0AEC0",
                },
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  alignment: "right",
                  fontSize: 8,
                  color: "#A0AEC0",
                },
              ],
              margin: [0, 8, 0, 0],
            },
          ],
          margin: [40, 0, 40, 20],
        };
      },

      content: [
        // Title Block
        {
          columns: [
            {
              stack: [
                {
                  text: "INVOICE & SYSTEM REPORT",
                  fontSize: 24,
                  bold: true,
                  color: "#1A365D",
                },
                {
                  text: "A Showcase of Node.js PDF Generation Features",
                  fontSize: 10,
                  color: "#4A5568",
                  margin: [0, 4, 0, 15],
                },
              ],
            },
            {
              // Image Element
              image: base64Image,
              width: 50,
              height: 50,
              alignment: "right",
            },
          ],
        },

        // Divider Line (Vector Drawing)
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 2,
              strokeColor: "#3182CE",
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Text & Styles Showcase
        {
          text: "1. Typography and Styled Text",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          text: [
            "This document illustrates various capabilities of the generator. You can use standard typography elements like ",
            { text: "bold text", bold: true },
            ", ",
            { text: "italicized text", italic: true },
            ", ",
            { text: "colored text (e.g. Red)", color: "#E53E3E" },
            ", or combine them all like ",
            {
              text: "bold red italics",
              bold: true,
              color: "#E53E3E",
              italic: true,
            },
            ". You can also specify different font sizes and custom alignments.",
          ],
          margin: [0, 0, 0, 15],
        },

        // Columns Layout Showcase
        {
          text: "2. Column Grids (Multi-column system)",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: "Billing Information",
                  bold: true,
                  margin: [0, 0, 0, 4],
                },
                { text: "Acme Corporation Inc." },
                { text: "123 Business Rd, Suite 100" },
                { text: "Silicon Valley, CA 94025" },
              ],
            },
            {
              width: "*",
              stack: [
                {
                  text: "Metadata & Details",
                  bold: true,
                  margin: [0, 0, 0, 4],
                },
                { text: [{ text: "Invoice #: ", bold: true }, "INV-2026-001"] },
                {
                  text: [
                    { text: "Created Date: ", bold: true },
                    new Date().toLocaleDateString(),
                  ],
                },
                {
                  text: [
                    { text: "Due Date: ", bold: true },
                    "30 Days from Issue",
                  ],
                },
              ],
            },
            {
              width: "auto",
              stack: [
                {
                  text: "Total Amount",
                  bold: true,
                  margin: [0, 0, 0, 4],
                  alignment: "right",
                },
                {
                  text: "$12,450.00",
                  fontSize: 18,
                  bold: true,
                  color: "#2F855A",
                  alignment: "right",
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Lists Showcase
        {
          text: "3. Bullet and Numbered Lists",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          columns: [
            {
              width: "50%",
              stack: [
                {
                  text: "Deliverable Items (Bullet List):",
                  bold: true,
                  margin: [0, 0, 0, 4],
                },
                {
                  ul: [
                    "Complete API architecture design",
                    "Database schema implementation",
                    "Scalable PDF generation subsystem",
                    "Unit and integration testing",
                  ],
                },
              ],
            },
            {
              width: "50%",
              stack: [
                {
                  text: "Project Milestones (Numbered List):",
                  bold: true,
                  margin: [0, 0, 0, 4],
                },
                {
                  ol: [
                    "Requirements Gathering & Planning",
                    "Foundation & Core Setup",
                    "Feature Implementation",
                    "Security Audit & Optimization",
                  ],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Table Showcase
        {
          text: "4. Tabular Data (Custom Grid/Table)",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              // Header Row
              [
                {
                  text: "Description",
                  bold: true,
                  fillColor: "#EDF2F7",
                  margin: [6, 6, 6, 6],
                },
                {
                  text: "Quantity",
                  bold: true,
                  fillColor: "#EDF2F7",
                  alignment: "center",
                  margin: [6, 6, 6, 6],
                },
                {
                  text: "Unit Price",
                  bold: true,
                  fillColor: "#EDF2F7",
                  alignment: "right",
                  margin: [6, 6, 6, 6],
                },
                {
                  text: "Amount",
                  bold: true,
                  fillColor: "#EDF2F7",
                  alignment: "right",
                  margin: [6, 6, 6, 6],
                },
              ],
              // Row 1
              [
                {
                  text: "Senior Software Architect Consultation",
                  margin: [6, 6, 6, 6],
                },
                { text: "40 hrs", alignment: "center", margin: [6, 6, 6, 6] },
                { text: "$150.00", alignment: "right", margin: [6, 6, 6, 6] },
                { text: "$6,000.00", alignment: "right", margin: [6, 6, 6, 6] },
              ],
              // Row 2
              [
                {
                  text: "Database Integration and Clustering Setup",
                  margin: [6, 6, 6, 6],
                },
                { text: "25 hrs", alignment: "center", margin: [6, 6, 6, 6] },
                { text: "$120.00", alignment: "right", margin: [6, 6, 6, 6] },
                { text: "$3,000.00", alignment: "right", margin: [6, 6, 6, 6] },
              ],
              // Row 3
              [
                {
                  text: "PDF Reporting Engine Implementation",
                  margin: [6, 6, 6, 6],
                },
                { text: "15 hrs", alignment: "center", margin: [6, 6, 6, 6] },
                { text: "$110.00", alignment: "right", margin: [6, 6, 6, 6] },
                { text: "$1,650.00", alignment: "right", margin: [6, 6, 6, 6] },
              ],
              // Row 4
              [
                {
                  text: "AWS Infrastructure Deployment (CI/CD)",
                  margin: [6, 6, 6, 6],
                },
                { text: "10 hrs", alignment: "center", margin: [6, 6, 6, 6] },
                { text: "$180.00", alignment: "right", margin: [6, 6, 6, 6] },
                { text: "$1,800.00", alignment: "right", margin: [6, 6, 6, 6] },
              ],
              // Total Row (using Colspan)
              [
                {
                  text: "Total Amount Due",
                  colSpan: 3,
                  bold: true,
                  alignment: "right",
                  margin: [6, 6, 6, 6],
                },
                {}, // Placeholder for colSpan
                {}, // Placeholder for colSpan
                {
                  text: "$12,450.00",
                  bold: true,
                  color: "#2F855A",
                  alignment: "right",
                  margin: [6, 6, 6, 6],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: (_i, _node) =>
              _i === 0 || _i === _node.table.body.length ? 2 : 1,
            vLineWidth: (_i, _node) => 0, // No vertical borders
            hLineColor: (_i, _node) =>
              _i === 0 || _i === _node.table.body.length
                ? "#2B6CB0"
                : "#E2E8F0",
          },
          margin: [0, 0, 0, 15],
        },

        // Page Break Showcase
        {
          text: "Notice:",
          italic: true,
          color: "#718096",
          margin: [0, 10, 0, 0],
        },
        {
          text: "The next section contains the system configuration report and is printed on a new page.",
          italic: true,
          color: "#718096",
        },

        // Page break
        { text: "", pageBreak: "before" },

        // Page 2 Content
        {
          text: "5. System Configuration Report",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          text: "This page shows dynamic system metrics gathered at runtime. Because pdfmake calculates coordinates in-memory, page transitions and spacing remain exact.",
          margin: [0, 0, 0, 15],
        },

        {
          table: {
            widths: ["35%", "65%"],
            body: [
              [
                {
                  text: "Parameter",
                  bold: true,
                  fillColor: "#EDF2F7",
                  margin: [6, 6, 6, 6],
                },
                {
                  text: "Value / Status",
                  bold: true,
                  fillColor: "#EDF2F7",
                  margin: [6, 6, 6, 6],
                },
              ],
              [
                { text: "Node Version", margin: [6, 6, 6, 6] },
                { text: process.version, margin: [6, 6, 6, 6] },
              ],
              [
                { text: "Platform", margin: [6, 6, 6, 6] },
                { text: process.platform, margin: [6, 6, 6, 6] },
              ],
              [
                { text: "Memory Usage (RSS)", margin: [6, 6, 6, 6] },
                {
                  text: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
                  margin: [6, 6, 6, 6],
                },
              ],
              [
                { text: "Up Time", margin: [6, 6, 6, 6] },
                {
                  text: `${Math.round(process.uptime())} seconds`,
                  margin: [6, 6, 6, 6],
                },
              ],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 15],
        },

        // SVG / Vector Drawing Showcase
        {
          text: "6. Decorative Vectors & Canvas Drawings",
          fontSize: 14,
          bold: true,
          color: "#2B6CB0",
          margin: [0, 10, 0, 8],
        },
        {
          canvas: [
            {
              type: "rect",
              x: 0,
              y: 0,
              w: 515,
              h: 50,
              r: 4,
              lineColor: "#CBD5E0",
              color: "#F7FAFC",
            },
          ],
          margin: [0, 0, 0, -40], // Relative margin overlay
        },
        {
          text: "Thank you for doing business with Antigravity! If you have any questions regarding this statement, please contact our support desk.",
          alignment: "center",
          color: "#4A5568",
          margin: [20, 15, 20, 0],
        },
      ],
    };

    // Create the PDF document definition
    const outputDoc = pdfmake.createPdf(docDefinition);

    // Set Response Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    // Stream the PDF directly to the client
    const stream = await outputDoc.getStream();
    stream.pipe(res);
    stream.end();
  } catch (error) {
    next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || "Failed to generate PDF"
      )
    );
  }
};
