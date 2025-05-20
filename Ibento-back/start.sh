#!/bin/bash
uvicorn backend.backend.asgi:application --host 0.0.0.0 --port 10000
