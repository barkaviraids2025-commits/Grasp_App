from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def build_notes_pdf(title: str, concepts: list[dict], mistakes: list[str]) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=f"Concepta notes — {title}")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Concepta — Your Learning Summary", styles["Title"]),
        Spacer(1, 8),
        Paragraph(title, styles["Heading2"]),
        Spacer(1, 12),
        Paragraph("Key concepts", styles["Heading3"]),
    ]
    for c in concepts:
        story.append(Paragraph(c.get("title", ""), styles["Heading4"]))
        story.append(Paragraph(c.get("body", "")[:900].replace("\n", "<br/>"), styles["BodyText"]))
        story.append(Spacer(1, 8))
    story.append(Paragraph("Common slips to watch", styles["Heading3"]))
    for m in mistakes or ["Rushing past the units.", "Averaging ratios the wrong way.", "Skipping the estimate check."]:
        story.append(Paragraph(f"• {m}", styles["BodyText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Remember this", styles["Heading3"]))
    story.append(
        Paragraph(
            "If you do not understand it yet, we do not move on. Understanding beats extra hours.",
            styles["BodyText"],
        )
    )
    doc.build(story)
    return buf.getvalue()
