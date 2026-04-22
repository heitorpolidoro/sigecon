from fastapi.testclient import TestClient

from app.main import app


def test_login_rate_limit(client: TestClient):
    # Enable limiter just for this test
    app.state.limiter.enabled = True
    try:
        # Try login 6 times (limit is 5/minute)
        for _i in range(5):
            response = client.post(
                "/api/v1/auth/login", data={"username": "wrong", "password": "wrong"}
            )
            assert response.status_code == 400

        # 6th attempt should be rate limited
        response = client.post(
            "/api/v1/auth/login", data={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 429
        assert "Rate limit exceeded" in response.json()["error"]
    finally:
        app.state.limiter.enabled = False
