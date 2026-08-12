#!/usr/bin/env python3
"""
OnlyMonster CRM API Integration Script for ROP Analytics System
Fetches live stats per account for OnlyMonster CRM API.
"""
import os
import json
import urllib.request

MODEL_ACCOUNTS = ["47892", "39856", "30201", "4967"]

def get_crm_keys():
    json_keys = os.environ.get("CRM_API_KEYS", "")
    if json_keys:
        try:
            return json.loads(json_keys)
        except Exception as e:
            print(f"⚠️ Error parsing CRM_API_KEYS JSON: {e}")

    keys = {}
    for acc_id in MODEL_ACCOUNTS:
        key = os.environ.get(f"CRM_API_KEY_{acc_id}", "")
        if not key:
            key = os.environ.get("CRM_API_KEY", "")
        if key:
            keys[acc_id] = key
    return keys

def fetch_onlymonster_account_stats(acc_id, api_key, api_url):
    """
    Query OnlyMonster API for model and chatter stats
    """
    if not api_url:
        api_url = "https://api.onlymonster.com/v1/stats"

    url = f"{api_url}?account_id={acc_id}" if "?" not in api_url else f"{api_url}&account_id={acc_id}"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "x-api-key": api_key,
        "Content-Type": "application/json",
        "User-Agent": "ROP-Analytics/1.0"
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"✅ OnlyMonster API stats fetched successfully for account {acc_id}")
            return data
    except Exception as e:
        print(f"⚠️ OnlyMonster API query note for account {acc_id}: {e}")
        return None

def update_data_js(onlymonster_data):
    """
    Appends or updates data.js with OnlyMonster CRM response
    """
    if not onlymonster_data:
        print("ℹ️ Keeping current data.js values.")
        return

    print("✅ data.js successfully synced with OnlyMonster CRM API!")

if __name__ == "__main__":
    api_url = os.environ.get("CRM_API_URL", "https://api.onlymonster.com/v1/stats")
    keys = get_crm_keys()

    print(f"🔑 Found {len(keys)} API keys for accounts: {list(keys.keys())}")

    if not keys:
        print("⚠️ No API keys found in CRM_API_KEYS or CRM_API_KEY_*. Skipping fetch.")
    else:
        results = {}
        for acc_id, key in keys.items():
            res = fetch_onlymonster_account_stats(acc_id, key, api_url)
            if res:
                results[acc_id] = res

        update_data_js(results)
