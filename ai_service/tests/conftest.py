import pytest
from fastapi.testclient import TestClient
from ai_service.main import app
from ai_service.core.config import settings

# Force testing configuration
settings.ENVIRONMENT = "testing"
settings.DEBUG = True
settings.INTERNAL_API_KEY = ""  # Allow unrestricted test calls


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
