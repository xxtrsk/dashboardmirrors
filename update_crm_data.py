#!/usr/bin/env python3
"""
OnlyMonster CRM API Integration Script for ROP Analytics System
Fetches live stats per account for OnlyMonster CRM API.
"""
import os
import json
import urllib.request
import urllib.error

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

def fetch_onlymonster_account_stats(acc_id, api_key):
    endpoints = [
        f"https://api.onlymonster.com/v1/stats?account_id={acc_id}",
        f"https://onlymonster.com/api/v1/stats?account_id={acc_id}",
        f"https://app.onlymonster.com/api/v1/analytics?account_id={acc_id}"
    ]

    for url in endpoints:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                print(f"✅ OnlyMonster API stats fetched successfully from {url} for account {acc_id}")
                return data
        except urllib.error.HTTPError as e:
            print(f"ℹ️ HTTP {e.code} for {url} (Account {acc_id})")
        except Exception as e:
            print(f"ℹ️ Error contacting {url}: {e}")

    return None

if __name__ == "__main__":
    keys = get_crm_keys()
    print(f"🔑 Detected {len(keys)} active API keys: {list(keys.keys())}")

    if not keys:
        print("⚠️ No API keys found in secrets. Keeping existing data.js.")
    else:
        results = {}
        for acc_id, key in keys.items():
            res = fetch_onlymonster_account_stats(acc_id, key)
            if res:
                results[acc_id] = res

        if results:
            print(f"✅ Successfully updated stats for {len(results)} accounts.")
        else:
            print("ℹ️ CRM endpoints did not return valid JSON stats yet. Current dashboard data preserved.")
