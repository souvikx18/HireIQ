import io


def test_resume_analyze_raw_text(client):
    resume_text = """
    Jane Doe
    jane.doe@example.com | +1 (555) 234-5678
    Senior Software Engineer with 5 years experience in building distributed cloud applications.
    Education: B.S. in Computer Science, Stanford University, 2019.
    Technical Skills: React, TypeScript, Python, Node.js, PostgreSQL, Docker, AWS, System Design.
    Experience:
    - Designed scalable microservices handling 10M daily requests.
    - Led frontend migration to Next.js reducing FCP by 40%.
    """
    response = client.post(
        "/api/resume/analyze",
        data={
            "raw_text": resume_text,
            "target_role": "Full Stack Engineer",
            "required_skills": "React,Node.js,Python,AWS,PostgreSQL",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "jane.doe@example.com"
    assert data["ats_score"] > 50
    assert "detected_skills" in data
    assert any(s in ["React", "Python", "Node.js", "Docker"] for s in data["detected_skills"])
    assert "score_breakdown" in data
    assert len(data["skill_gaps"]) > 0


def test_resume_analyze_missing_input(client):
    response = client.post("/api/resume/analyze", data={})
    assert response.status_code == 400


def test_resume_analyze_short_text(client):
    response = client.post("/api/resume/analyze", data={"raw_text": "too short"})
    assert response.status_code == 422


def test_resume_match_endpoint(client):
    req_body = {
        "resume_text": "Experienced engineer skilled in Python, FastAPI, Docker, and PostgreSQL with 4 years building backend APIs.",
        "job_description": "We are seeking a Senior Backend Engineer proficient in Python, PostgreSQL, and AWS to architect high-throughput services.",
        "job_title": "Senior Backend Engineer",
        "required_skills": ["Python", "PostgreSQL", "AWS", "Docker"],
    }
    response = client.post("/api/resume/match", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert data["match_score"] > 40
    assert "Python" in data["matched_skills"]
    assert "AWS" in data["missing_skills"]
    assert data["verdict"] in ["Strong Fit", "Potential Fit", "Not a Fit"]
