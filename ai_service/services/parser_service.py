import io
from typing import Optional
from ai_service.core.exceptions import DocumentParsingError, UnsupportedFileTypeError
from ai_service.core.logging import logger


class DocumentParserService:
    """Enterprise document extraction service supporting PDF, DOCX, and TXT."""

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extracts text from PDF bytes using PyPDF with fallback."""
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

            full_text = "\n".join(text_parts).strip()
            if full_text:
                return full_text
        except Exception as e:
            logger.warning(f"PyPDF extraction encountered an issue: {str(e)}, trying fallback")

        # Fallback to pdfminer if pypdf extracts empty (e.g., complex font encodings)
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract
            extracted = pdfminer_extract(io.BytesIO(file_bytes))
            if extracted and extracted.strip():
                return extracted.strip()
        except Exception as e:
            logger.error(f"PDF fallback parsing failed: {str(e)}")

        raise DocumentParsingError("Unable to extract text from the provided PDF document. Ensure it is not an image-only scan or encrypted.")

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extracts text from Microsoft Word DOCX files."""
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            tables_text = []
            for table in doc.tables:
                for row in table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_cells:
                        tables_text.append(" | ".join(row_cells))
            return "\n".join(paragraphs + tables_text).strip()
        except Exception as e:
            logger.error(f"DOCX extraction failed: {str(e)}")
            raise DocumentParsingError("Failed to parse Word (.docx) document.")

    @classmethod
    def parse_document(cls, filename: str, file_bytes: bytes) -> str:
        """Determines format and extracts textual content."""
        if not file_bytes:
            raise DocumentParsingError("Uploaded file is empty.")

        filename_lower = filename.lower()
        if filename_lower.endswith(".pdf"):
            return cls.extract_text_from_pdf(file_bytes)
        elif filename_lower.endswith(".docx"):
            return cls.extract_text_from_docx(file_bytes)
        elif filename_lower.endswith((".txt", ".md", ".csv")):
            try:
                return file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                return file_bytes.decode("latin-1", errors="ignore")
        else:
            raise UnsupportedFileTypeError(
                f"Unsupported file format '{filename}'. Allowed formats: PDF, DOCX, TXT."
            )


parser_service = DocumentParserService()
