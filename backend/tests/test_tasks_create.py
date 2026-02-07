from starlette.testclient import TestClient


def test_create_task_valid(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks",
        json={"title": "My Task", "description": "Details"},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "My Task"
    assert data["description"] == "Details"
    assert data["status"] == "pending"
    assert "id" in data
    assert "createdAt" in data
    assert "updatedAt" in data
    assert "user_id" not in data
    assert "userId" not in data


def test_create_task_missing_title(client: TestClient, user_a_headers: dict):
    resp = client.post("/api/tasks", json={}, headers=user_a_headers)
    assert resp.status_code == 400
    assert resp.json() == {"error": "Title is required"}


def test_create_task_empty_title(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks", json={"title": "   "}, headers=user_a_headers
    )
    assert resp.status_code == 400
    assert resp.json() == {"error": "Title is required"}


def test_create_task_title_200_chars(client: TestClient, user_a_headers: dict):
    title = "a" * 200
    resp = client.post(
        "/api/tasks", json={"title": title}, headers=user_a_headers
    )
    assert resp.status_code == 201
    assert resp.json()["title"] == title


def test_create_task_title_201_chars(client: TestClient, user_a_headers: dict):
    title = "a" * 201
    resp = client.post(
        "/api/tasks", json={"title": title}, headers=user_a_headers
    )
    assert resp.status_code == 400
    assert resp.json() == {"error": "Title must be 200 characters or fewer"}


def test_create_task_description_2000_chars(
    client: TestClient, user_a_headers: dict
):
    desc = "b" * 2000
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "description": desc},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["description"] == desc


def test_create_task_description_too_long(
    client: TestClient, user_a_headers: dict
):
    desc = "b" * 2001
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "description": desc},
        headers=user_a_headers,
    )
    assert resp.status_code == 400
    assert resp.json() == {"error": "Description must be 2000 characters or fewer"}


def test_create_task_ignores_body_user_id(
    client: TestClient, user_a_headers: dict
):
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "user_id": "evil-user"},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    assert "user_id" not in resp.json()


def test_create_task_status_always_pending(
    client: TestClient, user_a_headers: dict
):
    resp = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


def test_create_task_no_auth(client: TestClient):
    resp = client.post("/api/tasks", json={"title": "Task"})
    assert resp.status_code == 401


def test_create_task_no_description(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    assert resp.status_code == 201
    assert resp.json()["description"] is None
