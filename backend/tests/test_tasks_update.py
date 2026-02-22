import uuid

from starlette.testclient import TestClient


def test_update_title_only(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Original"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}", json={"title": "Updated"}, headers=user_a_headers
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated"


def test_update_description_only(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks",
        json={"title": "Task", "description": "Old"},
        headers=user_a_headers,
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"description": "New desc"},
        headers=user_a_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["description"] == "New desc"


def test_update_status_to_completed(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "completed"},
        headers=user_a_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


def test_update_status_to_pending(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    # First mark as completed
    client.put(
        f"/api/tasks/{task_id}",
        json={"status": "completed"},
        headers=user_a_headers,
    )

    # Then back to pending
    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "pending"},
        headers=user_a_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"


def test_update_clear_description_with_null(
    client: TestClient, user_a_headers: dict
):
    create = client.post(
        "/api/tasks",
        json={"title": "Task", "description": "Has desc"},
        headers=user_a_headers,
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"description": None},
        headers=user_a_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["description"] is None


def test_update_empty_body(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.put(f"/api/tasks/{task_id}", json={}, headers=user_a_headers)
    assert resp.status_code == 400
    assert resp.json() == {"error": "At least one field must be provided"}


def test_update_invalid_status(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "invalid"},
        headers=user_a_headers,
    )
    assert resp.status_code == 400


def test_update_other_user_returns_404(
    client: TestClient, user_a_headers: dict, user_b_headers: dict
):
    create = client.post(
        "/api/tasks", json={"title": "A's task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Hacked"},
        headers=user_b_headers,
    )
    assert resp.status_code == 404
    assert resp.json() == {"error": "Task not found"}


def test_update_nonexistent_task(client: TestClient, user_a_headers: dict):
    fake_id = str(uuid.uuid4())
    resp = client.put(
        f"/api/tasks/{fake_id}", json={"title": "Nope"}, headers=user_a_headers
    )
    assert resp.status_code == 404


def test_update_created_at_unchanged(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    original = create.json()
    task_id = original["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Updated"},
        headers=user_a_headers,
    )
    updated = resp.json()
    assert updated["createdAt"] == original["createdAt"]


def test_update_updated_at_refreshed(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    original = create.json()
    task_id = original["id"]

    resp = client.put(
        f"/api/tasks/{task_id}",
        json={"title": "Updated"},
        headers=user_a_headers,
    )
    updated = resp.json()
    assert updated["updatedAt"] >= original["updatedAt"]


def test_update_no_auth(client: TestClient):
    fake_id = str(uuid.uuid4())
    resp = client.put(f"/api/tasks/{fake_id}", json={"title": "X"})
    assert resp.status_code == 401
