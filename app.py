from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import os
import time

load_dotenv()

app = Flask(__name__)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate-plan", methods=["POST"])
def generate_plan():

    data = request.get_json()

    task = data.get("task", "")
    duration = data.get("duration", 25)

    prompt = f"""
Create a practical focus plan for a student.

Goal: {task}
Time: {duration} minutes

Return the actual study plan in this format:

PLAN: one short sentence describing the overall approach.

TASKS:
1. first specific task
2. second specific task
3. third specific task

RESOURCES:
- one useful resource and its purpose
- one useful resource and its purpose

Use actual tasks and resources related to the goal.
Keep the answer short.
"""

    start_time = time.time()

    response = client.models.generate_content(
        model="gemma-4-26b-a4b-it",
        contents=prompt
    )

    end_time = time.time()

    print(
        f"AI generation time: "
        f"{end_time - start_time:.2f} seconds"
    )

    plan = response.text

    if not plan:
        plan = "Unable to generate an AI focus plan. Please try again."

    return jsonify({
        "plan": plan
    })


if __name__ == "__main__":
    app.run(debug=True)