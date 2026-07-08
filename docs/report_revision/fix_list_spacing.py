from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "CyberSentinel_Final_Report_Corrected.docx"
OUTPUT = ROOT / "CyberSentinel_Final_Report_Corrected_Spacing_Fixed.docx"

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}


def w_tag(name):
    return f"{{{W_NS}}}{name}"


def field_instructions(paragraph):
    return " ".join(
        text.strip()
        for text in paragraph.xpath(".//w:instrText/text()", namespaces=NS)
        if text.strip()
    )


def compact_field_boundary_paragraph(paragraph):
    """Keep the field controls but make their otherwise blank line 1 pt high."""
    p_pr = paragraph.find("w:pPr", NS)
    if p_pr is None:
        p_pr = etree.Element(w_tag("pPr"))
        paragraph.insert(0, p_pr)

    spacing = p_pr.find("w:spacing", NS)
    if spacing is None:
        spacing = etree.SubElement(p_pr, w_tag("spacing"))
    spacing.set(w_tag("before"), "0")
    spacing.set(w_tag("after"), "0")
    spacing.set(w_tag("line"), "20")
    spacing.set(w_tag("lineRule"), "exact")

    paragraph_mark = p_pr.find("w:rPr", NS)
    if paragraph_mark is None:
        paragraph_mark = etree.SubElement(p_pr, w_tag("rPr"))
    size = paragraph_mark.find("w:sz", NS)
    if size is None:
        size = etree.SubElement(paragraph_mark, w_tag("sz"))
    size.set(w_tag("val"), "2")
    size_cs = paragraph_mark.find("w:szCs", NS)
    if size_cs is None:
        size_cs = etree.SubElement(paragraph_mark, w_tag("szCs"))
    size_cs.set(w_tag("val"), "2")


def main():
    target_fields = {
        'TOC \\h \\z \\c "Figure 4."',
        'TOC \\h \\z \\c "Figure 5."',
        'TOC \\h \\z \\c "Table 5."',
        'TOC \\h \\z \\c "Table 6."',
    }

    with ZipFile(SOURCE, "r") as source_zip:
        root = etree.fromstring(source_zip.read("word/document.xml"))
        compacted = []

        for paragraph in root.xpath(".//w:body/w:p", namespaces=NS):
            instruction = field_instructions(paragraph)
            if instruction in target_fields:
                compact_field_boundary_paragraph(paragraph)
                compacted.append(instruction)

        if set(compacted) != target_fields or len(compacted) != 4:
            raise RuntimeError(
                "Expected the four chapter-list field boundaries; found: "
                f"{compacted!r}"
            )

        updated_xml = etree.tostring(
            root,
            xml_declaration=True,
            encoding="UTF-8",
            standalone="yes",
        )

        with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as output_zip:
            for item in source_zip.infolist():
                data = (
                    updated_xml
                    if item.filename == "word/document.xml"
                    else source_zip.read(item.filename)
                )
                output_zip.writestr(item, data)

    print(f"Created: {OUTPUT}")
    for instruction in sorted(compacted):
        print(f"Compacted field boundary: {instruction}")


if __name__ == "__main__":
    main()
