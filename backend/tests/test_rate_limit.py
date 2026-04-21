from fastapi.testclient import TestClient
import pytest
import time

def test_login_rate_limit(client: TestClient):
    # Try login 6 times (limit is 5/minute)
    for i in range(5):
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 400
    
    # 6th attempt should be rate limited
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong", "password": "wrong"}
    )
    assert response.status_code == 429
    assert "Rate limit exceeded" in response.json()["error"]
