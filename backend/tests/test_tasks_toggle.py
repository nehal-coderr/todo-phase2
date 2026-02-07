import uuid

from starlette.testclient import TestClient


def test_toggle_pending_to_completed(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Toggle Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]
    assert create.json()["status"] == "pending"

    resp = client.patch(
        f"/api/tasks/{task_id}/complete", headers=user_a_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


def test_toggle_completed_to_pending(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Toggle Task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    # Toggle to completed
    client.patch(f"/api/tasks/{task_id}/complete", headers=user_a_headers)

    # Toggle back to pending
    resp = client.patch(
        f"/api/tasks/{task_id}/complete", headers=user_a_headers
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"


def test_toggle_other_user_returns_404(
    client: TestClient, user_a_headers: dict, user_b_headers: dict
):
    create = client.post(
        "/api/tasks", json={"title": "A's task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.patch(
        f"/api/tasks/{task_id}/complete", headers=user_b_headers
    )
    assert resp.status_code == 404
    assert resp.json() == {"error": "Task not found"}


def test_toggle_nonexistent_task(client: TestClient, user_a_headers: dict):
    fake_id = str(uuid.uuid4())
    resp = client.patch(
        f"/api/tasks/{fake_id}/complete", headers=user_a_headers
    )
    assert resp.status_code == 404


def test_toggle_updated_at_refreshed(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Toggle Task"}, headers=user_a_headers
    )
    original = create.json()
    task_id = original["id"]

    resp = client.patch(
        f"/api/tasks/{task_id}/complete", headers=user_a_headers
    )
    toggled = resp.json()
    assert toggled["updatedAt"] >= original["updatedAt"]


def test_toggle_no_auth(client: TestClient):
    fake_id = str(uuid.uuid4())
    resp = client.patch(f"/api/tasks/{fake_id}/complete")
    assert resp.status_code == 401
