#!/usr/bin/env python3
"""
OnlyMonster Official API Integration Script (omapi.onlymonster.ai)
Supports both Model Account Transactions and Chatter / User Metrics (/api/v0/users/metrics)
"""
import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

MODEL_TOKENS = {
    "47892": "om_token_a2ec19c757f9112b75af9489bde2722f27cad1f612261057afa7fee984703aef", # 1lollyhere
    "39856": "om_token_e64d4bf60b9ba22dae18e46f6873b9567f5e4033be8493958239c0e83b3ee7ec", # lollysunnery
    "30201": "om_token_b2991eded93e1dbb991f2b2d10fab0aa5fbf163374a8c81cb5ca426ad8ed543d", # evablush
    "4967":  "om_token_4ece7637ad9aef7848c5850695628bfff22951ffc1fd36b7970109c172bc2a1a"  # angelkisss
}

BASE_URL = "https://omapi.onlymonster.ai/api/v0"

def get_tokens():
    json_keys = os.environ.get("CRM_API_KEYS", "")
    if json_keys:
        try:
            return json.loads(json_keys)
        except Exception:
            pass

    tokens = {}
    for acc_id, default_token in MODEL_TOKENS.items():
        env_token = os.environ.get(f"CRM_API_KEY_{acc_id}", "") or os.environ.get("CRM_API_KEY", "")
        tokens[acc_id] = env_token if env_token else default_token
    return tokens

def api_get(path, token, params=None):
    url = f"{BASE_URL}{path}"
    if params:
        query_str = urllib.parse.urlencode(params)
        url += f"?{query_str}"

    headers = {
        "x-om-auth-token": token,
        "Accept": "*/*",
        "User-Agent": "ROP-Analytics/1.0"
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"⚠️ OnlyMonster API GET {path}: {e}")
        return None

def fetch_and_apply_onlymonster_stats():
    tokens = get_tokens()
    print(f"🔑 Querying OnlyMonster API for {len(tokens)} model accounts & chatter metrics...")

    now = datetime.now()
    start_date = f"{now.year}-{now.month:02d}-01T00:00:00.000Z"
    end_date = f"{now.year}-{now.month:02d}-31T23:59:59.999Z"

    # Query individual Chatter User Metrics from OnlyMonster
    for acc_id, token in tokens.items():
        user_metrics = api_get("/users/metrics", token, {
            "from": start_date,
            "to": end_date,
            "limit": 100
        })
        if user_metrics and "items" in user_metrics:
            print(f"✅ OnlyMonster Chatter Metrics retrieved for account {acc_id}: {len(user_metrics['items'])} items")

if __name__ == "__main__":
    fetch_and_apply_onlymonster_stats()
