from flask import Flask, render_template, request, jsonify
import sqlite3
import os
import random

app = Flask(__name__)

DATABASE = "/app/database/kindness.db"


# =========================
# DATABASE
# =========================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            major TEXT NOT NULL,
            sentence TEXT NOT NULL,
            leaf_number INTEGER NOT NULL UNIQUE,
            position_x REAL NOT NULL,
            position_y REAL NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# =========================
# HOME
# =========================

@app.route("/")
def index():

    conn = get_db()

    messages = conn.execute(
        "SELECT * FROM messages ORDER BY id"
    ).fetchall()

    conn.close()

    return render_template(
        "index.html",
        messages=messages
    )


# =========================
# GET MESSAGES
# =========================

@app.route("/messages", methods=["GET"])
def get_messages():

    conn = get_db()

    messages = conn.execute(
        "SELECT * FROM messages ORDER BY id"
    ).fetchall()

    conn.close()

    return jsonify([
        {
            "id": message["id"],
            "name": message["name"],
            "major": message["major"],
            "sentence": message["sentence"],
            "leaf_number": message["leaf_number"],
            "position_x": message["position_x"],
            "position_y": message["position_y"]
        }
        for message in messages
    ])


# =========================
# ADD MESSAGE
# =========================

@app.route("/submit", methods=["POST"])
def submit():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "No data received."
        }), 400


    name = data.get("name", "").strip()
    major = data.get("major", "").strip()
    sentence = data.get("sentence", "").strip()


    # -------------------------
    # VALIDATION
    # -------------------------

    if not name:

        return jsonify({
            "success": False,
            "error": "Please enter your name."
        }), 400


    if not major:

        return jsonify({
            "success": False,
            "error": "Please enter your major."
        }), 400


    if not sentence:

        return jsonify({
            "success": False,
            "error": "Please write a sentence."
        }), 400


    if len(name) > 100:

        return jsonify({
            "success": False,
            "error": "Name is too long."
        }), 400


    if len(major) > 100:

        return jsonify({
            "success": False,
            "error": "Major is too long."
        }), 400


    if len(sentence) > 300:

        return jsonify({
            "success": False,
            "error": "Sentence is too long."
        }), 400


    # -------------------------
    # FIND NEW LEAF NUMBER
    # -------------------------

    conn = get_db()

    existing_numbers = conn.execute(
        "SELECT leaf_number FROM messages"
    ).fetchall()

    used_numbers = {
        row["leaf_number"]
        for row in existing_numbers
    }


    leaf_number = 1

    while leaf_number in used_numbers:
        leaf_number += 1


    # -------------------------
    # RANDOM POSITION
    # -------------------------

    # Keep leaves away from the very edges
    # and away from the title.

    position_x = random.uniform(12, 88)
    position_y = random.uniform(20, 75)


    # -------------------------
    # SAVE
    # -------------------------

    try:

        cursor = conn.execute("""
            INSERT INTO messages
            (
                name,
                major,
                sentence,
                leaf_number,
                position_x,
                position_y
            )

            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            name,
            major,
            sentence,
            leaf_number,
            position_x,
            position_y
        ))

        conn.commit()

        message_id = cursor.lastrowid


    except sqlite3.Error:

        conn.close()

        return jsonify({
            "success": False,
            "error": "Could not save your message."
        }), 500


    conn.close()


    return jsonify({

        "success": True,

        "message": {

            "id": message_id,

            "name": name,

            "major": major,

            "sentence": sentence,

            "leaf_number": leaf_number,

            "position_x": position_x,

            "position_y": position_y

        }

    })


# =========================
# START
# =========================

init_db()


if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
