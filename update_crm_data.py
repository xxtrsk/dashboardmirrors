#!/usr/bin/env python3
"""
Script to fetch stats from CRM API every 8 hours and update data.js
"""
import os
import json
import urllib.request

CRM_API_KEY = os.environ.get("CRM_API_KEY", "")
CRM_API_URL = os.environ.get("CRM_API_URL", "")

def fetch_crm_data():
    if not CRM_API_KEY or not CRM_API_URL:
        print("⚠️ CRM_API_KEY or CRM_API_URL not set in secrets. Skipping API fetch.")
        return None

    try:
        req = urllib.request.Request(
            CRM_API_URL,
            headers={
                "Authorization": f"Bearer {CRM_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("✅ CRM data successfully fetched from API!")
            return data
    except Exception as e:
        print(f"❌ Error fetching CRM data: {e}")
        return None

if __name__ == "__main__":
    fetch_crm_data()
