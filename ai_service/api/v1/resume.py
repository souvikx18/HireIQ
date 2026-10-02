from typing import Optional, List
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Body,
    HTTPException,
    status,
    Depends,
)
from ai_service.core.config import settings
from ai_service.core.security import verify_internal_api_key, sanitize_filename
from ai_service.core.logging import logger
from ai_service.core.exceptions import UnsupportedFileTypeError
from ai_service.schemas.resume import (
    ResumeAnalyzeResponse,
    JobMatchRequest,
    JobMatchResponse,
)
from ai_service.services.parser_service import parser_service
from ai_service.services.analyzer_service import analyzer_service
from ai_service.services.matching_service import matching_service

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])


@router.post(
    "/analyze",
    response_model=ResumeAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_api_key)],
)
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    required_skills: Optional[str] = Form(None),  # Comma-separated or JSON list
):
    """
    Analyzes a candidate resume for ATS compatibility, skill gap diagnosis, and score metrics.
    Accepts binary file upload (PDF/DOCX/TXT) or raw pre-extracted text.
    """
    extracted_text = ""

    if file:
        safe_filename = sanitize_filename(file.filename or "resume.pdf")
        content_type = file.content_type or ""

        # Validate file size
        file_bytes = await file.read()
        if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Uploaded file exceeds maximum limit of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB",
            )

        # Parse document bytes
        logger.info(f"Analyzing resume file '{safe_filename}' ({len(file_bytes)} bytes)")
        extracted_text = parser_service.parse_document(safe_filename, file_bytes)
    elif raw_text:
        extracted_text = raw_text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a document file or raw_text parameter must be provided.",
        )

    if len(extracted_text) < 15:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Extracted text is too short or unreadable to perform reliable ATS analysis.",
        )

    # Parse required skills string if provided
    skills_list = []
    if required_skills:
        skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]

    result = analyzer_service.analyze(
        text=extracted_text,
        target_role=target_role,
        required_skills=skills_list,
        candidate_name=candidate_name,
    )
    return result


@router.post(
    "/match",
    response_model=JobMatchResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_internal_api_key)],
)
def match_resume_to_job(request: JobMatchRequest):
    """
    Evaluates candidate resume against job description requirements,
    calculating semantic fit score, skill coverage, and qualitative verdict.
    """
    logger.info(f"Computing semantic job match for target role: '{request.job_title}'")
    result = matching_service.match(
        resume_text=request.resume_text,
        job_description=request.job_description,
        job_title=request.job_title,
        required_skills=request.required_skills,
    )
    return result
