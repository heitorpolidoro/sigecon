import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate


def test_password_complexity_valid():
    # Valid password
    user = UserCreate(
        username="test",
        email="test@example.com",
        full_name="Test User",
        password="Password123!"
    )
    assert user.password == "Password123!"

def test_password_complexity_invalid():
    # Too short
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(username="t", email="t@e.com", full_name="T", password="Pass1!")
    assert "at least 8 characters" in str(excinfo.value)

    # No numbers
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(username="t", email="t@e.com", full_name="T", password="Password!")
    assert "at least one number" in str(excinfo.value)

    # No letters
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(username="t", email="t@e.com", full_name="T", password="1234567!")
    assert "at least one letter" in str(excinfo.value)

    # No symbols
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(username="t", email="t@e.com", full_name="T", password="Password123")
    assert "at least one symbol" in str(excinfo.value)
