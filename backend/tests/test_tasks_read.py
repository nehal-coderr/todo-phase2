import uuid

from starlette.testclient import TestClient


def test_list_empty(client: TestClient, user_a_headers: dict):
    resp = client.get("/api/tasks", headers=user_a_headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_returns_only_own_tasks(
    client: TestClient, user_a_headers: dict, user_b_headers: dict
):
    # Create tasks for user A
    client.post("/api/tasks", json={"title": "A-task-1"}, headers=user_a_headers)
    client.post("/api/tasks", json={"title": "A-task-2"}, headers=user_a_headers)

    # Create task for user B
    client.post("/api/tasks", json={"title": "B-task-1"}, headers=user_b_headers)

    # User A sees only their tasks
    resp_a = client.get("/api/tasks", headers=user_a_headers)
    assert resp_a.status_code == 200
    tasks_a = resp_a.json()
    assert len(tasks_a) == 2
    assert all("A-task" in t["title"] for t in tasks_a)

    # User B sees only their tasks
    resp_b = client.get("/api/tasks", headers=user_b_headers)
    assert resp_b.status_code == 200
    tasks_b = resp_b.json()
    assert len(tasks_b) == 1
    assert tasks_b[0]["title"] == "B-task-1"


def test_list_ordered_by_created_at_desc(
    client: TestClient, user_a_headers: dict
):
    client.post("/api/tasks", json={"title": "First"}, headers=user_a_headers)
    client.post("/api/tasks", json={"title": "Second"}, headers=user_a_headers)
    client.post("/api/tasks", json={"title": "Third"}, headers=user_a_headers)

    resp = client.get("/api/tasks", headers=user_a_headers)
    tasks = resp.json()
    assert tasks[0]["title"] == "Third"
    assert tasks[1]["title"] == "Second"
    assert tasks[2]["title"] == "First"


def test_list_no_auth(client: TestClient):
    resp = client.get("/api/tasks")
    assert resp.status_code == 401


def test_detail_own_task(client: TestClient, user_a_headers: dict):
    create_resp = client.post(
        "/api/tasks",
        json={"title": "Detail Task", "description": "desc"},
        headers=user_a_headers,
    )
    task_id = create_resp.json()["id"]

    resp = client.get(f"/api/tasks/{task_id}", headers=user_a_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == task_id
    assert data["title"] == "Detail Task"
    assert data["description"] == "desc"
    assert data["status"] == "pending"
    assert "createdAt" in data
    assert "updatedAt" in data


def test_detail_other_user_returns_404(
    client: TestClient, user_a_headers: dict, user_b_headers: dict
):
    create_resp = client.post(
        "/api/tasks", json={"title": "A's task"}, headers=user_a_headers
    )
    task_id = create_resp.json()["id"]

    resp = client.get(f"/api/tasks/{task_id}", headers=user_b_headers)
    assert resp.status_code == 404
    assert resp.json() == {"error": "Task not found"}


def test_detail_nonexistent_task(client: TestClient, user_a_headers: dict):
    fake_id = str(uuid.uuid4())
    resp = client.get(f"/api/tasks/{fake_id}", headers=user_a_headers)
    assert resp.status_code == 404
    assert resp.json() == {"error": "Task not found"}


def test_detail_no_auth(client: TestClient):
    fake_id = str(uuid.uuid4())
    resp = client.get(f"/api/tasks/{fake_id}")
    assert resp.status_code == 401
