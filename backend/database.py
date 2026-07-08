import os
import sqlite3
import logging

logger = logging.getLogger("cybersentinel")

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_connection():
    """
    Returns a database connection.
    Uses PostgreSQL if DATABASE_URL is set,
    otherwise falls back to SQLite for local dev.
    """
    if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
        import psycopg2
        import psycopg2.extras
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn, "postgres"
    else:
        db_path = os.path.join(
            os.path.dirname(__file__), "users.db"
        )
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"


def execute_query(conn, db_type, query, params=None):
    """
    Executes a query on either PostgreSQL or SQLite.
    Handles placeholder differences:
    SQLite uses ? while PostgreSQL uses %s
    """
    if db_type == "postgres":
        query = query.replace("?", "%s")
        cursor = conn.cursor(
            cursor_factory=__import__(
                "psycopg2.extras",
                fromlist=["RealDictCursor"]
            ).RealDictCursor
        )
    else:
        cursor = conn.cursor()

    if params:
        cursor.execute(query, params)
    else:
        cursor.execute(query)

    return cursor


def fetchall_as_dicts(cursor, db_type):
    """
    Returns all rows as list of dicts
    regardless of database type.
    """
    rows = cursor.fetchall()
    if db_type == "postgres":
        return [dict(r) for r in rows]
    else:
        return [dict(r) for r in rows]


def fetchone_as_dict(cursor, db_type):
    """
    Returns one row as dict regardless
    of database type.
    """
    row = cursor.fetchone()
    if row is None:
        return None
    return dict(row)


def init_db():
    """
    Creates all tables if they do not exist.
    Works for both PostgreSQL and SQLite.
    """
    conn, db_type = get_connection()
    try:
        if db_type == "postgres":
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS email_scans (
                    scan_id SERIAL PRIMARY KEY,
                    user_email TEXT,
                    input_summary TEXT,
                    prediction TEXT,
                    confidence REAL,
                    threats TEXT,
                    links_found INTEGER DEFAULT 0,
                    scanned_at TIMESTAMP
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS url_scans (
                    scan_id SERIAL PRIMARY KEY,
                    user_email TEXT,
                    url_scanned TEXT,
                    result TEXT,
                    score INTEGER,
                    confidence REAL,
                    scanned_at TIMESTAMP
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS file_scans (
                    scan_id SERIAL PRIMARY KEY,
                    user_email TEXT,
                    filename TEXT,
                    sha256_hash TEXT,
                    verdict TEXT,
                    malicious_count INTEGER DEFAULT 0,
                    total_engines INTEGER DEFAULT 0,
                    file_deleted BOOLEAN DEFAULT TRUE,
                    scanned_at TIMESTAMP
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()
            logger.info(
                "PostgreSQL tables initialized successfully"
            )

        else:
            # SQLite initialization (existing behavior)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                ALTER TABLE users
                ADD COLUMN created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP
            """) if False else None

            conn.execute("""
                CREATE TABLE IF NOT EXISTS email_scans (
                    scan_id INTEGER PRIMARY KEY
                        AUTOINCREMENT,
                    user_email TEXT,
                    input_summary TEXT,
                    prediction TEXT,
                    confidence REAL,
                    threats TEXT,
                    links_found INTEGER DEFAULT 0,
                    scanned_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS url_scans (
                    scan_id INTEGER PRIMARY KEY
                        AUTOINCREMENT,
                    user_email TEXT,
                    url_scanned TEXT,
                    result TEXT,
                    score INTEGER,
                    confidence REAL,
                    scanned_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS file_scans (
                    scan_id INTEGER PRIMARY KEY
                        AUTOINCREMENT,
                    user_email TEXT,
                    filename TEXT,
                    sha256_hash TEXT,
                    verdict TEXT,
                    malicious_count INTEGER DEFAULT 0,
                    total_engines INTEGER DEFAULT 0,
                    file_deleted BOOLEAN DEFAULT 1,
                    scanned_at DATETIME
                        DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()
            logger.info(
                "SQLite tables initialized successfully"
            )

    except Exception as e:
        logger.error(f"Database init error: {e}")
        conn.rollback()
        raise e
    finally:
        conn.close()
