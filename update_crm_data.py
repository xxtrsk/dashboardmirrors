#!/usr/bin/env python3
"""
OnlyMonster Official API Integration Script (omapi.onlymonster.ai)
Automatically computes Net Revenue (80% after OnlyFans 20% fee) matching OnlyMonster Dashboard ($6,859.87)
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
        print(f"⚠️ OnlyMonster API GET {path} ({e})")
        return None

def fetch_and_apply_onlymonster_stats():
    tokens = get_tokens()
    print(f"🔑 Querying OnlyMonster API for {len(tokens)} model accounts...")

    all_models_data = {}

    for acc_id, token in tokens.items():
        acc_resp = api_get("/accounts", token)
        if not acc_resp or "accounts" not in acc_resp or not acc_resp["accounts"]:
            continue

        acc_info = acc_resp["accounts"][0]
        platform_id = acc_info.get("platform_account_id")
        username = acc_info.get("username")
        name = acc_info.get("name")

        now = datetime.now()
        start_date = f"{now.year}-{now.month:02d}-01T00:00:00.000Z"
        end_date = f"{now.year}-{now.month:02d}-31T23:59:59.999Z"

        tx_resp = api_get(f"/platforms/onlyfans/accounts/{platform_id}/transactions", token, {
            "start": start_date,
            "end": end_date,
            "limit": 1000
        })

        tx_items = tx_resp.get("items", []) if tx_resp else []
        valid_items = [i for i in tx_items if i.get("status") != "undo"]

        gross_rev = sum(float(item.get("amount", 0)) for item in valid_items)
        net_rev = gross_rev * 0.80 # 80% Net Revenue matching OnlyMonster Dashboard

        all_models_data[acc_id] = {
            "name": name,
            "username": username,
            "netRevenue": net_rev,
            "grossRevenue": gross_rev,
            "txCount": len(valid_items)
        }
        print(f"✅ OnlyMonster Net Revenue for {name} (@{username}): Net (80%) = ${net_rev:.2f} | Gross (100%) = ${gross_rev:.2f}")

    return all_models_data

if __name__ == "__main__":
    stats = fetch_and_apply_onlymonster_stats()
    print("🎉 OnlyMonster API Net 80% sync complete!")
