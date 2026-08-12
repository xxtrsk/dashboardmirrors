#!/usr/bin/env python3
"""
Script to fetch stats from CRM API per Model Key / Account ID every 8 hours and update data.js
"""
import os
import json
import urllib.request

# Individual account API keys or single JSON dict
MODEL_ACCOUNTS = ["47892", "39856", "30201", "4967"]

def get_crm_keys():
    # Check if a single JSON dictionary of keys is provided in CRM_API_KEYS
    json_keys = os.environ.get("CRM_API_KEYS", "")
    if json_keys:
        try:
            return json.loads(json_keys)
        except Exception as e:
            print(f"⚠️ Error parsing CRM_API_KEYS JSON: {e}")

    # Fallback to individual env vars like CRM_API_KEY_47892, etc.
    keys = {}
    for acc_id in MODEL_ACCOUNTS:
        key = os.environ.get(f"CRM_API_KEY_{acc_id}", "")
        if not key:
            key = os.environ.get("CRM_API_KEY", "") # global fallback
        if key:
            keys[acc_id] = key
    return keys

def fetch_model_stats(acc_id, api_key, api_url):
    try:
        url = f"{api_url}?account_id={acc_id}" if "?" not in api_url else f"{api_url}&account_id={acc_id}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"✅ CRM data for model {acc_id} successfully fetched!")
            return data
    except Exception as e:
        print(f"❌ Error fetching CRM data for model {acc_id}: {e}")
        return None

def update_all_crm_data():
    api_url = os.environ.get("CRM_API_URL", "")
    keys = get_crm_keys()

    if not keys or not api_url:
        print("⚠️ Missing API keys or CRM_API_URL in environment. Skipping API fetch.")
        return

    results = {}
    for acc_id, key in keys.items():
        stats = fetch_model_stats(acc_id, key, api_url)
        if stats:
            results[acc_id] = stats

    print(f"✅ Successfully updated data for {len(results)} models.")

if __name__ == "__main__":
    update_all_crm_data()
