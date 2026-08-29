import io
import json
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_e2e_flow():
    print("1. Testing health check...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    assert res.json()["ok"] is True

    print("2. Testing onboarding questions...")
    res = client.get("/api/questions")
    assert res.status_code == 200, f"Questions failed: {res.text}"
    questions = res.json()
    assert len(questions) == 15, f"Expected 15 questions, got {len(questions)}"
    print(f"   -> Found {len(questions)} questions across sections.")

    print("3. Testing user signup with 15 onboarding answers...")
    answers = {f"q{i}": "C" for i in range(1, 16)}
    answers["q7"] = "B"  # Visual diagrams
    answers["q8"] = "C"  # Worked examples
    signup_payload = {
        "name": "Kutty Raman",
        "email": f"kutty_{int(time.time())}@example.com",
        "phone": "+91 9876543210",
        "password": "securepassword123",
        "preferred_language": "tamil",
        "answers": answers,
    }
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 200, f"Signup failed: {res.text}"
    auth_data = res.json()
    token = auth_data["token"]
    user = auth_data["user"]
    print(f"   -> User created: {user['name']}, Pace: {user['learning_pace']}, Level: {user['level']}")

    headers = {"Authorization": f"Bearer {token}"}

    print("4. Testing /api/me endpoint...")
    res = client.get("/api/me", headers=headers)
    assert res.status_code == 200, f"Me failed: {res.text}"
    me_data = res.json()
    assert "user" in me_data and "session" in me_data and "stats" in me_data
    print(f"   -> Session config: {me_data['session']['session_minutes']} mins, Break: {me_data['session']['break_minutes']} mins")

    print("5. Testing document upload & concept extraction...")
    sample_text = (
        "Chapter 1: Percentages and Ratios\n"
        "A percentage is a number or ratio expressed as a fraction of 100.\n"
        "To find x% of y, calculate (x * y) / 100.\n\n"
        "Chapter 2: Time, Speed and Distance\n"
        "Speed is distance divided by time (S = D / T).\n"
        "When trains cross each other in opposite directions, add relative speeds.\n\n"
        "Chapter 3: Profit and Loss\n"
        "Profit = Selling Price - Cost Price. Profit percentage is calculated on Cost Price."
    )
    files = {"file": ("aptitude_sample.txt", io.BytesIO(sample_text.encode("utf-8")), "text/plain")}
    data = {"deadline_days": "3"}
    res = client.post("/api/plans/upload", headers=headers, data=data, files=files)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    plan = res.json()
    plan_id = plan["id"]
    concepts = plan["concepts"]
    print(f"   -> Plan created: ID={plan_id}, Title='{plan['title']}', {len(concepts)} concepts extracted")
    assert len(concepts) > 0, "No concepts extracted"

    print("6. Testing multi-mode explanation (English & Tamil)...")
    cid = concepts[0]["id"]
    res_en = client.get(f"/api/plans/{plan_id}/concepts/{cid}/explain?language=english", headers=headers)
    assert res_en.status_code == 200, f"Explain failed: {res_en.text}"
    exp_en = res_en.json()
    assert "simple" in exp_en and "example" in exp_en and "diagram" in exp_en

    res_ta = client.get(f"/api/plans/{plan_id}/concepts/{cid}/explain?language=tamil", headers=headers)
    assert res_ta.status_code == 200, f"Tamil explain failed: {res_ta.text}"
    exp_ta = res_ta.json()
    print(f"   -> Concept '{exp_en['title']}' loaded with modes: {exp_en.get('modes')}")

    print("7. Testing 'Explain Again' mode rotation...")
    res_again = client.post(f"/api/plans/{plan_id}/concepts/{cid}/explain-again", headers=headers)
    assert res_again.status_code == 200, f"Explain again failed: {res_again.text}"

    print("8. Testing understanding check (MCQ + own words)...")
    check_payload = {
        "mcq": {"mcq1": 0, "scenario": 0},
        "own_words": "Percentage is the fraction out of 100, connecting given values to find unknown parts with shortcut estimation.",
    }
    res_check = client.post(f"/api/plans/{plan_id}/concepts/{cid}/check", headers=headers, json=check_payload)
    assert res_check.status_code == 200, f"Check failed: {res_check.text}"
    check_res = res_check.json()
    print(f"   -> Result: understood={check_res['understood']}, score={check_res['score']}, XP={check_res['xp']}")
    assert check_res["understood"] is True

    print("9. Testing focus game run logging...")
    game_payload = {
        "game": "focus-quest",
        "accuracy": 0.92,
        "reaction_ms": 650,
        "mistakes": 1,
        "score": 95,
    }
    res_game = client.post("/api/games/complete", headers=headers, json=game_payload)
    assert res_game.status_code == 200, f"Game failed: {res_game.text}"
    game_res = res_game.json()
    print(f"   -> Focus Profile calibrated: Sustained={game_res['profile']['sustained_attention']}, Memory={game_res['profile']['working_memory']}")

    print("10. Testing progress & leaderboard...")
    res_prog = client.get("/api/progress", headers=headers)
    assert res_prog.status_code == 200
    prog_data = res_prog.json()
    print(f"   -> Progress: Level={prog_data['level']}, Mastered={prog_data['concepts_mastered']}, Badges={len(prog_data['badges'])}")

    res_lead = client.get("/api/progress/leaderboard", headers=headers)
    assert res_lead.status_code == 200
    lead_entries = res_lead.json()["entries"]
    assert len(lead_entries) > 0
    print(f"   -> Leaderboard: {len(lead_entries)} learners listed, Top: {lead_entries[0]['name']}")

    print("11. Testing PDF notes generation...")
    res_pdf = client.get(f"/api/plans/{plan_id}/notes.pdf", headers=headers)
    assert res_pdf.status_code == 200, f"PDF failed: {res_pdf.text}"
    assert len(res_pdf.content) > 500, "PDF content too small"
    print(f"   -> PDF generated successfully ({len(res_pdf.content)} bytes)")

    print("\n[SUCCESS] ALL 11 END-TO-END TESTS PASSED PERFECTLY!")


if __name__ == "__main__":
    test_e2e_flow()
