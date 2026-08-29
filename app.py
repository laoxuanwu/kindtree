from flask import Flask, render_template, request, jsonify
import sqlite3
import os

app = Flask(__name__)

DATABASE = "kindness.db"


# -------------------------
# DATABASE
# -------------------------

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
            leaf_number INTEGER NOT NULL UNIQUE
        )
    """)

    conn.commit()
    conn.close()


# -------------------------
# HOME PAGE
# -------------------------

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


# -------------------------
# GET ALL MESSAGES
# -------------------------

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
            "leaf_number": message["leaf_number"]
        }
        for message in messages
    ])


# -------------------------
# ADD NEW MESSAGE
# -------------------------

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
    leaf_number = data.get("leaf_number")

    # Basic validation
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

    if leaf_number is None:
        return jsonify({
            "success": False,
            "error": "Please choose a leaf."
        }), 400

    try:
        leaf_number = int(leaf_number)
    except ValueError:
        return jsonify({
            "success": False,
            "error": "Invalid leaf."
        }), 400

    # Limit text length
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

    conn = get_db()

    # Make sure this leaf is still empty
    existing = conn.execute(
        "SELECT id FROM messages WHERE leaf_number = ?",
        (leaf_number,)
    ).fetchone()

    if existing:
        conn.close()

        return jsonify({
            "success": False,
            "error": "This leaf has already been used."
        }), 409

    try:
        cursor = conn.execute("""
            INSERT INTO messages
            (name, major, sentence, leaf_number)
            VALUES (?, ?, ?, ?)
        """, (
            name,
            major,
            sentence,
            leaf_number
        ))

        conn.commit()

        message_id = cursor.lastrowid

    except sqlite3.IntegrityError:
        conn.close()

        return jsonify({
            "success": False,
            "error": "This leaf has already been used."
        }), 409

    conn.close()

    return jsonify({
        "success": True,
        "message": {
            "id": message_id,
            "name": name,
            "major": major,
            "sentence": sentence,
            "leaf_number": leaf_number
        }
    })


# -------------------------
# START
# -------------------------

init_db()


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )