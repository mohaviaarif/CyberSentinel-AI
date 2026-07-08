from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "CyberSentinel_Final_Report_Corrected_Spacing_Fixed.docx"
OUTPUT = ROOT / "CyberSentinel_Final_Report_Final.docx"

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}


def field_instruction(paragraph):
    return " ".join(
        value.strip()
        for value in paragraph.xpath(".//w:instrText/text()", namespaces=NS)
        if value.strip()
    )


def field_char_types(element):
    return element.xpath(
        ".//w:fldChar/@w:fldCharType",
        namespaces=NS,
    )


def merge_boundary_into_entries(body, boundary):
    previous = boundary.getprevious()
    following = boundary.getnext()
    if previous is None or following is None:
        raise RuntimeError("Figure-list boundary does not have adjacent paragraphs.")
    if previous.tag != f"{{{W_NS}}}p" or following.tag != f"{{{W_NS}}}p":
        raise RuntimeError("Figure-list boundary is not between two paragraphs.")

    field_nodes = [
        child
        for child in list(boundary)
        if child.tag != f"{{{W_NS}}}pPr"
    ]
    end_nodes = [node for node in field_nodes if "end" in field_char_types(node)]
    start_nodes = [node for node in field_nodes if node not in end_nodes]
    if len(end_nodes) != 1 or not start_nodes:
        raise RuntimeError("Unexpected figure-list field-boundary structure.")

    # Close the preceding chapter's TOC field at the end of its final entry.
    previous.append(end_nodes[0])

    # Start the following chapter's TOC field at the beginning of its first
    # visible entry. This preserves a valid updatable Word field while removing
    # the otherwise blank paragraph that caused the visible gap.
    insert_at = 1 if following.find("w:pPr", NS) is not None else 0
    for offset, node in enumerate(start_nodes):
        following.insert(insert_at + offset, node)

    body.remove(boundary)


def main():
    targets = {
        'TOC \\h \\z \\c "Figure 4."',
        'TOC \\h \\z \\c "Figure 5."',
    }

    with ZipFile(SOURCE, "r") as source_zip:
        root = etree.fromstring(source_zip.read("word/document.xml"))
        body = root.find("w:body", NS)
        matched = []

        for paragraph in list(body):
            if paragraph.tag != f"{{{W_NS}}}p":
                continue
            instruction = field_instruction(paragraph)
            if instruction in targets:
                merge_boundary_into_entries(body, paragraph)
                matched.append(instruction)

        if set(matched) != targets or len(matched) != 2:
            raise RuntimeError(
                "Expected exactly the Figure 4 and Figure 5 field boundaries; "
                f"found {matched!r}."
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
    for instruction in sorted(matched):
        print(f"Merged field boundary: {instruction}")


if __name__ == "__main__":
    main()
