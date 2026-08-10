from __future__ import annotations

from html import escape
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table as DocxTable
from docx.text.paragraph import Paragraph as DocxParagraph
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(r"D:\Cursor\creatisignal-app-new")
DOCX = ROOT / "docs" / "prd" / "产品库需求文档_v1.0_2026-08-04.docx"
PDF = ROOT / ".codex-tmp" / "product_library_prd" / "render" / "qa.pdf"


pdfmetrics.registerFont(TTFont("CN", r"C:\Windows\Fonts\simhei.ttf"))
pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


def iter_blocks(parent):
    body = parent.element.body
    for child in body.iterchildren():
        if child.tag == qn("w:p"):
            yield DocxParagraph(child, parent)
        elif child.tag == qn("w:tbl"):
            yield DocxTable(child, parent)


def has_page_break(paragraph):
    return bool(paragraph._p.xpath('.//w:br[@w:type="page"]'))


def font_style(name: str):
    if name == "Title":
        return ParagraphStyle("Title", fontName="CN", fontSize=25, leading=30, textColor=colors.HexColor("#1F4E79"), spaceAfter=6)
    if name == "Subtitle":
        return ParagraphStyle("Subtitle", fontName="CN", fontSize=13, leading=17, textColor=colors.HexColor("#667085"), spaceAfter=12)
    if name == "Heading 1":
        return ParagraphStyle("H1", fontName="CN", fontSize=16, leading=20, textColor=colors.HexColor("#2E74B5"), spaceBefore=8, spaceAfter=5, keepWithNext=True)
    if name == "Heading 2":
        return ParagraphStyle("H2", fontName="CN", fontSize=13, leading=17, textColor=colors.HexColor("#2E74B5"), spaceBefore=7, spaceAfter=4, keepWithNext=True)
    if name == "Heading 3":
        return ParagraphStyle("H3", fontName="CN", fontSize=12, leading=16, textColor=colors.HexColor("#1F4E79"), spaceBefore=6, spaceAfter=3, keepWithNext=True)
    if name.startswith("List"):
        return ParagraphStyle("List", fontName="CN", fontSize=9.5, leading=13.3, leftIndent=24, firstLineIndent=-12, spaceAfter=3)
    return ParagraphStyle("Body", fontName="CN", fontSize=9.5, leading=13.3, textColor=colors.HexColor("#1F2937"), spaceAfter=5)


def paragraph_html(paragraph):
    chunks = []
    for run in paragraph.runs:
        text = escape(run.text).replace("\n", "<br/>")
        if not text:
            continue
        if run.bold:
            text = f"<b>{text}</b>"
        chunks.append(text)
    return "".join(chunks) or escape(paragraph.text)


def cell_fill(cell):
    shd = cell._tc.get_or_add_tcPr().find(qn("w:shd"))
    if shd is None:
        return None
    value = shd.get(qn("w:fill"))
    if not value or value == "auto":
        return None
    return colors.HexColor("#" + value)


def table_widths(table):
    grid = table._tbl.tblGrid
    widths = []
    for col in grid.findall(qn("w:gridCol")):
        widths.append(int(col.get(qn("w:w"), "0")) / 20.0)
    if not widths:
        return None
    return widths


def render_table(table):
    data = []
    for row_index, row in enumerate(table.rows):
        row_data = []
        for cell in row.cells:
            text = "<br/>".join(escape(p.text) for p in cell.paragraphs if p.text)
            style = ParagraphStyle(
                f"Cell{row_index}",
                fontName="CN",
                fontSize=7.5 if row_index else 7.8,
                leading=10.2,
                textColor=colors.HexColor("#1F2937"),
                spaceAfter=0,
            )
            row_data.append(Paragraph(text or " ", style))
        data.append(row_data)
    widths = table_widths(table)
    rl_table = Table(data, colWidths=widths, repeatRows=1 if len(data) > 1 else 0, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D0D5DD")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for row_index, row in enumerate(table.rows):
        for col_index, cell in enumerate(row.cells):
            fill = cell_fill(cell)
            if fill:
                commands.append(("BACKGROUND", (col_index, row_index), (col_index, row_index), fill))
    if len(data) > 1:
        commands.append(("FONTNAME", (0, 0), (-1, 0), "CN"))
    rl_table.setStyle(TableStyle(commands))
    return rl_table


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#E4E7EC"))
    canvas.setLineWidth(0.4)
    canvas.line(inch, 0.58 * inch, 7.5 * inch, 0.58 * inch)
    canvas.setFillColor(colors.HexColor("#667085"))
    canvas.setFont("CN", 7.5)
    canvas.drawString(inch, 0.38 * inch, "CreatiSignal · 产品库需求文档 · 内部评审")
    canvas.drawRightString(7.5 * inch, 0.38 * inch, f"第 {doc.page} 页")
    canvas.restoreState()


def main():
    source = Document(DOCX)
    PDF.parent.mkdir(parents=True, exist_ok=True)
    pdf = SimpleDocTemplate(
        str(PDF),
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=0.65 * inch,
        bottomMargin=0.70 * inch,
        title="产品库需求文档 QA",
        author="CreatiSignal Product Team",
    )
    story = []
    list_number = 0
    for block in iter_blocks(source):
        if isinstance(block, DocxParagraph):
            if has_page_break(block):
                story.append(PageBreak())
                list_number = 0
                continue
            text = block.text.strip()
            if not text:
                story.append(Spacer(1, 2))
                continue
            style_name = block.style.name if block.style else "Normal"
            style = font_style(style_name)
            prefix = ""
            if style_name.startswith("List Bullet"):
                prefix = "• "
            elif style_name == "List Number":
                list_number += 1
                prefix = f"{list_number}. "
            elif not style_name.startswith("List"):
                list_number = 0
            story.append(Paragraph(prefix + paragraph_html(block), style))
        else:
            story.append(render_table(block))
            story.append(Spacer(1, 4))
    pdf.build(story, onFirstPage=footer, onLaterPages=footer)
    print(PDF)


if __name__ == "__main__":
    main()
