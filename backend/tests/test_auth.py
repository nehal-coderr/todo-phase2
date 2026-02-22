import base64
import json

import jwt
from starlette.testclient import TestClient

from tests.conftest import SECRET, USER_A_ID, make_token


def test_missing_auth_header(client: TestClient):
    resp = client.get("/api/tasks")
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_malformed_bearer(client: TestClient):
    resp = client.get("/api/tasks", headers={"Authorization": "Basic abc"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_empty_bearer_token(client: TestClient):
    resp = client.get("/api/tasks", headers={"Authorization": "Bearer "})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_invalid_signature(client: TestClient):
    token = jwt.encode(
        {"sub": USER_A_ID, "exp": 9999999999},
        "wrong-secret",
        algorithm="HS256",
    )
    resp = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_expired_token(client: TestClient):
    token = make_token(USER_A_ID, expired=True)
    resp = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_missing_sub_claim(client: TestClient):
    token = make_token(USER_A_ID, no_sub=True)
    resp = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
    assert resp.json() == {"error": "Unauthorized"}


def test_valid_token_allows_request(client: TestClient, user_a_headers: dict):
    resp = client.get("/api/tasks", headers=user_a_headers)
    assert resp.status_code == 200


def test_alg_none_rejected(client: TestClient):
    """Ensure tokens with alg=none are rejected."""
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "none", "typ": "JWT"}).encode()
    ).rstrip(b"=")
    payload = base64.urlsafe_b64encode(
        json.dumps({"sub": USER_A_ID, "exp": 9999999999}).encode()
    ).rstrip(b"=")
    token = f"{header.decode()}.{payload.decode()}."
    resp = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401
