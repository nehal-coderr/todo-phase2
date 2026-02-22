from starlette.testclient import TestClient


def test_title_exactly_200_chars(client: TestClient, user_a_headers: dict):
    title = "a" * 200
    resp = client.post(
        "/api/tasks", json={"title": title}, headers=user_a_headers
    )
    assert resp.status_code == 201
    assert len(resp.json()["title"]) == 200


def test_title_201_chars_rejected(client: TestClient, user_a_headers: dict):
    title = "a" * 201
    resp = client.post(
        "/api/tasks", json={"title": title}, headers=user_a_headers
    )
    assert resp.status_code == 400
    assert resp.json() == {"error": "Title must be 200 characters or fewer"}


def test_description_exactly_2000_chars(client: TestClient, user_a_headers: dict):
    desc = "b" * 2000
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "description": desc},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    assert len(resp.json()["description"]) == 2000


def test_description_2001_chars_rejected(client: TestClient, user_a_headers: dict):
    desc = "b" * 2001
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "description": desc},
        headers=user_a_headers,
    )
    assert resp.status_code == 400
    assert resp.json() == {"error": "Description must be 2000 characters or fewer"}


def test_null_description_accepted(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "description": None},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["description"] is None


def test_omitted_description_accepted(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks", json={"title": "Task"}, headers=user_a_headers
    )
    assert resp.status_code == 201
    assert resp.json()["description"] is None


def test_extra_fields_ignored(client: TestClient, user_a_headers: dict):
    resp = client.post(
        "/api/tasks",
        json={"title": "Task", "extra_field": "ignored", "foo": 123},
        headers=user_a_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "extra_field" not in data
    assert "foo" not in data


def test_error_response_shape(client: TestClient, user_a_headers: dict):
    resp = client.post("/api/tasks", json={}, headers=user_a_headers)
    assert resp.status_code == 400
    data = resp.json()
    assert "error" in data
    assert isinstance(data["error"], str)
    assert len(data) == 1  # Only "error" key
