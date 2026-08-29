from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def build_notes_pdf(title: str, concepts: list[dict], mistakes: list[str]) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=f"Concepta notes — {title}")
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Concepta · Your Learning Summary", styles["Title"]),
        Paragraph(title, styles["Heading1"]),
        Spacer(1, 12),
        Paragraph("Key concepts", styles["Heading2"]),
    ]
    for c in concepts:
        story.append(Paragraph(c["title"], styles["Heading3"]))
        story.append(Paragraph(c.get("summary", ""), styles["BodyText"]))
        story.append(Spacer(1, 8))
    story.append(Paragraph("Common mistakes to watch", styles["Heading2"]))
    for m in mistakes or ["Mixing units before calculating.", "Memorising a method without checking if it fits."]:
        story.append(Paragraph(f"• {m}", styles["BodyText"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Remember this", styles["Heading2"]))
    story.append(
        Paragraph(
            "Name what is given, name what is asked, choose one rule, then sanity-check the size of the answer.",
            styles["BodyText"],
        )
    )
    doc.build(story)
    return buf.getvalue()
