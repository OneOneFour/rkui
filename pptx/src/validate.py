"""Validates every PresentationML, DrawingML and chart part of an OOXML package against the
ECMA-376 transitional schemas (copies from python-docx's ref/xsd).

Usage: python validate.py <xsd dir> <file.pptx|.potx|.thmx> [...]
"""
import sys
import zipfile
from pathlib import Path

from lxml import etree

ROOT_SCHEMA = {
    "{http://schemas.openxmlformats.org/presentationml/2006/main}": "pml.xsd",
    "{http://schemas.openxmlformats.org/drawingml/2006/main}": "dml-main.xsd",
    "{http://schemas.openxmlformats.org/drawingml/2006/chart}": "dml-chart.xsd",
}


def main(xsd_dir, *packages):
    schemas = {name: etree.XMLSchema(etree.parse(str(Path(xsd_dir) / name))) for name in set(ROOT_SCHEMA.values())}
    failures = 0
    for package in packages:
        checked = 0
        with zipfile.ZipFile(package) as z:
            for name in z.namelist():
                if not name.endswith(".xml"):
                    continue
                root = etree.fromstring(z.read(name))
                ns = root.tag.split("}")[0] + "}"
                if ns not in ROOT_SCHEMA:
                    continue
                schema = schemas[ROOT_SCHEMA[ns]]
                checked += 1
                if not schema.validate(root):
                    failures += 1
                    for err in list(schema.error_log)[:5]:
                        print(f"{package}:{name}:{err.line}: {err.message}")
        print(f"{package}: {checked} parts checked")
    print("All valid." if not failures else f"{failures} invalid part(s).")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main(*sys.argv[1:])
