"""Shared rate limiter instance, keyed by client IP.

In-memory storage is fine for a single-instance MVP deployment; swap the
storage_uri for a Redis-backed limiter before running multiple backend
replicas, since in-memory counters aren't shared across processes.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
