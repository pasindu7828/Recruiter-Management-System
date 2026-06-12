import os
import pdfplumber
import docx
import logging

logger = logging.getLogger(__name__)

def extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF, DOCX, or TXT file"""
    text = ""
    
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            text = extract_from_pdf(file_path)
        elif file_ext == '.docx':
            text = extract_from_docx(file_path)
        elif file_ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        # Clean text
        text = text.lower()
        text = ' '.join(text.split())
        
        return text
    
    except Exception as e:
        logger.error(f"Extraction error: {str(e)}")
        return ""

def extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
    return text

def extract_from_docx(file_path: str) -> str:
    """Extract text from DOCX"""
    text = ""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        logger.error(f"DOCX extraction error: {str(e)}")
    return text