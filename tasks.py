# tasks.py
from invoke import task
import os

@task
def serve(c, port=3000):
    """
    Serve ./public at given port using node server.js
    Usage: invoke serve --port=3000
    """
    # if server.js doesn't exist, create it? we assume it's present per previous step
    c.run(f"node server.js", pty=True)
