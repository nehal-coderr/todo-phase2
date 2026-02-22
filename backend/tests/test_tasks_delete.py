import uuid

from starlette.testclient import TestClient


def test_delete_own_task(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "To Delete"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.delete(f"/api/tasks/{task_id}", headers=user_a_headers)
    assert resp.status_code == 204
    assert resp.content == b""


def test_deleted_task_gone_from_list(client: TestClient, user_a_headers: dict):
    create = client.post(
        "/api/tasks", json={"title": "Will Be Deleted"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    client.delete(f"/api/tasks/{task_id}", headers=user_a_headers)

    list_resp = client.get("/api/tasks", headers=user_a_headers)
    task_ids = [t["id"] for t in list_resp.json()]
    assert task_id not in task_ids


def test_delete_other_user_returns_404(
    client: TestClient, user_a_headers: dict, user_b_headers: dict
):
    create = client.post(
        "/api/tasks", json={"title": "A's task"}, headers=user_a_headers
    )
    task_id = create.json()["id"]

    resp = client.delete(f"/api/tasks/{task_id}", headers=user_b_headers)
    assert resp.status_code == 404
    assert resp.json() == {"error": "Task not found"}


def test_delete_nonexistent_task(client: TestClient, user_a_headers: dict):
    fake_id = str(uuid.uuid4())
    resp = client.delete(f"/api/tasks/{fake_id}", headers=user_a_headers)
    assert resp.status_code == 404


def test_delete_no_auth(client: TestClient):
    fake_id = str(uuid.uuid4())
    resp = client.delete(f"/api/tasks/{fake_id}")
    assert resp.status_code == 401
