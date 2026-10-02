def test_copilot_chat_endpoint(client):
    req_body = {
        "messages": [
            {"role": "user", "content": "How do I evaluate a candidate's system design experience?"}
        ]
    }
    response = client.post("/api/chat/message", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 5
    assert "model" in data


def test_copilot_chat_validation_error(client):
    req_body = {
        "messages": []
    }
    response = client.post("/api/chat/message", json=req_body)
    assert response.status_code == 422
