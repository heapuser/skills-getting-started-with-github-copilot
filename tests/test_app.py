import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0

def test_signup_and_unregister():
    # Use a known activity and a test email
    activity = next(iter(client.get("/activities").json().keys()))
    test_email = "testuser@example.com"

    # Ensure not already signed up
    client.delete(f"/activities/{activity}/unregister?email={test_email}")

    # Sign up
    resp_signup = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert resp_signup.status_code == 200
    assert "Signed up" in resp_signup.json().get("message", "")

    # Duplicate signup should fail
    resp_dup = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert resp_dup.status_code == 400

    # Unregister
    resp_unreg = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert resp_unreg.status_code == 200
    assert "Unregistered" in resp_unreg.json().get("message", "")

    # Unregister again should fail
    resp_unreg2 = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert resp_unreg2.status_code == 404
